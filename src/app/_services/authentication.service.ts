import { AppDataShareService } from './app-data-share.service';
import { take } from 'rxjs/operators';
import { USER_OBJ, TRUSTED_DEVICE, INSTITUTION, IMAGE, dev_prod } from './../_helpers/constents';
import { GraphqlService } from './graphql.service';
import { UserDataService } from './user-data.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

import {
  EMAIL_LOGIN_MUTATION,
  USERNAME_LOGIN_MUTATION,
  LOGOUT_MUTATION,
  ALL_INTERACTION_DRAFT_CONVERSE,
  ALL_INTERACTION_CONVERSE,
  ALL_INTERACTION_EXPLORERS
} from '../_helpers/graphql.query';

import { Injectable, isDevMode} from '@angular/core';
import { Observable, Subject} from "rxjs";
import { WebsocketService } from './websocket.service';
import { createInstitution } from '../_helpers/functions.utils';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService{

  constructor(
    private graphqlService: GraphqlService,
    private userDataService:UserDataService,
    private appDataShareService:AppDataShareService,
    private websocketService:WebsocketService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }
  

  private loginFormErrorSubject = new Subject();

  public getLoginFormResult(): Observable<any> {
    return this.loginFormErrorSubject.asObservable();
  }

  private loginFormErrorCodeSubject = new Subject();

  public getLoginFormErrorCode(): Observable<any> {
    return this.loginFormErrorCodeSubject.asObservable();
  }

  public login(emailOrUsername:string, password:string, usernamePresent:boolean, trustedDevice:boolean){
    const mutationArrgs = {
      "password":password
    }
    let LOGIN_MUTATION_TYPE;

    if (usernamePresent){
      mutationArrgs['username'] = emailOrUsername;
      LOGIN_MUTATION_TYPE = USERNAME_LOGIN_MUTATION;
    }
    else{
      mutationArrgs['email'] = emailOrUsername;
      LOGIN_MUTATION_TYPE = EMAIL_LOGIN_MUTATION;
    }

    this.graphqlService.graphqlMutation(LOGIN_MUTATION_TYPE, mutationArrgs).pipe(take(1))
    .subscribe(
      (auth_result:any) => {
        if(!auth_result.data.tokenAuth.errors){

          if (trustedDevice === true){
            localStorage.setItem(TRUSTED_DEVICE, "true");
          }

          const tokenAuth:any = auth_result.data.tokenAuth;
          const user = tokenAuth.user;
          const token = tokenAuth.token;
          const refreshToken = tokenAuth.refreshToken;
          let profilePicture:IMAGE = null;

          this.userDataService.setItem({
            accessToken:token,
            refreshToken:refreshToken
          });

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
            newConversationTime: new Date(user.studentprofile.newConversationTime)
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


          (async () => {
            const allInterestCategory = await this.graphqlService.getAllInterestCategory();
            const allMyVue = await this.graphqlService.getAllMyVue();
            const allMyDiscovery = await this.graphqlService.getAllMyDiscovery();
            const allDraftInteraction = await this.graphqlService.getContact(ALL_INTERACTION_DRAFT_CONVERSE);
            const allConverseInteraction = await this.graphqlService.getContact(ALL_INTERACTION_CONVERSE);
            const allExplorerInteraction = await this.graphqlService.getContact(ALL_INTERACTION_EXPLORERS);
            if (allInterestCategory && allMyVue && allMyDiscovery && allDraftInteraction && allConverseInteraction && allExplorerInteraction){
              this.graphqlService.onLoginChange(true);
              this.graphqlService.initialTokenRefresh = false;
              this.loginFormErrorSubject.next(false);
              this.graphqlService.studentInterestSnapshot();
              this.websocketService.online().subscribe(() =>{});
            }
            else{
              this.loginFormErrorSubject.next(true);
              this.userDataService.removeItem();
            }
          })();
        }
        else{
          this.loginFormErrorSubject.next(true);
          this.loginFormErrorCodeSubject.next(auth_result.data.tokenAuth.errors.nonFieldErrors[0].code);
          this.userDataService.removeItem();
        }

      },
      error =>{
        this.loginFormErrorSubject.next(true);
        this.snackBar.open("something went Wrong!", "Try Again");
        this.userDataService.removeItem();
      }
    );
  }

  public logout(){
    const refresh_token_arrgs = {
      "refresh_token":this.userDataService.getItem({refreshToken:true}).refreshToken
    }
    this.graphqlService.graphqlMutation(LOGOUT_MUTATION, refresh_token_arrgs).pipe(take(1))
    .subscribe(
      (result:any) => {
      this.graphqlService.onLoginChange(false);
      this.router.navigate(['/logout']);
      },
      error =>{
        this.snackBar.open("Failed to loggout", "Try Again");
      }
    );
  }

  public isAuthenticated(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.graphqlService.isLogin != undefined){
        resolve(this.graphqlService.isLogin);
      }
      else{
        if (this.graphqlService.initialTokenRefresh === true){
          this.graphqlService.getLoginStatus().pipe(take(1))
          .subscribe(result =>{
            resolve(result);
          });
        }
        else{
          resolve(false);
        }
      }
    });
  }


}
