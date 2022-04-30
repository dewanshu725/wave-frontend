import { LocationService } from './../../../../_services/location.service';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { take, takeUntil } from 'rxjs/operators';
import { PASSWORD_CHANGE, USER_LOCATION_UPDATE, UPDATE_ACCOUNT, UPDATE_PROFILE_PIC, DELETE_ACCOUNT } from './../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../_services/graphql.service';
import { USER_OBJ, LOCATION_JSON, dev_prod } from './../../../../_helpers/constents';
import { UserDataService } from './../../../../_services/user-data.service';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Component, isDevMode, OnDestroy, OnInit } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { removeValidators } from 'src/app/_helpers/functions.utils';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';

@Component({
  selector: 'app-profile-left',
  templateUrl: './profile-left.component.html',
  styleUrls: ['./profile-left.component.scss']
})
export class ProfileLeftComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private locationService:LocationService,
    private userDataService:UserDataService,
    private graphqlService:GraphqlService,
    private authenticationService: AuthenticationService,
    private matDialog:MatDialog,
    private snackBar: MatSnackBar
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  profileForm = {
    fullName_editState : true,
    location_editState : null
  }
  updateAccountFailed = false;
  locationFailed = false;
  locationFailedMessage:string;
  locationData:LOCATION_JSON;

  userObj:USER_OBJ;

  panelOpenState = false;
  passwordChangeForm: FormGroup;
  passwordChangeFormError = false;
  passwordChangeFormErrorMessage:string;
  passwordChangeLoadStatus = false;
  passwordChangeSubmited = false;

  profilePicDeleting = false;
  accountDeleting = false;
  deleteModeActive = false;

  ngOnInit(): void {
    this.userObj = this.userDataService.getItem({userObject:true}).userObject;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(() =>{
      this.userObj = this.userDataService.getItem({userObject:true}).userObject;
    });


    this.appDataShareService.locationEdited ? this.profileForm.location_editState = false : this.profileForm.location_editState = true;

    this.passwordChangeForm = new FormGroup({
      'currentPassword': new FormControl(null, Validators.required),
      'newPassword': new FormControl(null, [Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[!@#$%^&*]).{8,}$')]),
      'confirmPassword': new FormControl(null, Validators.required)
    }, {validators: this.passwordMatchValidator});
  }
  
  onPasswordFormChange(){
    this.passwordChangeFormError = false;
  }

  onUpdateValue(field){
    if (this.profileForm.fullName_editState){
      this.profileForm.fullName_editState = false;
    }
    else{
      this.profileForm.fullName_editState = null;
      this.updateAccountFailed = false;
      (async () => {
        const tokenStatus = await this.graphqlService.isTokenValid();
        if (tokenStatus){
          this.graphqlService.graphqlMutation(UPDATE_ACCOUNT, {'fullName': field.value}).pipe(take(1))
          .subscribe(
            (result:any) =>{
              if (result.data.updateAccount.success){
                this.userObj.fullName = field.value;
                this.userDataService.setItem({userObject:this.userObj});
                this.profileForm.fullName_editState = true;
              }
              else{
                this.profileForm.fullName_editState = false;
                this.updateAccountFailed = true;
              }
            },
            error =>{
              this.profileForm.fullName_editState = false;
              this.updateAccountFailed = true;
            }
          );
        }
        else{
          this.profileForm.fullName_editState = false;
          this.updateAccountFailed = true;
        }
      })();

    }
  }

  onEditLocation(){
    this.profileForm.location_editState = null;
    this.locationFailed = false;
    (async () => {
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const result = await this.locationService.getLocation(true);
        if (result){
          this.locationData = this.locationService.location;
          const mutationArrgs = {
            'countryCode': this.locationData.country_code,
            'stateOrProvince': this.locationData.state,
            'region': this.locationData.region.name,
            'latitude': this.locationData.coordinate.latitude,
            'longitude': this.locationData.coordinate.longitude
          }

          if (this.locationData.region.city) mutationArrgs['regionType'] = 'city';
          else if (this.locationData.region.town) mutationArrgs['regionType'] = 'town';
          else if (this.locationData.region.village) mutationArrgs['regionType'] = 'village';
          else if (this.locationData.region.hamlet) mutationArrgs['regionType'] = 'hamlet';
          else mutationArrgs['regionType'] = 'unknown';

          if (this.locationData.postal_code !=null) mutationArrgs['postalCode'] = this.locationData.postal_code;
          else mutationArrgs['postalCode'] = '0';

          this.graphqlService.graphqlMutation(USER_LOCATION_UPDATE, mutationArrgs).pipe(take(1))
          .subscribe(
            (result:any) =>{
              if (result.data.userLocationUpdate.success){
                this.userObj.location = {
                  country_code: mutationArrgs['countryCode'],
                  state_or_province: mutationArrgs['stateOrProvince'],
                  region: mutationArrgs['region'],
                  postal_code: mutationArrgs['postalCode'] === '0' ? null : +mutationArrgs['postalCode']
                }
                this.userDataService.setItem({userObject:this.userObj});
                console.log(this.userObj.location);
                this.profileForm.location_editState = false;
                this.appDataShareService.locationEdited = true;
              }
              else{
                this.locationFailed = true;
                this.locationFailedMessage = 'Location update <strong class="my-mat-error">Failed</strong>';
                this.profileForm.location_editState = true;
              }
            },
            error =>{
              this.locationFailed = true;
              this.locationFailedMessage = 'Location update <strong class="my-mat-error">Failed</strong>';
              this.profileForm.location_editState = true;
            }
          );

        }
        else{
          this.locationFailed = true;
          this.locationFailedMessage = 'Location is <strong class="my-mat-error">Unavailable</strong>';
          this.profileForm.location_editState = true;
        }
      }
      else{
        this.locationFailed = true;
        this.locationFailedMessage = '<strong class="my-mat-error">Unexpected Error</strong>';
        this.profileForm.location_editState = true;
      }

    })();
  }

  onProfilePicChange(file?){
    if (file === null){
      this.profilePicDeleting = true;
    }

    (async () => {
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = file != null ? {profilePic: file} : null;

        this.graphqlService.graphqlMutation(UPDATE_PROFILE_PIC, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) => {
            if (result.data?.updateProfilePic?.imgObj != null){
              const image_obj = result.data.updateProfilePic.imgObj;
              this.userObj.profilePicture = {
                id: image_obj.id,
                image: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ image_obj.image : image_obj.imageUrl,
                thumnail: isDevMode() ? dev_prod.httpServerUrl_dev +'static/'+ image_obj.thumnail : image_obj.thumnailUrl,
                width: image_obj.width,
                height: image_obj.height
              }
              this.userDataService.setItem({userObject:this.userObj});
            }
            else{
              this.userObj.profilePicture = null;
              this.userDataService.setItem({userObject:this.userObj});
              this.profilePicDeleting = false;
            }
          },
          error => {
            this.profilePicDeleting = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
    })();
  }

  passwordMatchValidator(control: AbstractControl): {[key:string]: boolean} | null{
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword.pristine || confirmPassword.pristine){
      return null
    }

    return newPassword && confirmPassword && newPassword.value != confirmPassword.value ? {'misMatch': true} : null;
  }

  onPasswordChangeSubmit(){
    this.passwordChangeLoadStatus = true;
    const passwordChangeValue = this.passwordChangeForm.value;

    (async () => {
      const TokenValid = await this.graphqlService.isTokenValid();
      if (TokenValid){
        this.graphqlService.graphqlMutation(PASSWORD_CHANGE, passwordChangeValue).pipe(take(1))
        .subscribe(
          (result:any) =>{
            this.passwordChangeLoadStatus = false;
            const data = result.data.passwordChange;
            if (!data.success){
              if (data.errors.oldPassword){
                this.passwordChangeFormError = true;
                this.passwordChangeFormErrorMessage = 'Your current password is <strong>Invalid</strong>';
              }
              else if (data.errors.newPassword2){
                this.passwordChangeFormError = true;
                this.passwordChangeFormErrorMessage = 'Your new password is <strong>too similar to the username</strong>';
              }
            }
            else{
              this.userDataService.setItem({accessToken:data.token, refreshToken:data.refreshToken});
              removeValidators(this.passwordChangeForm);
              this.passwordChangeForm.reset();
              this.panelOpenState = false;
              this.passwordChangeSubmited = true;
            }
          },
          error =>{
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
        this.passwordChangeLoadStatus = false;
      }
      else{
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        this.passwordChangeLoadStatus = false;
      }
    })();

  }

  logout(){
    this.authenticationService.logout();
  }

  deleteAccount(){
    if (!this.deleteModeActive){
      this.deleteModeActive = true;

      const dialogRef = this.matDialog.open(AlertBoxComponent, {
        width:'30%',
        backdropClass: ['frosted-glass-blur'],
        data: {
          title: 'Delete Account',
          message: 'Your account and all your data will be permanently deleted. Do you confirm?',
          singleAction: false,
          actionName: 'Delete',
        }
      });
  
      dialogRef.afterClosed().subscribe(response => {
        if (response === true){
          this.accountDeleting = true;

          (async () => {
            const TokenValid = await this.graphqlService.isTokenValid();
            if (TokenValid){
              this.graphqlService.graphqlMutation(DELETE_ACCOUNT).pipe(take(1))
              .subscribe(
                (result:any) => {
                  if (result.data?.deleteAccount?.result === true){
                    this.graphqlService.onLoginChange(false);
                    window.open(`${isDevMode() ? dev_prod.httpServerUrl_dev : dev_prod.httpServerUrl_prod}account-deleted/`);
                  }
                  else{
                    this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                    this.accountDeleting = false;
                    this.deleteModeActive = false;
                  }
                },
                error => {
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                  this.accountDeleting = false;
                  this.deleteModeActive = false;
                }
                
              );
            }
            else{
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              this.accountDeleting = false;
              this.deleteModeActive = false;
            }
          })();
        }
        else{
          this.deleteModeActive = false;
        }
      });
    }
  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
