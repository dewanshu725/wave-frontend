import { NgxMasonryOptions } from 'ngx-masonry';
import { isVueConverseDisable, locationName, timeSince } from 'src/app/_helpers/functions.utils';
import { UserDataService } from './../../../../../_services/user-data.service';
import { LINK_PREVIEW, INTEREST_KEYWORD, PAGE_INFO, USER_PREFERENCE } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { VUE_HISTORY } from './../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';

@Component({
  selector: 'app-vue-history',
  templateUrl: './vue-history.component.html',
  styleUrls: ['./vue-history.component.scss']
})
export class VueHistoryComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService: AppDataShareService,
    private graphqlService: GraphqlService,
    private userDataService: UserDataService
    ) { }

  appContainerHeight:string;
  appRightContainerWidth:string;
  vue_backgorund_url:string;
  vueDisplayContext = 'vuehistory';

  loading = true;

  vueError = false;
  vueEmpty:boolean;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueHistoryLength = 5;
  vueHistoryArray:LINK_PREVIEW[] = [];
  isVueHistoryFetching = false;

  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelected = false;
  noMatchFound = false;

  masonryLoading = true;

  scrollEndUnsub:Subscription;
  selectedInterestUnsub:Subscription;

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
    this.appDataShareService.vueHistoryPageInfo ? this.fetchMore = this.appDataShareService.vueHistoryPageInfo.hasNextPage : null;

    if (this.appDataShareService.vueHistoryArray.length >= this.vueHistoryLength){
      this.arrangeVueHistoryArray();
      this.loading = false;
      this.vueEmpty = false;
      this.noMatch();
    }
    else if (this.appDataShareService.vueHistoryArray.length > 0 && this.appDataShareService.vueHistoryArray.length < this.vueHistoryLength){
      this.arrangeVueHistoryArray();
      this.loading = false;
      this.vueEmpty = false;
      this.noMatch();
      this.fetchMore ? this.getVueHistory(true) : null;
    }
    else{
      this.getVueHistory();
    }

    this.scrollEndUnsub = this.appDataShareService.scrollEndReached()
    .subscribe(result => {
      if (this.fetchMore && !this.interestSelected && !this.isVueHistoryFetching){
        this.isVueHistoryFetching = true;
        this.getVueHistory(true);
      }
    });

    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest()
    .subscribe(result =>{
      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeVueHistoryArray();
      this.noMatch();
    });
  }

  getVueHistory(fetchMore=false){
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
          'first':this.vueHistoryLength,
          'after':this.appDataShareService.vueHistoryPageInfo ? this.appDataShareService.vueHistoryPageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:VUE_HISTORY, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.vueOpened === null || result.data.vueOpened.edges.length === 0){
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
              this.createVueArray(result.data.vueOpened.pageInfo, result.data.vueOpened.edges);
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
          this.isVueHistoryFetching = false;
          this.masonryLoading = false;
        }
      }
    })();
  }

  createVueArray(pageInfo:PAGE_INFO, vueHistory){
    this.appDataShareService.vueHistoryPageInfo = pageInfo;
    this.fetchMore = this.appDataShareService.vueHistoryPageInfo.hasNextPage;
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

    vueHistory.forEach(element => {
      const vueHistoryArray = this.appDataShareService.vueHistoryArray;
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

      if (vueHistoryArray.length > 0 && this.appDataShareService.vueHistoryArrayUpdated){
        let sameElement = false;

        for (let vueHistoryElement of vueHistoryArray){
          if (vueHistoryElement.vue_feed_id === element.node.id){
            console.log('same');
            vueHistoryElement.cursor = element.cursor;
            sameElement = true;
            break;
          }
        }

        if (sameElement){
          if (vueHistory[vueHistory.length - 1].node.id === element.node.id){
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

      vueHistoryArray.push({
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
        user_saved: element.node.saved,
        user_opened: true
      });
    });

    this.appDataShareService.vueHistoryArrayUpdated = false;
    lastItemSame === false ? this.arrangeVueHistoryArray() : this.getVueHistory(true);
    this.loading = false;
    this.vueEmpty = false;
    this.noMatch();
  }

  arrangeVueHistoryArray(){
    if (this.selectedInterest.length === 0){
      this.vueHistoryArray = this.appDataShareService.vueHistoryArray;
      this.interestSelected = false;
    }
    else{
      this.vueHistoryArray = [];
      const selectedInterestLength = this.selectedInterest.length;
      this.appDataShareService.vueHistoryArray.forEach(element => {
        let interestMatch = 0;
        element.interest_keyword.forEach(element_interest => {
          this.selectedInterest.forEach(selected_interest => {
            if (element_interest.id === selected_interest.id){
              interestMatch += 1;
              return;
            }
          });
        });
        selectedInterestLength === interestMatch ? this.vueHistoryArray.push(element) : null;
      });
      this.interestSelected = true;
    }
  }

  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.isVueHistoryFetching = false;
    this.masonryLoading = false;
  }

  noMatch(){
    if (!this.loading && !this.vueError && !this.vueEmpty && this.vueHistoryArray.length === 0){
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
