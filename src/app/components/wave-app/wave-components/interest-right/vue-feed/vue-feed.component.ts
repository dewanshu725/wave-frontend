import { UserDataService } from './../../../../../_services/user-data.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { timeSince } from 'src/app/_helpers/functions.utils';
import { PAGE_INFO, LINK_PREVIEW, INTEREST_KEYWORD, USER_PREFERENCE } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { VUE_FEED } from './../../../../../_helpers/graphql.query';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';
import { GraphqlService } from './../../../../../_services/graphql.service';

@Component({
  selector: 'app-vue-feed',
  templateUrl: './vue-feed.component.html',
  styleUrls: ['./vue-feed.component.scss']
})
export class VueFeedComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService: AppDataShareService,
    private graphqlService: GraphqlService,
    private userDataService: UserDataService
    ) { }

  appContainerHeight:string;
  appRightContainerWidth:string;
  vue_backgorund_url:string;
  vueDisplayContext = 'vues';

  loading = true;

  vueError = false;
  vueEmpty:boolean;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueFeedLength = 5;
  vueFeedArray:LINK_PREVIEW[] = [];
  isVueFeedFetching = false;

  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelected = false;
  noMatchFound = false;

  masonryLoading = true;

  scrollEndUnsub:Subscription;
  selectedInterestUnsub:Subscription;

  masonryOption: NgxMasonryOptions = {
    gutter: 70,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
    this.appContainerHeight = (this.appDataShareService.appContainerHeight - 59 - 10 - 10) + 'px';
    this.appRightContainerWidth = (this.appDataShareService.appRightContainerWidth - 20) + 'px';
    this.vue_backgorund_url = this.appDataShareService.vue_background;
    this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
    this.appDataShareService.vueFeedPageInfo ? this.fetchMore = this.appDataShareService.vueFeedPageInfo.hasNextPage : null;

    if (this.appDataShareService.vueFeedArray.length >= this.vueFeedLength){
      this.arrangeVueFeedArray();
      this.loading = false;
      this.vueEmpty = false;
      this.noMatch();
    }
    else if (this.appDataShareService.vueFeedArray.length > 0 && this.appDataShareService.vueFeedArray.length < this.vueFeedLength){
      this.arrangeVueFeedArray();
      this.loading = false;
      this.vueEmpty = false;
      this.noMatch();
      this.fetchMore ? this.getVueFeed(true) : null;
    }
    else{
      this.getVueFeed();
    }

    this.scrollEndUnsub = this.appDataShareService.scrollEndReached()
    .subscribe(result => {
      if (this.fetchMore && !this.interestSelected && !this.isVueFeedFetching){
        this.isVueFeedFetching = true;
        this.getVueFeed(true);
      }
    });

    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest()
    .subscribe(result =>{
      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeVueFeedArray();
      this.noMatch();
    });
  }

  getVueFeed(fetchMore=false){
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
          'first':this.vueFeedLength,
          'after':this.appDataShareService.vueFeedPageInfo ? this.appDataShareService.vueFeedPageInfo.endCursor : ""
        }
        this.graphqlService.graphqlQuery({query:VUE_FEED, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
        .subscribe(
          (result:any) =>{

            if (result.data.vueFeed === null || result.data.vueFeed.edges.length === 0){
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
              this.createVueArray(result.data.vueFeed.pageInfo, result.data.vueFeed.edges);
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
              this.isVueFeedFetching = false;
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
          this.isVueFeedFetching = false;
          this.masonryLoading = false;
        }
      }
    })();
  }

  createVueArray(pageInfo:PAGE_INFO, vueFeed){
    this.appDataShareService.vueFeedPageInfo = pageInfo;
    this.fetchMore = this.appDataShareService.vueFeedPageInfo.hasNextPage;
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

    vueFeed.forEach(element => {
      const vueFeedArray = this.appDataShareService.vueFeedArray;
      let conversation_disabled = false;
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      const author_preference:USER_PREFERENCE = {
        country: element.node.vue.country,
        region: element.node.vue.region,
        institution: {uid: element.node.vue.institution},
        locationPreference: element.node.vue.locationPreference,
        conversationPoints: element.node.vue.conversationPoint,
        agePreference: element.node.vue.agePreference,
        age: element.node.vue.age
      }

      if (vueFeedArray.length > 0 && this.appDataShareService.vueFeedArrayUpdated){
        let sameElement = false;

        for (let vueFeedElement of vueFeedArray){
          if (vueFeedElement.vue_feed_id === element.node.id){
            console.log('same');
            vueFeedElement.cursor = element.cursor;
            sameElement = true;
            break;
          }
        }

        if (sameElement){
          if (vueFeed[vueFeed.length - 1].node.id === element.node.id){
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

      if (element.node.vue.newConversationDisabled || element.node.vue.autoConversationDisabled){
        conversation_disabled = true;
      }
      else if (element.node.vue.conversationDisabled){
        conversation_disabled = true;
      }
      else{
        conversation_disabled = !this.isVueConverseDisable(userPreference, author_preference);
      }

      vueFeedArray.push({
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
        location: this.locationName(userPreference, author_preference),
        age: element.node.vue.age,
        conversation_disabled: conversation_disabled,
        cursor: element.cursor,
        user_opened: element.node.opened,
        user_saved: element.node.saved
      });
    });

    this.appDataShareService.vueFeedLastIndex = this.appDataShareService.vueFeedArray.length - 1;
    this.appDataShareService.vueFeedArrayUpdated = false;
    lastItemSame === false ? this.arrangeVueFeedArray() : this.getVueFeed(true);
    this.loading = false;
    this.vueEmpty = false;
    this.noMatch();
  }

  isVueConverseDisable(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE): boolean{
    let locationCheckPassed = false
    let ageCheckPassed = false
    let conversationCheckPassed = false

    let user_conversation_point:number;
    let author_conversation_point:number;

    let higher_conversation_point:number;
    let lower_conversation_point:number;

    if (author_preference.locationPreference === 'country'){
      author_preference.country === user_preference.country ? locationCheckPassed = true : null;
    }
    else if (author_preference.locationPreference === 'region'){
      author_preference.region === user_preference.region && author_preference.country === user_preference.country ? locationCheckPassed = true : null;
    }
    else if (author_preference.locationPreference === 'institution'){
      author_preference.institution.uid === user_preference.institution.uid ? locationCheckPassed = true : null;
    }

    if (
        user_preference.age >= (author_preference.age-author_preference.agePreference) &&
        user_preference.age <= (author_preference.age+author_preference.agePreference)
      ){
        ageCheckPassed = true;
    }


    if (user_preference.conversationPoints >= 100){
      user_conversation_point = 100;
    }
    else{
      user_conversation_point = user_preference.conversationPoints;
    }

    if (author_preference.conversationPoints >= 100){
      author_conversation_point = 100;
    }
    else{
      author_conversation_point = author_preference.conversationPoints;
    }

    if (user_conversation_point > author_conversation_point){
      higher_conversation_point = user_conversation_point;
      lower_conversation_point = author_conversation_point;
    }
    else if (author_conversation_point > user_conversation_point){
      higher_conversation_point = author_conversation_point;
      lower_conversation_point = user_conversation_point;
    }
    else{
      conversationCheckPassed = true;
    }

    if (!conversationCheckPassed){
      if (higher_conversation_point-lower_conversation_point <= 10 || higher_conversation_point-(lower_conversation_point+10) <= 10){
        conversationCheckPassed = true;
      }
    }

    if (locationCheckPassed && ageCheckPassed && conversationCheckPassed){
      return true;
    }
    else{
      return false;
    }
  }

  locationName(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE){
    if (user_preference.locationPreference === 'global'){
      return author_preference.country
    }
    else if (user_preference.locationPreference === 'country' || user_preference.locationPreference === 'region'){
      return author_preference.region
    }
    else{
      return user_preference.institution.name
    }
  }

  arrangeVueFeedArray(){
    if (this.selectedInterest.length === 0){
      this.vueFeedArray = this.appDataShareService.vueFeedArray;
      this.interestSelected = false;
    }
    else{
      this.vueFeedArray = [];
      const selectedInterestLength = this.selectedInterest.length;
      this.appDataShareService.vueFeedArray.forEach(element => {
        let interestMatch = 0;
        element.interest_keyword.forEach(element_interest => {
          this.selectedInterest.forEach(selected_interest => {
            if (element_interest.id === selected_interest.id){
              interestMatch += 1;
              return;
            }
          });
        });
        selectedInterestLength === interestMatch ? this.vueFeedArray.push(element) : null;
      });
      this.interestSelected = true;
    }
  }

  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.isVueFeedFetching = false;
    this.masonryLoading = false;
  }

  noMatch(){
    if (!this.loading && !this.vueError && !this.vueEmpty && this.vueFeedArray.length === 0){
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
