import { NgxMasonryOptions } from 'ngx-masonry';
import { isConversationStarted, isVueConverseDisable, locationName, modifyDateByDay, timeSince } from 'src/app/_helpers/functions.utils';
import { UserDataService } from './../../../../../_services/user-data.service';
import { LINK_PREVIEW, INTEREST_KEYWORD, PAGE_INFO, USER_PREFERENCE, IMAGE, dev_prod } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { VUE_HISTORY, VUE_HISTORY_CURSOR } from './../../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
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

  vue_backgorund_url:string;
  vueDisplayContext = 'vuehistory';

  loading = true;

  vueError = false;
  vueEmpty:boolean;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  vueHistoryLength = 3;
  vueHistoryArray:LINK_PREVIEW[] = [];
  isVueHistoryFetching = false;

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

  detailedVueOpened = false;
  deatiledVueData:LINK_PREVIEW;

  ngOnInit(): void {
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

    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest
    .subscribe(result =>{
      if (this.detailedVueOpened) this.openDetailedVue(false);

      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeVueHistoryArray();
      this.noMatch();
    });
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      if (this.fetchMore && !this.interestSelected && !this.isVueHistoryFetching){
        this.isVueHistoryFetching = true;
        this.getVueHistory(true);
      }
    }
  }

  getEndCursor(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.fetchMore){
        const vueHistoryId = this.appDataShareService.vueHistoryArray[this.appDataShareService.vueHistoryArray.length - 1].vue_feed_id;
        this.graphqlService.graphqlMutation(VUE_HISTORY_CURSOR, {vueOpenedId: vueHistoryId}).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data?.vueOpenedCursor?.cursor){
              this.appDataShareService.vueHistoryPageInfo.endCursor = result.data.vueOpenedCursor.cursor;
              resolve(true);
            }
            else{
              resolve(false);
            }
          },
          error =>{
            resolve(false);
          } 
        );
      }
      else{
        resolve(true);
      }
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
        const getUpdatedCursor = await this.getEndCursor();
        if (getUpdatedCursor){
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
      country_code: user_obj.location.country_code,
      region: user_obj.location.region,
      institution:user_obj.institution === null ? null : {uid: user_obj.institution.uid, verified: user_obj.institution.verified},
      locationPreference: user_obj.locationPreference,
      agePreference: user_obj.agePreference,
      conversationPoints: user_obj.conversationPoints,
      age: user_obj.age
    }

    vueHistory.forEach(element => {
      const vueHistoryArray = this.appDataShareService.vueHistoryArray;
      const vue_interest_tags:INTEREST_KEYWORD[] = [];
      const author_preference:USER_PREFERENCE = {
        country: element.node.vue.author.country,
        region: element.node.vue.author.region,
        institution: element.node.vue.author.studentinstitution != null ? {
          verified: element.node.vue.author.studentinstitution.verified,
          uid: element.node.vue.author.studentinstitution.institution.uid
        } : null,
        locationPreference: element.node.vue.author.locationPreference,
        conversationPoints: element.node.vue.author.conversationPoints,
        agePreference: element.node.vue.author.agePreference,
        age: element.node.vue.author.age,
        newConversationDisabled: element.node.vue.author.newConversationDisabled,
        autoConversationDisabled: element.node.vue.author.autoConversationDisabled
      }

      const conversation_started = isConversationStarted(element.node.vue.author.id, this.appDataShareService.allInteraction);
      let conversation_disabled = false;
      let image:IMAGE = null;

      if (element.node.vue.image != null){
        image = {
          id: element.node.vue.image.id,
          image: element.node.vue.image.image,
          thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ element.node.vue.image.thumnail : element.node.vue.image.thumnailUrl,
          width: element.node.vue.image.width,
          height: element.node.vue.image.height
        }
      }

      element.node.vue.vueinterestSet.edges.forEach(interest => {
        vue_interest_tags.push({
          id: interest.node.interestKeyword.id,
          name: interest.node.interestKeyword.word
        });
      });

      if (element.node.vue.conversationDisabled || conversation_started){
        conversation_disabled = true;
      }
      else{
        conversation_disabled = !isVueConverseDisable(userPreference, author_preference);
      }

      vueHistoryArray.push({
        vue_feed_id: element.node.id,
        id: element.node.vue.id,
        image: image,
        title: element.node.vue.title,
        url: element.node.vue.url,
        domain_name: element.node.vue.domain?.domainName,
        site_name: element.node.vue.domain?.siteName,
        description: element.node.vue.description,
        interest_keyword: vue_interest_tags,
        created: element.node.vue.create,
        friendly_date: timeSince(new Date(element.node.vue.create)),
        author_id: element.node.vue.author.id,
        location: locationName(userPreference, author_preference),
        age: element.node.vue.author.age,
        active: new Date(element.node.vue.author.lastSeen) > modifyDateByDay(new Date(), 10) ? true : false,
        conversation_disabled: conversation_disabled,
        conversation_started: conversation_started,
        cursor: element.cursor,
        user_saved: element.node.saved,
        user_opened: true
      });
    });

    this.arrangeVueHistoryArray();
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
    this.appDataShareService.isVueConstructed.next(false);
  }

}
