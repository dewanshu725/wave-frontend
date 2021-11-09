import { AppDataShareService } from './app-data-share.service';
import { INTEREST_CATEGORY, INTEREST_KEYWORD, dev_prod, INSTITUTION, IMAGE, INTERACTION, STUDENT_INTERACTION, CONVERSE_CONTEXT, DRAFT_CONVERSE, CONVERSE_PAGE_INFO, CHAT_PAGE_INFO, CONVERSE, CHAT, LOCATION } from './../_helpers/constents';
import { ALL_INTERACTION_CONVERSE, ALL_INTERACTION_DRAFT_CONVERSE, ALL_INTERACTION_EXPLORERS, ALL_INTEREST_CATEGORY, MY_DISCOVERY, MY_VUE, STUDENT_INTEREST_SNAPSHOT } from './../_helpers/graphql.query';
import { UserDataService } from './user-data.service';
import { Injectable, isDevMode} from '@angular/core';
import { Apollo } from 'apollo-angular';
import { createUploadLink } from 'apollo-upload-client';
import { split } from 'apollo-link';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink} from 'apollo-link';
import { onError } from "apollo-link-error";

import {USER_OBJ} from '../_helpers/constents';
import {REFRESH_TOKEN_MUTATION, ME_QUERY} from '../_helpers/graphql.query';
import { Subject, Observable} from "rxjs";
import { take } from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import { WebsocketService } from './websocket.service';
import { createChatMessage, createConverseMessage, createInstitution, createMyDiscoveryObj, createMyVueObj, modifyDateByDay } from '../_helpers/functions.utils';



@Injectable({
  providedIn: 'root'
})
export class GraphqlService{

  private webSocketClient: SubscriptionClient;

  constructor(
    private apollo: Apollo,
    private userDataService: UserDataService,
    private appDataShareService: AppDataShareService,
    private websocketService:WebsocketService,
    private snackBar: MatSnackBar
  ) {
    this.startApolloClient();
  }

  private startApolloClient(){
    const http = createUploadLink({
      uri: isDevMode() ? dev_prod.httpServerUrl_dev + 'graphql/' : dev_prod.httpServerUrl_prod + 'graphql/',
      withCredentials: true,
    });
 
     const headerMiddleware = new ApolloLink((operation, forward) => {
       const token = 'JWT '+ this.userDataService.getItem({accessToken:true}).accessToken;
       operation.setContext({
         headers: {
           'Accept': 'charset=utf-8',
           'Authorization': token ? token : ''
         }
       });
       return forward(operation);
     });
 
     const graphqlError = onError(({ graphQLErrors, networkError, operation, forward }) =>{
       if (graphQLErrors){
 
       }
       if (networkError){
         switch (operation.operationName){
           case 'Refresh_Token':
             if (this.initialTokenRefresh){
               this.onLoginChange(false);
               this.userDataService.removeItem();
               this.snackBar.open('Failed to Login :(','Retry');
             }
             else{
               this.onTokenRefreshFailedChange(true);
               console.log('token refresh filled');
             }
         }
       }
 
     });
 
 
 
     const http_link = ApolloLink.from([graphqlError, headerMiddleware, http]);
 
 
     // Create a WebSocket link:
     this.webSocketClient = new SubscriptionClient(
       isDevMode() ? dev_prod.wsServerUrl_dev + 'graphql/' : dev_prod.wsServerUrl_prod + 'graphql/',
       {
         reconnect: true,
         lazy: true,
       }
     );
 
     const ws = new WebSocketLink(this.webSocketClient);
 
 
     // using the ability to split links, you can send data to each link
     // depending on what kind of operation is being sent
     interface Definintion {
       kind: string;
       operation?: string;
     };
 
     const link = split(
       // split based on operation type
       ({ query }) => {
         const { kind, operation }: Definintion = getMainDefinition(query);
         return kind === 'OperationDefinition' && operation === 'subscription';
       },
       ws,
       http_link,
     );
 
     this.apollo.create({
       link,
       cache: new InMemoryCache()
     })
  }

  private resetApolloClient(){
    (async () => {
      this.closeGraphqlSubscription();
      const storeClered = await this.apollo.getClient().clearStore();

      if (storeClered){
        this.apollo.removeClient();
        this.startApolloClient();
      }
    })();
  }

  private closeGraphqlSubscription(){
    this.webSocketClient.unsubscribeAll();
    this.webSocketClient.close(true);
  }
  
  initialTokenRefresh:boolean;
  private tokenRefreshWaiting = false;

  // 'isLogin' Observable setup ----------------------
  private _isLogin: boolean;
  private isLoginSubject = new Subject<boolean>();

  get isLogin(){return this._isLogin};

  onLoginChange(status:boolean){
    this._isLogin = status;
    this.isLoginSubject.next(status);
    this.tokenRefreshWaiting = false;
    if (status){
      this.startRefreshTokenTimer();
      this.onTokenRefreshFailedChange(false);
    }
    else{
      this.userDataService.removeItem();
      this.appDataShareService.reset();
      this.websocketService.closeConnection();
      this.resetApolloClient();
      this.stopRefreshTokenTimer();
      this.onTokenRefreshFailedChange(true);
    }
  }

  getLoginStatus(): Observable<boolean>{
    return this.isLoginSubject.asObservable();
  }
  //-----------------------------------------------------


  // 'internetStatus' Observable setup ----------------------------
  private _internetStatus = true;
  private internetStatusSubject = new Subject<boolean>();

  get internetStatus(){return this._internetStatus}

  onInternetStatusChange(status:boolean){
    this._internetStatus = status;
    this.internetStatusSubject.next(status);
  }

  getInternetStatus(): Observable<boolean>{
    return this.internetStatusSubject.asObservable();
  }
  //------------------------------------------------------------------


  // 'tokenRefreshFailed' Observable setup -------------------------------
  private _tokenRefreshFailed = false;
  private tokenRefreshFailedSubject = new Subject<boolean>();

  get tokenRefreshFailed(){return this._tokenRefreshFailed};

  private onTokenRefreshFailedChange(status:boolean){
    this._tokenRefreshFailed = status;
    this.tokenRefreshFailedSubject.next(status);
  }

  getTokenRefreshFailedStatus(): Observable<boolean>{
    return this.tokenRefreshFailedSubject.asObservable();
  }
  //---------------------------------------------------------------------



  getNewToken(){
    if (this.internetStatus){
      const token = this.userDataService.getItem({refreshToken:true}).refreshToken;
      if (token){
        const token_arrgs = {"refresh_token": token}
        this.graphqlMutation(REFRESH_TOKEN_MUTATION, token_arrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            const refresh_token_data = result.data.refreshToken;

            if (!refresh_token_data.errors){
              const access_token = refresh_token_data.token;
              const refresh_token = refresh_token_data.refreshToken;
              this.userDataService.setItem({accessToken:access_token,refreshToken:refresh_token});

              if (this.initialTokenRefresh === true){

                (async () => {
                  const userDataResult = await this.getUserData();
                  if (userDataResult === true){
                    const allInterestCategory = await this.getAllInterestCategory();
                    const allMyVue = await this.getAllMyVue();
                    const allMyDiscovery = await this.getAllMyDiscovery();
                    const allDraftInteraction = await this.getContact(ALL_INTERACTION_DRAFT_CONVERSE);
                    const allConverseInteraction = await this.getContact(ALL_INTERACTION_CONVERSE);
                    const allExplorerInteraction = await this.getContact(ALL_INTERACTION_EXPLORERS);
                    if (allInterestCategory && allMyVue && allMyDiscovery && allDraftInteraction && allConverseInteraction && allExplorerInteraction){
                      this.initialTokenRefresh = false;
                      this.onLoginChange(true);
                      this.studentInterestSnapshot();
                      this.websocketService.online().subscribe(() =>{});
                    }
                    else{
                      this.onLoginChange(false);
                    }
                  }
                  else{
                    this.onLoginChange(false);
                  }
                })();
              }
              else{
                this.onLoginChange(true);
              }

            }
            else{
              this.onLoginChange(false);
            }

          }
        )
      }
      else{
        this.onLoginChange(false);
      }
    }
    else{
      this.tokenRefreshWaiting = true;
      console.log('waiting');

      this.getInternetStatus().pipe(take(1))
      .subscribe(status =>{
        this.getNewToken();
      });
    }

  }

  getUserData(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlMutation(ME_QUERY).pipe(take(1))
      .subscribe(
        (result:any) => {
          const user = result.data.me;
          let profilePicture:IMAGE = null;

          if (user.profilePicture != null){
            profilePicture = {
              id: user.profilePicture.id,
              image: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ user.profilePicture.image : user.profilePicture.imageUrl,
              thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ user.profilePicture.thumnail : user.profilePicture.thumnailUrl,
              width: user.profilePicture.width,
              height: user.profilePicture.height
            }
          }

          const user_obj:USER_OBJ = {
            student_profile_id: user.studentprofile.id,
            uid: user.uid,
            email: user.email,
            username: user.username,
            fullName: user.firstName,
            nickname: user.studentprofile.nickname,
            sex: (user.sex).toLowerCase(),
            dob: user.dob,
            age: user.age,
            profilePicture: profilePicture,
            institution: user.studentprofile.studentinstitution != null ? createInstitution(user.studentprofile.studentinstitution.institution, user.studentprofile.studentinstitution.verified) : null,
            location: {
              postal_code: user.location.code === 0 ? null : user.location.code,
              region: user.location.region.name,
              state_or_province: user.location.region.stateOrProvince.name,
              country_code: user.location.region.stateOrProvince.country.code,
              country_name: user.location.region.stateOrProvince.country.name
            },
            locationPreference: user.studentprofile.locationPreference,
            agePreference: Number(user.studentprofile.agePreference),
            conversationPoints: Number(user.studentprofile.conversationPoints),
            newConversationDisabled: user.studentprofile.newConversationDisabled,
            newConversationCount: Number(user.studentprofile.newConversationCount),
            newConversationTime: user.studentprofile.newConversationTime != null ? new Date(user.studentprofile.newConversationTime) : null
          }

          this.userDataService.setItem({
            userObject:user_obj,
            studentState:user.studentprofile.state
          });

          user.studentprofile.relatedstudentinterestkeywordSet.edges.forEach(element => {
            this.appDataShareService.studentInterest.push({
              id: element.node.interest.id,
              name: element.node.interest.word,
              selected: false,
              saved: element.node.saved,
              count: element.node.count,
              average_percent: element.node.averagePercentage
            });
          });
          resolve(true);
        },
        error =>{
          resolve(false);
        },
      );
    });
  }


  getAllInterestCategory(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlQuery({query:ALL_INTEREST_CATEGORY}).valueChanges.pipe(take(1))
      .subscribe(
        (result:any) =>{
          const selected_interest = this.appDataShareService.studentInterest.length > 0 ? this.appDataShareService.studentInterest : null;
          const all_interest_category:INTEREST_CATEGORY[] = [];
          result.data.allInterestCategory.edges.forEach(interest_category => {

            const interest_keyword_set:INTEREST_KEYWORD[] = [];
            interest_category.node.interestkeywordSet.edges.forEach(interest => {

              let selected = false;
              if (selected_interest != null){
                selected_interest.forEach(user_interest =>{ user_interest.id === interest.node.id && user_interest.saved === true ? selected = true : null; });
              }

              interest_keyword_set.push(
                {
                  id:interest.node.id,
                  name:interest.node.word,
                  selected:selected
                }
              );
            });
            all_interest_category.push(
              {
                name:interest_category.node.name,
                interest_keyword:interest_keyword_set
              }
            );

          });

          this.userDataService.setItem({interestCategory:JSON.stringify(all_interest_category)});
          resolve(true);
        },
        error => resolve(false)
      );
    });

  }


  getAllMyVue(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlQuery({query:MY_VUE, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
      .subscribe(
        (result:any) =>{
          if (result.data?.allMyVue?.edges.length != 0){
            result.data.allMyVue.edges.forEach(element => {
              this.appDataShareService.myVueArray.push(createMyVueObj(element.node));
            });
          }
          resolve(true);
        },
        error => resolve(false)
      )
    });
  }


  getAllMyDiscovery(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlQuery({query:MY_DISCOVERY, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
      .subscribe(
        (result:any) =>{
          if (result.data?.allMyDiscovery?.edges.length != 0){
            result.data.allMyDiscovery.edges.forEach(element => {
              this.appDataShareService.myDiscoveryArray.push(createMyDiscoveryObj(element.node, this.appDataShareService.myVueArray));
            });
          }
          resolve(true);
        },
        error => resolve(false)
      )
    });
  }


  getContact(query): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {

      this.graphqlQuery({query:query, fetchPolicy:'network-only'}).valueChanges.pipe(take(1))
      .subscribe(
        (result:any) =>{
          if (result.data && result.data.allInteraction.edges.length === 0){
            resolve(true);
          }
          else{
            const studentProfileId = this.userDataService.getItem({userObject:true}).userObject.student_profile_id;

            result.data.allInteraction.edges.forEach(element => {
              let interaction:INTERACTION;
              let user_interaction:STUDENT_INTERACTION;
              let student_interaction:STUDENT_INTERACTION;
              let converse_context:CONVERSE_CONTEXT;
              let draft_converse:DRAFT_CONVERSE;
              let converse_page_info:CONVERSE_PAGE_INFO;
              let chat_page_info:CHAT_PAGE_INFO;

              element.node.studentinteractionSet.edges.forEach(studentInteractionElement => {

                if (studentProfileId === studentInteractionElement.node.student.id){
                  user_interaction = {
                    id: studentInteractionElement.node.id,
                    accepted_connection: studentInteractionElement.node.acceptedConnection,
                    blocked: studentInteractionElement.node.blockedInteraction,
                    new_conversation_disabled: studentInteractionElement.node.student.newConversationDisabled,
                    typing: false,
                    profile:{
                      id: studentInteractionElement.node.student.id,
                      nickname: studentInteractionElement.node.student.nickname,
                      last_seen: new Date(studentInteractionElement.node.student.lastSeen),
                      inactive: new Date(studentInteractionElement.node.student.lastSeen) >= modifyDateByDay(new Date, 10) ? false : true,
                      deleted: false
                    }
                  }

                  if (query.definitions[0].name.value === 'allInteractionExplorers'){
                    user_interaction.profile.fullname = studentInteractionElement.node.student.fullName;
                    user_interaction.profile.online = studentInteractionElement.node.student.online;
                  }
                }
                else{
                  student_interaction = {
                    id: studentInteractionElement.node.id,
                    accepted_connection: studentInteractionElement.node.acceptedConnection,
                    blocked: studentInteractionElement.node.blockedInteraction,
                    new_conversation_disabled: studentInteractionElement.node.student.newConversationDisabled,
                    typing: false,
                    profile:{
                      id: studentInteractionElement.node.student.id,
                      nickname: studentInteractionElement.node.student.nickname,
                      last_seen: new Date(studentInteractionElement.node.student.lastSeen),
                      inactive: new Date(studentInteractionElement.node.student.lastSeen) >= modifyDateByDay(new Date, 10) ? false : true,
                      deleted: studentInteractionElement.node.student.deleted
                    }
                  }

                  if (query.definitions[0].name.value === 'allInteractionExplorers' && !studentInteractionElement.node.student.deleted){
                    student_interaction.profile.fullname = studentInteractionElement.node.student?.fullName;
                    student_interaction.profile.online = studentInteractionElement.node.student.online;
                    student_interaction.profile.sex = studentInteractionElement.node.student?.sex.toLowerCase();
                    student_interaction.profile.dob = studentInteractionElement.node.student?.dob;
                    student_interaction.profile.age = studentInteractionElement.node.student?.age;
                    student_interaction.profile.profile_picture = {
                      id:null,
                      width: null,
                      height: null,
                      image: studentInteractionElement.node.student.profilePicture != null ? isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ studentInteractionElement.node.student?.profilePicture : studentInteractionElement.node.student?.profilePictureUrl : null,
                      thumnail:null
                    }
                    student_interaction.profile.region = studentInteractionElement.node.student?.region;
                    student_interaction.profile.country = studentInteractionElement.node.student?.country;
                    student_interaction.profile.public_vues = [];
                    student_interaction.profile.discovery = [];
                  }
                }
              });

              converse_context = {
                type: element.node.conversecontext.contextType,
                vue_context: element.node.conversecontext.vue === null ? null : {
                  id: element.node.conversecontext.vue.id,
                  author_id: element.node.conversecontext.vue.author?.id,
                  image: element.node.conversecontext.vue.image === null ? null : {
                    id: element.node.conversecontext.vue.image.id,
                    image: element.node.conversecontext.vue.image.image,
                    thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ element.node.conversecontext.vue.image.thumnail : element.node.conversecontext.vue.image.thumnailUrl,
                    width: element.node.conversecontext.vue.image.width,
                    height: element.node.conversecontext.vue.image.height
                  },
                  title: element.node.conversecontext.vue.title,
                  description: element.node.conversecontext.vue.description,
                  url: element.node.conversecontext.vue.url,
                  site_name: element.node.conversecontext.vue.domain?.siteName,
                  domain_name: element.node.conversecontext.vue.domain?.domainName,
                  location: element.node.conversecontext.vue.author?.region,
                  age: element.node.conversecontext.vue.author?.age
                }
              }

              draft_converse = {
                id: element.node.draftconversemessageSet.edges[0].node.id,
                type: element.node.draftconversemessageSet.edges[0].node.messageType,
                in_transit: element.node.draftconversemessageSet.edges[0].node.inTransit,
                body: element.node.draftconversemessageSet.edges[0].node.body,
                updated: new Date(element.node.draftconversemessageSet.edges[0].node.updated)
              }

              interaction = {
                id: element.node.id,
                expire: element.node.expire != null ? new Date(element.node.expire) : null,
                converse_context: converse_context,
                user_interaction: user_interaction,
                student_interaction: student_interaction,
                draft_converse: draft_converse,
                converse_page_info: null,
                converse: [],
                chat_page_info: null,
                chat: [],
                selected: false,
                blocked: element.node.blocked
              }
                

              if (query.definitions[0].name.value === 'allInteractionDraftConverse'){
                this.appDataShareService.allInteraction.draft_converse.push(interaction);
              }

              if (query.definitions[0].name.value === 'allInteractionConverse' || query.definitions[0].name.value === 'allInteractionExplorers'){
                
                if (element.node.conversemessageSet.edges.length > 0){

                  element.node.conversemessageSet.edges.forEach(converse => {
                    const converse_obj:CONVERSE = createConverseMessage(converse.node, interaction);
                    interaction.converse.push(converse_obj);
                  });
                }

                converse_page_info = {
                  hasNextPage: element.node.conversemessageSet.pageInfo.hasNextPage,
                  startCursor: element.node.conversemessageSet.pageInfo.startCursor,
                  endCursor: element.node.conversemessageSet.pageInfo.endCursor
                }
                interaction.converse_page_info = converse_page_info;

                if(query.definitions[0].name.value === 'allInteractionConverse') this.appDataShareService.allInteraction.converse.push(interaction);
              }

              if (query.definitions[0].name.value === 'allInteractionExplorers'){
                if (element.node.chatmessageSet.edges.length > 0){
                  element.node.chatmessageSet.edges.forEach((chat, index) => {
                    const chat_obj:CHAT = createChatMessage(chat.node, interaction);

                    const currentChatDate = chat_obj.created.getDate();
                    const nextChatDate = element.node.chatmessageSet.edges[index++] != undefined ? new Date(element.node.chatmessageSet.edges[index++]?.node.created).getDate() : null;
                    let newDate = false;
                    if (nextChatDate === null || currentChatDate != nextChatDate){
                      newDate = true;
                    }

                    chat_obj.newDate = newDate;

                    interaction.chat.push(chat_obj);
                  });
                }
                
                chat_page_info = {
                  hasNextPage: element.node.chatmessageSet.pageInfo.hasNextPage,
                  startCursor: element.node.chatmessageSet.pageInfo.startCursor,
                  endCursor: element.node.chatmessageSet.pageInfo.endCursor
                }
                interaction.chat_page_info = chat_page_info;

                this.appDataShareService.allInteraction.explorers.push(interaction);
              }
            });

            resolve(true);
          }
        },
        error => resolve(false)
      );
    });
  }


  public studentInterestSnapshot(){
    this.graphqlMutation(STUDENT_INTEREST_SNAPSHOT).pipe(take(1))
    .subscribe((result:any) =>{
      //console.log(result.data.studentInterestSnapshot.result);
    });
  }


  public isTokenValid(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.tokenRefreshFailed === true || this.tokenRefreshWaiting === true){
        this.getTokenRefreshFailedStatus().pipe(take(1))
        .subscribe(status =>{status ? resolve(false) : resolve(true);});

        this.tokenRefreshFailed === true ? this.getNewToken() : null;
      }
      else{
        resolve(true);
      }
    });
  }

  public refreshTokenTimeout;

  public startRefreshTokenTimer(){
    const access_token = this.userDataService.getItem({accessToken:true}).accessToken;
    const jwtToken = JSON.parse(atob(access_token.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.getNewToken(), timeout);
  }

  public stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  public writeDataIntoCache(localData:any){
    this.apollo.getClient().writeData({data: localData});
  }

  public graphqlLocalQuery(query:any){
    return this.apollo.getClient().readQuery({query: query});
  }

  public graphqlQuery({query, variable, fetchPolicy='cache-first'}: {query:any, variable?:any, fetchPolicy?:any}){
    return this.apollo.watchQuery({query: query, variables: variable, errorPolicy:'all', fetchPolicy:fetchPolicy});
  }

  public graphqlMutation(mutation:any, variable?:any){
    return this.apollo.mutate({ mutation:mutation, variables:variable, errorPolicy:'all'});
  }

  public subscription(query:any, variable?:any){
    return this.apollo.subscribe({query:query, variables:variable});
  }
}


