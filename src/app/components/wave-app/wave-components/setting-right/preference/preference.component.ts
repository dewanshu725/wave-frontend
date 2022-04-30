import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';
import { CONTENT, INSTITUTION, USER_OBJ, USER_PREFERENCE } from 'src/app/_helpers/constents';
import { createInstitution } from 'src/app/_helpers/functions.utils';
import { CONNECT_INSTITUTION, DISCONNECT_INSTITUTION, RESEND_OTP_CONNECT_INSTITUTION, SEARCH_INSTITUTION, UPDATE_STUDENT_PROFILE, VERIFY_CONNECT_INSTITUTION } from 'src/app/_helpers/graphql.query';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { UserDataService } from 'src/app/_services/user-data.service';

export interface CREATE_INSTITUTION{
  search?: boolean,
  sendOTP?: boolean,
  verify?: boolean
}


@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.scss']
})

export class PreferenceComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private userDataService:UserDataService,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar,
    private matDialog:MatDialog
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();
  searchInputUnsub: Subscription;

  @ViewChild('searchInput') searchInput;

  settings:USER_PREFERENCE;
  settingsUpdating = false;

  userObj:USER_OBJ;

  institutionContent:CONTENT = null;
  institutionDisconnecting = false;
  editInstitution = false;
  settingsChanged = false;

  createInstitution = {
    search: false,
    sendOTP: false,
    verify: false
  }

  searchByName = true;
  searching = false;
  searchResult:CONTENT[] = [];
  searchedInstitution:INSTITUTION[] = [];

  selectedInstitution:INSTITUTION = null;
  selectedInstitutionContent:CONTENT;

  emailValidating = false;
  emailValidationError = false;
  collegeEmail:String;

  otpKey:string;
  resendOtp = false;
  resendingOtp = false;
  otpVerifying = false;


  ngOnInit(): void {
    this.userObj = this.userDataService.getItem({userObject:true}).userObject;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.userObj = this.userDataService.getItem({userObject:true}).userObject;
      this.updatedSettings();
    });

    this.updatedSettings();

    if (this.userObj.institution != null && this.userObj.institution.verified){
      this.institutionContent = this.createInstitutionContent(this.userObj.institution);
    }
    else{
      this.createInstitutionChange({search:true});
    }
  }

  updatedSettings(){
    this.settings = {
      locationPreference: this.userObj.locationPreference.toLowerCase(),
      agePreference: this.userObj.agePreference
    }

    this.settingsChanged = false;
  }

  createInstitutionChange(parems:CREATE_INSTITUTION){
    this.createInstitution = {
      search: parems.search === true ? true : false,
      sendOTP: parems.sendOTP === true ? true : false,
      verify: parems.verify === true ? true : false
    }

    if (this.createInstitution.search){
      setTimeout(() => this.searchInputSubscribe(), 500);
    }
    else if (this.createInstitution.sendOTP){
      this.emailValidating = false;
      this.emailValidationError = false;
    }
  }

  searchInputSubscribe(){
    if (this.searchInputUnsub) this.searchInputUnsub.unsubscribe();

    this.searchInputUnsub = fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      map((event:any) => {
        return event.target.value;
      }),
      filter(value => value != ""),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value:string):any => {
        this.searching = true;
        const mutationArrgs = {
          name: this.searchByName ? value : "",
          acronym: !this.searchByName ? value : ""
        };

        return this.graphqlService.graphqlQuery({query:SEARCH_INSTITUTION, variable:mutationArrgs, fetchPolicy:"network-only"})
        .valueChanges.pipe(
          take(1),
          catchError(error => {return of({result: null})})
        )
      })
    ).
    subscribe((result:any) => {
      this.searchResult = [];
      this.searchedInstitution = [];

      if (result.data?.allInstitution?.edges?.length > 0){
        result.data.allInstitution.edges.forEach(element => {
          const institution:INSTITUTION = createInstitution(element.node, false);
          this.searchedInstitution.push(institution);
          this.searchResult.push(this.createInstitutionContent(institution));
        });
      }

      this.searching = false;
    });
  }

  ageSlided(value){
    this.userObj.agePreference = value;
  }

  selectInstitution(institutionUID){
    const searchedInstitutionIndex = this.searchedInstitution.findIndex(institution => institution.uid === institutionUID);
    if (searchedInstitutionIndex > -1){
      this.selectedInstitution = this.searchedInstitution[searchedInstitutionIndex];
      this.selectedInstitutionContent = this.createInstitutionContent(this.selectedInstitution)
      this.createInstitutionChange({sendOTP:true});
    }
  }

  emailInputChanged(){
    if (this.emailValidationError === true) this.emailValidationError = false;
  }

  emailValidation(value:string){
    if (!this.emailValidating){
      this.emailValidating = true;

      if (value.match(`@${this.selectedInstitution.email_domain}`)){
        this.collegeEmail = value;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();
          if (tokenStatus){
            const mutationArrgs = {
              institutionUid: this.selectedInstitution.uid,
              email: value
            };

            this.graphqlService.graphqlMutation(CONNECT_INSTITUTION, mutationArrgs).pipe(take(1))
            .subscribe(
              (result:any) => {
                if (result.data?.connectInstitution?.result != null){
                  this.otpKey = result.data.connectInstitution.result;
                  this.emailValidating = false;
                  this.createInstitutionChange({verify:true});
                }
                else{
                  this.emailValidating = false;
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                }
              },
              error => {
                this.emailValidating = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
            );
          }
          else{
            this.emailValidating = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        })();
      }
      else{
        this.emailValidationError = true;
        this.emailValidating = false;
      }
    }
  }

  resendOtpForEmailValidation(){
    if (!this.resendingOtp && !this.otpVerifying){
      this.resendingOtp = true;

      (async () => {
        const tokenStatus = await this.graphqlService.isTokenValid();
        if (tokenStatus){
          this.graphqlService.graphqlMutation(RESEND_OTP_CONNECT_INSTITUTION, {key: this.otpKey}).pipe(take(1))
          .subscribe(
            (result:any) => {
              if (result.data?.resendOtpConnectInstitution?.result != null){
                this.otpKey = result.data.resendOtpConnectInstitution.result;
                this.resendingOtp = false;
                this.resendOtp = true;
              }
              else{
                this.resendingOtp = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
            },
            error => {
              this.resendingOtp = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          );
        }
        else{
          this.resendingOtp = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
      })();
    }
  }

  verify(otp:string){
    if (!this.resendingOtp && !this.otpVerifying && otp != null){
      this.otpVerifying = true;

      (async () => {
        const tokenStatus = await this.graphqlService.isTokenValid();
        if (tokenStatus){
          const mutationArrgs = {
            key: this.otpKey,
            verificationCode: Number(otp)
          }

          this.graphqlService.graphqlMutation(VERIFY_CONNECT_INSTITUTION, mutationArrgs).pipe(take(1))
          .subscribe(
            (result:any) => {
              if (result.data?.verifyConnectInstitution?.result === true){
                this.selectedInstitution.verified = true;
                this.userObj.institution = this.selectedInstitution;
                this.userDataService.setItem({userObject:this.userObj});
                this.appDataShareService.updateUserData.next(true);
                this.institutionContent = this.createInstitutionContent(this.userObj.institution);
                this.searchResult = [];
                this.searchedInstitution = [];
                this.selectedInstitution = null;
                this.selectedInstitutionContent = null;
              }
              else{
                this.snackBar.open("Incorrect OTP", "Try Again", {duration:2000});
              }

              this.otpVerifying = false;
            },
            error => {
              this.otpVerifying = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          );
        }
        else{
          this.otpVerifying = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
      })();
    }
  }

  createInstitutionContent(institution:INSTITUTION){
    const abbreviation = institution.abbreviation != null ? `${institution.abbreviation} | ` : null;
    const location = `${institution.location.region.name}, ${institution.location.country_code}`;

    const institutionContent = {
      id: institution.uid,
      image: institution.logo != null ? institution.logo.image : null,
      thumnail: institution.logo != null ? institution.logo.thumnail : null,
      title: institution.name,
      description: abbreviation != null ? abbreviation + location : location
    }

    return institutionContent;
  }


  updateInstituion(){
    this.editInstitution = !this.editInstitution;
    this.createInstitutionChange({search:!this.createInstitution.search});
  }

  updateSettings(parems:USER_PREFERENCE){
    if (parems.locationPreference){
      this.settings.locationPreference = parems.locationPreference;
    }
    
    if (parems.agePreference){
      this.settings.agePreference = parems.agePreference;
    }

    this.settingsChanged = true;
  }

  updateUserSettings(){
    this.settingsUpdating = true;

    (async () => {
      const tokenStatus = await this.graphqlService.isTokenValid();
        if (tokenStatus){
          const mutationArrgs = {
            locationPreference: this.settings.locationPreference,
            agePreference: this.settings.agePreference
          }

          this.graphqlService.graphqlMutation(UPDATE_STUDENT_PROFILE, mutationArrgs).pipe(take(1))
          .subscribe(
            (result:any) => {
              if (result.data?.updateStudentProfile?.result === true){
                this.userObj.locationPreference = this.settings.locationPreference;
                this.userObj.agePreference = this.settings.agePreference
                this.userDataService.setItem({userObject:this.userObj});
                this.appDataShareService.updateUserData.next(true);
                this.settingsChanged = false;
              }
              else{
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }

              this.settingsUpdating = false;
            },
            error => {
              this.settingsUpdating = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          );
        }
        else{
          this.settingsUpdating = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
    })();
  }

  confirmInstiutionDelection(){
    const dialogRef = this.matDialog.open(AlertBoxComponent, {
      width:'30%',
      backdropClass: ['frosted-glass-blur'],
      data: {
        title: 'Confirm',
        message: 'Do you want to remove your college from your profile?',
        singleAction: false,
        actionName: 'Remove',
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response){
        this.institutionDisconnecting = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();
          if (tokenStatus){
            this.graphqlService.graphqlMutation(DISCONNECT_INSTITUTION).pipe(take(1))
            .subscribe(
              (result:any) => {
                if (result.data?.disconnectInstitution?.result === true){
                  if (this.userObj.locationPreference === 'INSTITUTION'){
                    this.userObj.locationPreference = 'COUNTRY';
                  }
          
                  this.appDataShareService.vueFeedLocationPreferance = null;
                  this.createInstitutionChange({search: true});
                  this.institutionContent = null;
                  this.userObj.institution = null;
                  this.userDataService.setItem({userObject:this.userObj});
                }
                else{
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                }

                this.institutionDisconnecting = false;
              },
              error => {
                this.institutionDisconnecting = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
            );
          }
          else{
            this.institutionDisconnecting = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        })();
      }
    });
  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.searchInputUnsub) this.searchInputUnsub.unsubscribe();
  }

}
