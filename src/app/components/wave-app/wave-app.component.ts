import { AuthenticationService } from './../../_services/authentication.service';
import { UserDataService } from './../../_services/user-data.service';
import { AppDataShareService } from './../../_services/app-data-share.service';
import { STUDENT_STATE_OBJ, USER_OBJ, ALERT_BOX, APP_ACTIVE_PATH } from './../../_helpers/constents';
import { ResponsiveService } from './../../_services/responsive.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NotificationService } from 'src/app/_services/notification.service';

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
    private notificationService:NotificationService,
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
  userDataUnsub:Subscription;

  notification:APP_ACTIVE_PATH;
  notificationUnsub:Subscription;

  navProfileState = false;
  navInterestState = false;
  navContactState = false;
  navSettingsState = false;


  ngOnInit(): void {
    this.userObj = this.userDataService.getItem({userObject:true}).userObject;

    this.userDataUnsub = this.appDataShareService.updateUserData.subscribe(() => {
      this.userObj = this.userDataService.getItem({userObject:true}).userObject;
    });

    this.notificationService.onInit();

    this.notification = this.appDataShareService.appActivePath;
    this.notificationUnsub = this.appDataShareService.notification
    .subscribe(() => {
      this.notification = this.appDataShareService.appActivePath;
      this.Ref.detectChanges();
    });
  }

  ngAfterViewInit(){
    this.appContainerHeight = this.appContainerElement.nativeElement.offsetHeight - 2;
    this.appContainerWidth = this.appContainerElement.nativeElement.offsetWidth;
    this.appRightContainerWidth = this.appRightContainer.nativeElement.offsetWidth;

    this.appDataShareService.appContainerWidth = this.appContainerWidth;
    this.appDataShareService.appRightContainerWidth = this.appRightContainerWidth;
    this.appDataShareService.appContainerHeight = this.appContainerHeight;

    const student_state:STUDENT_STATE_OBJ = this.userDataService.getItem({studentState:true}).studentState;
    if (student_state.initial_setup_done === false){
      this.navStateChange('settings');
      this.appDataShareService.initialSetup.next(true);
    }
    else{
      this.navStateChange('contact');
    }

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
      this.navProfileState = false;
      this.navSettingsState = false;
    }
    else if (newState === 'interest'){
      this.navInterestState = true;
      this.navContactState = false;
      this.navProfileState = false;
      this.navSettingsState = false;
    }
    else if (newState === 'profile'){
      this.navProfileState = true;
      this.navInterestState = false;
      this.navContactState = false;
      this.navSettingsState = false;
    }
    else if (newState === 'settings'){
      this.navSettingsState = true;
      this.navProfileState = false;
      this.navInterestState = false;
      this.navContactState = false;
    }
  }

  appNav(navButton: string){
    this.navStateChange(navButton);
  }

  onLogout(){
    this.authenticationService.logout();
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      this.appDataShareService.scrollEnd.next(true);
    }
  }


  ngOnDestroy(){
    this.userDataUnsub.unsubscribe();
    this.responsiveUnsub.unsubscribe();
    this.notificationUnsub.unsubscribe();

    this.notificationService.closeConnection();
  }


}
