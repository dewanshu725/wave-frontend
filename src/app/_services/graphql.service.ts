import { AppDataShareService } from './app-data-share.service';
import { INTEREST_CATEGORY, INTEREST_KEYWORD, dev_prod, INSTITUTION } from './../_helpers/constents';
import { ALL_INTEREST_CATEGORY, STUDENT_INTEREST_SNAPSHOT } from './../_helpers/graphql.query';
import { UserDataService } from './user-data.service';
import { Injectable, isDevMode } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { createUploadLink } from 'apollo-upload-client';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink} from 'apollo-link';
import { onError } from "apollo-link-error";

import {USER_OBJ} from '../_helpers/constents';
import {REFRESH_TOKEN_MUTATION, ME_QUERY} from '../_helpers/graphql.query';
import { Subject, Observable } from "rxjs";
import { take } from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';



@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  constructor(
    private apollo: Apollo,
    private userDataService: UserDataService,
    private appDataShareService: AppDataShareService,
    private snackBar: MatSnackBar
    ) {

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
    const ws = new WebSocketLink({
      uri: isDevMode() ? dev_prod.wsServerUrl_dev + 'graphql/' : dev_prod.wsServerUrl_prod + 'graphql/',
      options: {
        reconnect: false,
      }
    });


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



  public getNewToken(){
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
                    const allInterestCategoryResult = await this.getAllInterestCategory();
                    if (allInterestCategoryResult === true){
                      this.initialTokenRefresh = false;
                      this.onLoginChange(true);
                      this.studentInterestSnapshot();
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

  public getUserData(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlMutation(ME_QUERY).pipe(take(1))
      .subscribe(
        (result:any) => {
          const user = result.data.me;

          let institution:INSTITUTION = null;
          if (user.studentprofile.institution != null){
            institution = {
              uid: user.studentprofile.institution.uid,
              name: user.studentprofile.institution.name
            }
          }

          const user_obj:USER_OBJ = {
            uid: user.uid,
            email: user.email,
            username: user.username,
            fullName: user.firstName,
            sex: (user.sex).toLowerCase(),
            dob: user.dob,
            age: user.age,
            profilePictureUrl: user.profilePictureUrl,
            institution: institution,
            location: {
              postal_code: user.location.code === 0 ? null : user.location.code,
              region: user.location.region.name,
              state_or_province: user.location.region.stateOrProvince.name,
              country_code: user.location.region.stateOrProvince.country.code,
              country_name: user.location.region.stateOrProvince.country.name
            },
            locationPreference: user.studentprofile.locationPreference.toLowerCase(),
            agePreference: Number(user.studentprofile.agePreference),
            conversationPoints: Number(user.studentprofile.conversationPoints)
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


  public getAllInterestCategory(): Promise<boolean>{
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
        error =>{
          resolve(false);
        }
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

  public getAllUsers(query:any, variable?:any){
    return this.apollo.watchQuery({query: query, variables: variable});

    };
  public baseUserSignupMutation(mutation:any, variable?:any, query?:any){
    return this.apollo.mutate({
      mutation:mutation,
      variables: variable,
      update: (cache, {data}) => {
        this.updateAllUsersCache(query, cache, data);
      }
    });
  }

  public updateAllUsersCache(query:any, cache:any, data:any){
    try {
      const queryData:any = cache.readQuery({ query: query });
      const mutationData:any = data;
      queryData.allUser.edges = [...queryData.allUser.edges, {node:mutationData.baseUserSignup.user, __typename: "UserNodeEdge"}];
      cache.writeQuery({query: query, data: queryData});
    }
    catch(err){
      return null;
    }
  }

  public updateAllUser(query:any, data:any){
    try {
      const queryData:any = this.apollo.getClient().readQuery({query: query});
      const newUser:any = data.userCreated;
      queryData.allUser.edges = [...queryData.allUser.edges, {node:newUser, __typename: "UserNodeEdge"}];
      this.apollo.getClient().writeQuery({query: query, data: queryData});
    }
    catch(err){
      return null;
    }
  }

  public graphqlQuery({query, variable, fetchPolicy='cache-first'}: {query:any, variable?:any, fetchPolicy?:any}){
    return this.apollo.watchQuery({query: query, variables: variable, errorPolicy:'all', fetchPolicy:fetchPolicy});
  }

  public graphqlMutation(mutation:any, variable?:any){
    return this.apollo.mutate({ mutation:mutation, variables:variable, errorPolicy:'all'});
  }

  public subscription(query:any){
    return this.apollo.subscribe({query:query});
  }

}


