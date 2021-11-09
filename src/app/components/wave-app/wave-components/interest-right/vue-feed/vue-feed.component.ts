import { UserDataService } from './../../../../../_services/user-data.service';
import { NgxMasonryOptions } from 'ngx-masonry';
import { isConversationStarted, isVueConverseDisable, locationName, modifyDateByDay, timeSince } from 'src/app/_helpers/functions.utils';
import { LINK_PREVIEW, INTEREST_KEYWORD, USER_PREFERENCE, IMAGE, dev_prod, USER_OBJ } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { GET_VUE_FEED_FROM_IDS, VUE_FEED_IDS } from './../../../../../_helpers/graphql.query';
import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
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

  vue_backgorund_url:string;
  vueDisplayContext = 'vues';

  loading = true;

  vueError = false;
  vueEmpty = false;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueFeedLength = 3;
  vueFeedArray:LINK_PREVIEW[] = [];
  vueFeedLocationPreferance:string;
  currentVueFeedIdsToFetch = [];
  isVueFeedFetching = false;

  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelected = false;
  noMatchFound = false;

  masonryLoading = true;

  selectedInterestUnsub:Subscription;

  masonryOption: NgxMasonryOptions = {
    gutter: 80,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  userObj:USER_OBJ;
  userDataUnsub:Subscription;

  detailedVueOpened = false;
  deatiledVueData:LINK_PREVIEW;

  ngOnInit(): void {
    this.appDataShareService.appActivePath.interest.vue_feed.active = true;
    this.appDataShareService.appActivePath.interest.vue_feed.notification = false;

    this.vue_backgorund_url = this.appDataShareService.vue_background;
    this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;

    this.userObj = this.userDataService.getItem({userObject:true}).userObject;

    this.userDataUnsub = this.appDataShareService.updateUserData.subscribe(() => {
      this.userObj = this.userDataService.getItem({userObject:true}).userObject;
    });

    if (this.appDataShareService.vueFeedLocationPreferance != null){
      this.vueFeedLocationPreferance = this.appDataShareService.vueFeedLocationPreferance;
    }
    else{
      this.vueFeedLocationPreferance = this.userObj.locationPreference.toLowerCase();
    }

    this.fetchMore = this.canFetchMore();

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
      this.fetchMore ? this.getVueFeedFromIds(true) : null;
    }
    else{
      this.getVueFeedFromIds();
    }


    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest
    .subscribe(result =>{
      if (this.detailedVueOpened) this.openDetailedVue(false);

      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeVueFeedArray();
      this.noMatch();
    });
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      if (this.fetchMore && !this.interestSelected && !this.isVueFeedFetching){
        this.isVueFeedFetching = true;
        this.getVueFeedFromIds(true);
      }
    }
  }

  locationPreferanceChnged(value){
    this.appDataShareService.resetVueFeed();
    this.appDataShareService.vueFeedLocationPreferance = value;
    this.vueFeedLocationPreferance = this.appDataShareService.vueFeedLocationPreferance;
    this.vueFeedArray = [];
    this.currentVueFeedIdsToFetch = [];
    this.fetchMore = this.canFetchMore();
    this.vueEmpty = false;
    this.getVueFeedFromIds();
  }

  canFetchMore(){
    if (this.appDataShareService.vueFeedArray.length < this.appDataShareService.vueFeedIds.length){
      return true;
    }
    else{
      return false;
    }
  }

  getCurrentVueFeedIds(){
    this.currentVueFeedIdsToFetch = [];

    for (const vueFeedId of this.appDataShareService.vueFeedIds){
      if (this.currentVueFeedIdsToFetch.length < this.vueFeedLength){
        const vueFeedIndex = this.appDataShareService.vueFeedArray.findIndex(item => item.id === vueFeedId);
        if (vueFeedIndex === -1){
          this.currentVueFeedIdsToFetch.push(vueFeedId);
        }
      }
      else{
        break;
      }
    }
  }

  getVueFeedIds(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.fetchMore){
        this.getCurrentVueFeedIds();
        resolve(true);
      }
      else{
        const mutationArrgs = {
          locationPreference: this.vueFeedLocationPreferance
        }
        this.graphqlService.graphqlMutation(VUE_FEED_IDS, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) => {
            if (result.data?.vueFeedIds?.vueFeedIds?.length > 0){
              this.appDataShareService.vueFeedIds = result.data.vueFeedIds.vueFeedIds;
              this.getCurrentVueFeedIds();
            }
            resolve(true);
          },
          error => resolve(false)
        );
      }
    });
  }

  getVueFeedFromIds(fetchMore=false){
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

        const getVueFeedIds = await this.getVueFeedIds();
        if (getVueFeedIds){
          this.graphqlService.graphqlMutation(GET_VUE_FEED_FROM_IDS, {vueFeedIds: this.currentVueFeedIdsToFetch}).pipe(take(1))
          .subscribe(
            (result:any) =>{
  
              if (result.data?.getVueFeedFromIds?.vueFeedObjs?.length === 0){
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
                this.createVueArray(result.data.getVueFeedFromIds.vueFeedObjs);
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
          );
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

  createVueArray(vueFeed){
    const user_obj = this.userObj;
    const userPreference:USER_PREFERENCE = {
      country: user_obj.location.country_name,
      country_code: user_obj.location.country_code,
      region: user_obj.location.region,
      institution:user_obj.institution === null ? null : {uid: user_obj.institution.uid, verified: user_obj.institution.verified},
      locationPreference: user_obj.locationPreference,
      agePreference: user_obj.agePreference,
      conversationPoints: user_obj.conversationPoints,
      age: user_obj.age
    }

    vueFeed.forEach(element => {
      const vueFeedArray = this.appDataShareService.vueFeedArray;
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      const author_preference:USER_PREFERENCE = {
        country: element.author.country,
        region: element.author.region,
        institution: element.author.studentinstitution != null ? {
          verified: element.author.studentinstitution.verified,
          uid: element.author.studentinstitution.institution.uid
        } : null,
        locationPreference: element.author.locationPreference,
        conversationPoints: element.author.conversationPoints,
        agePreference: element.author.agePreference,
        age: element.author.age,
        newConversationDisabled: element.author.newConversationDisabled,
        autoConversationDisabled: element.author.autoConversationDisabled
      }

      const conversation_started = isConversationStarted(element.author.id, this.appDataShareService.allInteraction);
      let conversation_disabled = false;
      let image:IMAGE = null;

      if (element.image != null){
        image = {
          id: element.image.id,
          image: element.image.image,
          thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ element.image.thumnail : element.image.thumnailUrl,
          width: element.image.width,
          height: element.image.height
        }
      }

      element.vueinterestSet.edges.forEach(interest => {
        vue_interest_tags.push({
          id: interest.node.interestKeyword.id,
          name: interest.node.interestKeyword.word
        });
      });

      if (element.conversationDisabled || conversation_started){
        conversation_disabled = true;
      }
      else{
        conversation_disabled = !isVueConverseDisable(userPreference, author_preference);
      }

      vueFeedArray.push({
        id: element.id,
        image: image,
        title: element.title,
        url: element.url,
        domain_name: element.domain?.domainName,
        site_name: element.domain?.siteName,
        description: element.description,
        interest_keyword: vue_interest_tags,
        created: element.create,
        friendly_date: timeSince(new Date(element.create)),
        author_id: element.author.id,
        location: locationName(userPreference, author_preference),
        age: element.author.age,
        active: new Date(element.author.lastSeen) > modifyDateByDay(new Date, 10) ? true : false,
        conversation_disabled: conversation_disabled,
        conversation_started: conversation_started,
        cursor: element.cursor,
        user_opened: element.opened,
        user_saved: element.saved
      });
    });

    this.fetchMore = this.canFetchMore();
    this.arrangeVueFeedArray();
    this.loading = false;
    this.vueEmpty = false;
    this.noMatch();
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

  openDetailedVue(open_Status:boolean, openVueData?:LINK_PREVIEW){
    if (open_Status){
      this.deatiledVueData = openVueData;
      this.detailedVueOpened = true;
    }
    else{
      this.deatiledVueData = null;
      this.detailedVueOpened = false;
    }
  }

  ngOnDestroy(){
    if (this.selectedInterestUnsub) this.selectedInterestUnsub.unsubscribe();
    this.userDataUnsub.unsubscribe();
    this.appDataShareService.isVueConstructed.next(false);
    this.appDataShareService.appActivePath.interest.vue_feed.active = false;
  }

}
