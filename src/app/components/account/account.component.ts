import { dev_prod } from './../../_helpers/constents';
import { take, takeUntil } from 'rxjs/operators';
import { EMAIL_CHECK, RESET_PASSSWORD, SEND_PASSWORD_RESET_OTP_FOR_EMAIL, SEND_PASSWORD_RESET_OTP_FOR_USERNAME, USERNAME_CHECK } from './../../_helpers/graphql.query';
import { GraphqlService } from './../../_services/graphql.service';
import { AuthenticationService } from './../../_services/authentication.service';
import { Component, isDevMode, OnInit, OnDestroy} from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  constructor(
    private authenticationService: AuthenticationService,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar,
    private title:Title, 
    private meta:Meta
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  metaTags:MetaDefinition[] = [
    {name: "title", content: "Login | Wave"}
  ];
  
  wave_long_logo_url:string;
  home_url:string;
  create_account_url:string;

  usernameIdentifier = false;
  loading = false;

  accountForm: FormGroup;
  accountInvalid = false;
  accountNotActivated = false;
  accountInvalidCredentials = false;
  otpInvalid = false;
  confirmPasswordHidden = true;

  resetPasswordKey:string;



  ngOnInit(): void {
    this.title.setTitle("Login | Wave");
    this.meta.addTags(this.metaTags);

    if (isDevMode()){
      this.wave_long_logo_url = 'assets/svg/long-logo.svg';
      this.home_url = dev_prod.httpServerUrl_dev;
      this.create_account_url = dev_prod.httpServerUrl_dev + 'create-account/';
    }
    else{
      this.wave_long_logo_url = dev_prod.staticUrl_prod + 'assets/svg/long-logo.svg';
      this.home_url = dev_prod.httpServerUrl_prod;
      this.create_account_url = dev_prod.httpServerUrl_prod + 'create-account/';
    }

    this.accountForm = new FormGroup({
      'login': new FormGroup({
        'username/email': new FormControl(null, Validators.required),
        'password': new FormControl(null, Validators.required),
        'keepMeLogined': new FormControl(null, Validators.required),
      }),
      'resetPassword': new FormGroup({
        'otp': new FormControl(null, Validators.required),
        'password': new FormControl(null, [Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[!@#$%^&*]).{8,}$')]),
        'confirmPassword': new FormControl(null, Validators.required),
      }, {validators: this.passwordMatchValidator})
    })

    this.accountForm.get('login.username/email').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.accountInvalid = false;
    });

    this.accountForm.get('login.password').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.accountNotActivated = false;
      this.accountInvalidCredentials = false;
    });

    this.accountForm.get('resetPassword.otp').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.otpInvalid = false;
    });
  }
  
  passwordMatchValidator(control: AbstractControl): {[key:string]: boolean} | null{
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password.pristine || confirmPassword.pristine){
      return null
    }

    return password && confirmPassword && password.value != confirmPassword.value ? {'misMatch': true} : null;
  }

  verifyAccount(stepper: MatStepper){
    if (!this.loading){
      this.loading = true;

      const accountIdetifier = this.accountForm.get('login.username/email').value.match(/@/g);

      if (accountIdetifier != null){
        if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(this.accountForm.get('login.username/email').value)){
          this.loading = false;
          this.accountInvalid = true;
        }
        else{
          this.graphqlService.graphqlMutation(EMAIL_CHECK, {email: this.accountForm.get('login.username/email').value}).pipe(take(1))
          .subscribe(
            (result:any) => {
              if (result.data?.emailUsernameCheck?.email === false){
                this.loading = false;
                this.usernameIdentifier = false;
                stepper.next();
              }
              else{
                this.loading = false;
                this.accountInvalid = true;
              }
            },
            error => {
              this.loading = false;
              this.accountInvalid = true;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          );
        }
      }
      else{
        if (!/^[_A-z0-9]*((-|)*[_A-z0-9])*$/.test(this.accountForm.get('login.username/email').value)){
          this.loading = false;
          this.accountInvalid = true;
        }
        else{
          this.graphqlService.graphqlMutation(USERNAME_CHECK, {username: this.accountForm.get('login.username/email').value}).pipe(take(1))
          .subscribe(
            (result:any) => {
              if (result.data?.emailUsernameCheck?.username === false){
                this.loading = false;
                this.usernameIdentifier = true;
                stepper.next();
              }
              else{
                this.loading = false;
                this.accountInvalid = true;
              }
            },
            error => {
              this.loading = false;
              this.accountInvalid = true;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          );
        }
      }
    }
  }

  loginFormSubmit(){
    if (!this.loading){
      this.loading = true;

      (async () => {
        const login = await this.authenticationService.login(
          this.accountForm.get('login.username/email').value,
          this.accountForm.get('login.password').value,
          this.usernameIdentifier,
          this.accountForm.get('login.keepMeLogined').value
        );

        if (login === false){
          if (this.authenticationService.loginErrorCodeSubject === 'not_verified'){
            this.accountNotActivated = true;
          }
          else if (this.authenticationService.loginErrorCodeSubject === 'invalid_credentials'){
            this.accountInvalidCredentials = true;
          }

          this.loading = false;
        }

      })();
    }
  }


  sendPasswordResetOtp(stepper: MatStepper){
    if (!this.loading){
      this.loading = true;

      let QUERY_TYPE;
      let mutationArrgs;

      if (this.usernameIdentifier){
        QUERY_TYPE = SEND_PASSWORD_RESET_OTP_FOR_USERNAME;
        mutationArrgs = {username: this.accountForm.get('login.username/email').value};
      }
      else{
        QUERY_TYPE = SEND_PASSWORD_RESET_OTP_FOR_EMAIL;
        mutationArrgs = {email: this.accountForm.get('login.username/email').value};
      }

      this.graphqlService.graphqlMutation(QUERY_TYPE, mutationArrgs).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data?.sendPasswordResetOtp?.key != null){
            this.resetPasswordKey = result.data.sendPasswordResetOtp.key;
            stepper.next();
          }
          else{
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }

          this.loading = false;
        },
        error => {
          this.loading = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
      );
    }
  }


  resetPassword(stepper: MatStepper){
    if (!this.loading){
      this.loading = true;

      if (this.accountForm.get('resetPassword.otp').value.toString().length > 6){
        this.otpInvalid = true;
        this.loading = false;
      }
      else{
        const mutationArrgs = {
          key: this.resetPasswordKey,
          verificationCode: this.accountForm.get('resetPassword.otp').value,
          password: this.accountForm.get('resetPassword.password').value
        }
    
        this.graphqlService.graphqlMutation(RESET_PASSSWORD, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) => {
            if (result.data?.passwordReset?.result === true){
              this.snackBar.open("Password Changed", "Successfully", {duration:2000});
              stepper.previous();
            }
            else{
              this.otpInvalid = true;
            }
    
            this.loading = false;
          },
          error => {
            this.loading = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
    }
  }



  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
