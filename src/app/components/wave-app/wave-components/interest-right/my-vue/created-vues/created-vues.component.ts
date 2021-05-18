import { LINK_PREVIEW, INTEREST_KEYWORD, PAGE_INFO } from './../../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MY_VUE } from './../../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../../_services/graphql.service';
import { AppDataShareService } from './../../../../../../_services/app-data-share.service';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { abbreviateNumber, timeSince } from 'src/app/_helpers/functions.utils';
import { NgxMasonryOptions } from 'ngx-masonry';

@Component({
  selector: 'app-created-vues',
  templateUrl: './created-vues.component.html',
  styleUrls: ['./created-vues.component.scss']
})
export class CreatedVuesComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private graphqlService:GraphqlService
    ) { }

  @Output() createVueRequest = new EventEmitter();
  @Output() myVueEmptyEvent = new EventEmitter();
  @Output() myVueArrayLength = new EventEmitter();
  @Output() reInitCreatedVue = new EventEmitter();

  loading = true;
  masonryLoading = true;
  appContainerHeight:string;
  appRightContainerWidth:string;

  myVueEmpty:boolean;
  myVueError = false;
  myVuefetchLength = 5;
  myVueDataArray:LINK_PREVIEW[] = [];
  isMyVueFetching = false;

  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelected = false;
  noMatchFound = false;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  scrollEndUnsub:Subscription;
  selectedInterestUnsub:Subscription;


  public masonryOption: NgxMasonryOptions = {
    gutter: 70,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';
    this.appRightContainerWidth = (this.appDataShareService.appRightContainerWidth - 20) + 'px';
    this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
    this.appDataShareService.myVuePageInfo ? this.fetchMore = this.appDataShareService.myVuePageInfo.hasNextPage : null;

    if (this.appDataShareService.myVueArray.length >= this.myVuefetchLength){
      this.arrangeMyVueArray();
      this.loading = false;
      this.myVueEmpty = false;
      this.myVueEmptyEvent.emit(false);
      this.noMatch();
    }
    else if (this.appDataShareService.myVueArray.length > 0 && this.appDataShareService.myVueArray.length < this.myVuefetchLength){
      this.arrangeMyVueArray();
      this.loading = false;
      this.myVueEmpty = false;
      this.myVueEmptyEvent.emit(false);
      this.noMatch();
      this.fetchMore ? this.getMyVue(true) : null;
    }
    else{
      this.getMyVue();
    }

    this.scrollEndUnsub = this.appDataShareService.scrollEndReached()
    .subscribe(result => {
      if (this.fetchMore && !this.interestSelected && !this.isMyVueFetching){
        this.isMyVueFetching = true;
        this.getMyVue(true);
      }
    });

    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest()
    .subscribe(result =>{
      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeMyVueArray();
      this.noMatch();
    });
  }

  getMyVue(fetchMore=false){
    if (!fetchMore){
      this.myVueError = false;
      this.loading = true;
    }
    else{
      this.fetchMoreLoading = true;
      this.fetchMoreError = false;
    }

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'first':this.myVuefetchLength,
          'after':this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:MY_VUE, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.allMyVue === null || result.data.allMyVue.edges.length === 0){
              if (!fetchMore){
                this.myVueEmpty = true;
                this.myVueEmptyEvent.emit(true);
                this.loading = false;
              }
              else{
                this.fetchMoreLoading = false;
                this.fetchMoreError = true;
              }
            }
            else{
              this.createMyVueDataArray(result.data.allMyVue.pageInfo, result.data.allMyVue.edges);
            }
          },
          error =>{
            if (!fetchMore){
              this.loading = false;
              this.myVueError = true;
              this.masonryLoading = false;
            }
            else{
              this.fetchMoreLoading = false;
              this.fetchMoreError = true;
              this.isMyVueFetching = false;
              this.masonryLoading = false;
            }
          }
        )
      }
      else{
        if (!fetchMore){
          this.loading = false;
          this.myVueError = true;
          this.masonryLoading = false;
        }
        else{
          this.fetchMoreLoading = false;
          this.fetchMoreError = true;
          this.isMyVueFetching = false;
          this.masonryLoading = false;
        }
      }
    })();
  }

  createMyVueDataArray(pageInfo:PAGE_INFO, allMyVueArray){
    this.appDataShareService.myVuePageInfo = pageInfo;
    this.fetchMore = this.appDataShareService.myVuePageInfo.hasNextPage;

    allMyVueArray.forEach(element => {
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      const myVueArray = this.appDataShareService.myVueArray;
      let vueOpenedCount = 0;
      let vueSavedCount = 0;

      /*
      if (myVueArray.length > 0){
        if (myVueArray[myVueArray.length - 1].id === element.node.id){
          return;
        }
      }
      */

      element.node.vueinterestSet.edges.forEach(interest => {
        vue_interest_tags.push({
          id: interest.node.interestKeyword.id,
          name: interest.node.interestKeyword.word,
          selected: false
        });
      });
      if (element.node.vuestudentsSet.edges.length != 0){
        element.node.vuestudentsSet.edges.forEach(studentCount => {
          studentCount.node.opened ? vueOpenedCount +=1 : null;
          studentCount.node.saved ? vueSavedCount +=1 : null;
        });
      }
      myVueArray.push({
        id: element.node.id,
        image: element.node.image,
        image_height: element.node.imageHeight,
        title: element.node.title,
        truncated_title: element.node.truncatedTitle,
        url: element.node.url,
        domain_name: element.node.domainName,
        site_name: element.node.siteName,
        description: element.node.description,
        interest_keyword: vue_interest_tags,
        conversation_disabled: element.node.conversationDisabled,
        created: element.node.create,
        friendly_date: timeSince(new Date(element.node.create)),
        viewed: abbreviateNumber(vueOpenedCount),
        saved: abbreviateNumber(vueSavedCount),
        cursor: element.cursor
      });
    });

    this.arrangeMyVueArray();
    this.loading = false;
    this.myVueEmpty = false;
    this.myVueEmptyEvent.emit(false);
    this.noMatch();
    //console.log(this.interestSelected);
  };

  arrangeMyVueArray(){
    if (this.selectedInterest.length === 0){
      this.myVueDataArray = this.appDataShareService.myVueArray;
      this.interestSelected = false;
    }
    else{
      this.myVueDataArray = [];
      const selectedInterestLength = this.selectedInterest.length;
      this.appDataShareService.myVueArray.forEach(element => {
        let interestMatch = 0;
        element.interest_keyword.forEach(element_interest => {
          this.selectedInterest.forEach(selected_interest => {
            if (element_interest.id === selected_interest.id){
              interestMatch += 1;
              return;
            }
          });
        });
        selectedInterestLength === interestMatch ? this.myVueDataArray.push(element) : null;
      });
      this.interestSelected = true;
    }

    this.myVueArrayLength.emit(this.myVueDataArray.length);

  }

  createVue(){
    this.createVueRequest.emit(true);
  }

  updateVueLayout(id){
    const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === id);
    if (objIndex > -1) {
      this.appDataShareService.myVueArray.splice(objIndex, 1);
    }

    const objIndex2 = this.myVueDataArray.findIndex(obj => obj.id === id);
    if (objIndex2 > -1) {
      this.myVueDataArray.splice(objIndex2, 1);
    }

    if (this.appDataShareService.myVueArray.length < this.myVuefetchLength && this.fetchMore){
      this.reInitCreatedVue.emit(true);
    }
    else{
      this.myVueEmptyEvent.emit(false)
    }

    this.myVueArrayLength.emit(this.myVueDataArray.length);
  }

  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.isMyVueFetching = false;
    this.masonryLoading = false;
  }

  noMatch(){
    if (!this.loading && !this.myVueError && !this.myVueEmpty && this.myVueDataArray.length === 0){
      this.noMatchFound = true;
    }
    else{
      this.noMatchFound = false;
    }
  }

  ngOnDestroy(){
   if (this.scrollEndUnsub) this.scrollEndUnsub.unsubscribe();
   if (this.selectedInterestUnsub) this.selectedInterestUnsub.unsubscribe();
  }

}
