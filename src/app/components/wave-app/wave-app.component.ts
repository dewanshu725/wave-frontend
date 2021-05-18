import { AuthenticationService } from './../../_services/authentication.service';
import { UserDataService } from './../../_services/user-data.service';
import { AppDataShareService } from './../../_services/app-data-share.service';
import { STUDENT_STATE_OBJ, USER_OBJ, ALERT_BOX } from './../../_helpers/constents';
import { ResponsiveService } from './../../_services/responsive.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-wave-app',
  templateUrl: './wave-app.component.html',
  styleUrls: ['./wave-app.component.scss']
})
export class WaveAppComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private responsiveService: ResponsiveService,
    private appDataShareService:AppDataShareService,
    private userDataService:UserDataService,
    private authenticationService:AuthenticationService,
    private Ref:ChangeDetectorRef
    ) { }

  @ViewChild('appContainer') appContainerElement: ElementRef;
  @ViewChild('appRightContainer') appRightContainer: ElementRef;

  responsiveUnsub: Subscription;
  appColum = 'col-10';

  appContainerHeight:number;
  appContainerWidth:number;
  appRightContainerWidth:number;

  userObj:USER_OBJ;
  alertBox:ALERT_BOX = {
    open:false,
    message:null
  }
  alertBoxUnsub:Subscription;

  profileState = false;
  navInterestState = false;
  navContactState = false;
  navChatState = false;
  navIngageState= false;
  navSettingsState = false;


  ngOnInit(): void {
    const loggedInUser = this.userDataService.getItem({userObject:true, studentState:true});
    this.userObj = loggedInUser.userObject;
    const student_state:STUDENT_STATE_OBJ = loggedInUser.studentState;

    if (!student_state.initial_setup_done){
      this.navStateChange('settings');
      this.appDataShareService.initialSetup.next(true);
    }
    else{
      this.navStateChange('contact');
    }

    this.alertBoxUnsub = this.appDataShareService.alertInput
    .subscribe((message:string | null) =>{
      if (message != null){
        this.alertBox = {
          open:true,
          message:message
        }
      }
    });
  }

  ngAfterViewInit(){
    this.appContainerHeight = this.appContainerElement.nativeElement.offsetHeight - 2;
    this.appContainerWidth = this.appContainerElement.nativeElement.offsetWidth;
    this.appRightContainerWidth = this.appRightContainer.nativeElement.offsetWidth;
    this.appDataShareService.appContainerHeight = this.appContainerHeight;
    this.appDataShareService.appContainerWidth = this.appContainerWidth;
    this.appDataShareService.appRightContainerWidth = this.appRightContainerWidth;
    this.Ref.detectChanges();

    this.responsiveUnsub = this.responsiveService.getScreenWidthStatus()
    .subscribe( () =>{
      this.appContainerHeight = this.appContainerElement.nativeElement.offsetHeight - 2;
      this.appContainerWidth = this.appContainerElement.nativeElement.offsetWidth;
      this.appRightContainerWidth = this.appRightContainer.nativeElement.offsetWidth;
      this.appDataShareService.appContainerHeight = this.appContainerHeight;
      this.appDataShareService.appContainerWidth = this.appContainerWidth;
      this.appDataShareService.appRightContainerWidth = this.appRightContainerWidth;
      this.Ref.detectChanges();
    });
  }

  navStateChange(newState:string){
    if (newState === 'contact'){
      this.navContactState = true;
      this.navInterestState = false;
      this.navChatState = false;
      this.navIngageState= false;
      this.navSettingsState = false;
    }
    else if (newState === 'interest'){
      this.navInterestState = true;
      this.navContactState = false;
      this.navChatState = false;
      this.navIngageState= false;
      this.navSettingsState = false;
    }
    else if (newState === 'chat'){
      this.navChatState = true;
      this.navInterestState = false;
      this.navContactState = false;
      this.navIngageState= false;
      this.navSettingsState = false;
    }
    else if (newState === 'ingage'){
      this.navIngageState= true;
      this.navChatState = false;
      this.navInterestState = false;
      this.navContactState = false;
      this.navSettingsState = false;
    }
    else if (newState === 'settings'){
      this.navSettingsState = true;
      this.navIngageState= false;
      this.navChatState = false;
      this.navInterestState = false;
      this.navContactState = false;
    }
  }

  appNav(navButton: string){
    this.navStateChange(navButton);
  }

  profileNav(navButton: string){
    this.profileState = !this.profileState;
  }

  onLogout(){
    this.authenticationService.logout();
  }

  alertResponse(response){
    this.appDataShareService.alertInput.next(response);
    this.alertBox = {
      open:false,
      message:null
    }
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      this.appDataShareService.scrollEnd.next(true);
    }
  }

  ngOnDestroy(){
    this.responsiveUnsub.unsubscribe();
    this.alertBoxUnsub.unsubscribe();
  }


}
