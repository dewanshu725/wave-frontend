import { NgxMasonryOptions } from 'ngx-masonry';
import { isVueConverseDisable, locationName, timeSince } from 'src/app/_helpers/functions.utils';
import { UserDataService } from './../../../../../_services/user-data.service';
import { LINK_PREVIEW, INTEREST_KEYWORD, PAGE_INFO, USER_PREFERENCE } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { VUE_SAVED } from './../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';

@Component({
  selector: 'app-vue-save',
  templateUrl: './vue-save.component.html',
  styleUrls: ['./vue-save.component.scss']
})
export class VueSaveComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService: AppDataShareService,
    private graphqlService: GraphqlService,
    private userDataService: UserDataService
    ) { }

  appContainerHeight:string;
  appRightContainerWidth:string;
  vue_backgorund_url:string;
  vueDisplayContext = 'savedvue';

  loading = true;

  vueError = false;
  vueEmpty:boolean;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueSavedLength = 5;
  vueSavedArray:LINK_PREVIEW[] = [];
  isVueSavedFetching = false;

  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelected = false;
  noMatchFound = false;

  masonryLoading = true;

  scrollEndUnsub:Subscription;
  selectedInterestUnsub:Subscription;

  @Output() reInitVueSaved = new EventEmitter();

  masonryOption: NgxMasonryOptions = {
    gutter: 80,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';
    this.appRightContainerWidth = (this.appDataShareService.appRightContainerWidth - 20) + 'px';
    this.vue_backgorund_url = this.appDataShareService.vue_background;
    this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
    this.appDataShareService.vueSavedPageInfo ? this.fetchMore = this.appDataShareService.vueSavedPageInfo.hasNextPage : null;

    if (this.appDataShareService.vueSavedArray.length >= this.vueSavedLength){
      this.arrangeVueSavedArray();
      this.loading = false;
      this.vueEmpty = false;
      this.noMatch();
    }
    else if (this.appDataShareService.vueSavedArray.length > 0 && this.appDataShareService.vueSavedArray.length < this.vueSavedLength){
      this.arrangeVueSavedArray();
      this.loading = false;
      this.vueEmpty = false;
      this.noMatch();
      this.fetchMore ? this.getVueSaved(true) : null;
    }
    else{
      this.getVueSaved();
    }

    this.scrollEndUnsub = this.appDataShareService.scrollEndReached()
    .subscribe(result => {
      if (this.fetchMore && !this.interestSelected && !this.isVueSavedFetching){
        this.isVueSavedFetching = true;
        this.getVueSaved(true);
      }
    });

    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest()
    .subscribe(result =>{
      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeVueSavedArray();
      this.noMatch();
    });
  }

  getVueSaved(fetchMore=false){
    if (!fetchMore){
      this.vueError = false;
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
          'first':this.vueSavedLength,
          'after':this.appDataShareService.vueSavedPageInfo ? this.appDataShareService.vueSavedPageInfo.endCursor : ""
        }

        this.graphqlService.graphqlQuery({query:VUE_SAVED, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.vueSaved === null || result.data.vueSaved.edges.length === 0){
              if (!fetchMore){
                this.vueEmpty = true;
                this.loading = false;
              }
              else{
                this.fetchMoreLoading = false;
                this.fetchMoreError = true;
              }
            }
            else{
              this.createVueArray(result.data.vueSaved.pageInfo, result.data.vueSaved.edges);
            }
          },
          error =>{
            if (!fetchMore){
              this.loading = false;
              this.vueError = true;
              this.masonryLoading = false;
            }
            else{
              this.fetchMoreLoading = false;
              this.fetchMoreError = true;
              this.masonryLoading = false;
            }
          }
        )
      }
      else{
        if (!fetchMore){
          this.loading = false;
          this.vueError = true;
          this.masonryLoading = false;
        }
        else{
          this.fetchMoreLoading = false;
          this.fetchMoreError = true;
          this.isVueSavedFetching = false;
          this.masonryLoading = false;
        }
      }
    })();
  }

  createVueArray(pageInfo:PAGE_INFO, vueSaved){
    this.appDataShareService.vueSavedPageInfo = pageInfo;
    this.fetchMore = this.appDataShareService.vueSavedPageInfo.hasNextPage;
    const user_obj = this.userDataService.getItem({userObject:true}).userObject;
    const userPreference:USER_PREFERENCE = {
      country: user_obj.location.country_name,
      region: user_obj.location.region,
      institution:user_obj.institution === null ? null : {uid: user_obj.institution.uid, name: user_obj.institution.name},
      locationPreference: user_obj.locationPreference,
      agePreference: user_obj.agePreference,
      conversationPoints: user_obj.conversationPoints,
      age: user_obj.age
    }

    let lastItemSame = false;
    console.log("running");

    vueSaved.forEach(element => {
      const vueSavedArray = this.appDataShareService.vueSavedArray;
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      let conversation_disabled = false;
      const author_preference:USER_PREFERENCE = {
        country: element.node.vue.country,
        region: element.node.vue.region,
        institution: {uid: element.node.vue.institution},
        locationPreference: element.node.vue.locationPreference,
        conversationPoints: element.node.vue.conversationPoint,
        agePreference: element.node.vue.agePreference,
        age: element.node.vue.age
      }

      if (vueSavedArray.length > 0 && this.appDataShareService.vueSavedArrayUpdated){
        console.log(this.appDataShareService.vueSavedArrayUpdated);
        let sameElement = false;

        for (let vueSavedElement of vueSavedArray){
          if (vueSavedElement.vue_feed_id === element.node.id){
            console.log('same');
            vueSavedElement.cursor = element.cursor;
            sameElement = true;
            break;
          }
        }

        if (sameElement){
          if (vueSaved[vueSaved.length - 1].node.id === element.node.id){
            lastItemSame = true;
            console.log('last riched');
          }

          return;
        }
      }

      element.node.vue.vueinterestSet.edges.forEach(interest => {
        vue_interest_tags.push({
          id: interest.node.interestKeyword.id,
          name: interest.node.interestKeyword.word
        });
      });

      if (element.node.vue.conversationDisabled || element.node.vue.vuestudentsSet.edges[0].node.conversationStarted){
        conversation_disabled = true;
      }
      else{
        conversation_disabled = !isVueConverseDisable(userPreference, author_preference);
      }

      vueSavedArray.push({
        vue_feed_id: element.node.id,
        id: element.node.vue.id,
        image: element.node.vue.image,
        image_height: element.node.vue.imageHeight,
        truncated_title: element.node.vue.truncatedTitle,
        url: element.node.vue.url,
        domain_name: element.node.vue.domainName,
        site_name: element.node.vue.siteName,
        description: element.node.vue.description,
        interest_keyword: vue_interest_tags,
        created: element.node.vue.create,
        friendly_date: timeSince(new Date(element.node.vue.create)),
        location: locationName(userPreference, author_preference),
        age: element.node.vue.age,
        conversation_disabled: conversation_disabled,
        conversation_started: element.node.vue.vuestudentsSet.edges[0].node.conversationStarted,
        cursor: element.cursor,
        user_opened: element.node.opened,
        user_saved: true
      });
    });

    this.appDataShareService.vueSavedArrayUpdated = false;
    lastItemSame === false ? this.arrangeVueSavedArray() : this.getVueSaved(true);
    this.loading = false;
    this.vueEmpty = false;
    this.noMatch();
  }

  arrangeVueSavedArray(){
    if (this.selectedInterest.length === 0){
      this.vueSavedArray = this.appDataShareService.vueSavedArray;
      this.interestSelected = false;
    }
    else{
      this.vueSavedArray = [];
      const selectedInterestLength = this.selectedInterest.length;
      this.appDataShareService.vueSavedArray.forEach(element => {
        let interestMatch = 0;
        element.interest_keyword.forEach(element_interest => {
          this.selectedInterest.forEach(selected_interest => {
            if (element_interest.id === selected_interest.id){
              interestMatch += 1;
              return;
            }
          });
        });
        selectedInterestLength === interestMatch ? this.vueSavedArray.push(element) : null;
      });
      this.interestSelected = true;
    }
  }

  updateVueLayout(id){
    const objIndex = this.appDataShareService.vueSavedArray.findIndex(obj => obj.id === id);
    if (objIndex > -1) {
      this.appDataShareService.vueSavedArray.splice(objIndex, 1);
    }

    const objIndex2 = this.vueSavedArray.findIndex(obj => obj.id === id);
    if (objIndex2 > -1) {
      this.vueSavedArray.splice(objIndex2, 1);
    }

    if (this.appDataShareService.vueSavedArray.length < this.vueSavedLength && this.fetchMore){
      this.reInitVueSaved.emit(true);
    }
  }

  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.isVueSavedFetching = false;
    this.masonryLoading = false;
  }

  noMatch(){
    if (!this.loading && !this.vueError && !this.vueEmpty && this.vueSavedArray.length === 0){
      this.noMatchFound = true;
    }
    else{
      this.noMatchFound = false;
    }
  }

  ngOnDestroy(){
    if (this.scrollEndUnsub) this.scrollEndUnsub.unsubscribe();
    if (this.selectedInterestUnsub) this.selectedInterestUnsub.unsubscribe();
    this.appDataShareService.isVueConstructed.next(false);
  }

}
