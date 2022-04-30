import { AuthenticationService } from './../../_services/authentication.service';
import { UserDataService } from './../../_services/user-data.service';
import { AppDataShareService } from './../../_services/app-data-share.service';
import { USER_OBJ, APP_ACTIVE_PATH } from './../../_helpers/constents';
import { ResponsiveService } from './../../_services/responsive.service';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NotificationService } from 'src/app/_services/notification.service';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';

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
    private Ref:ChangeDetectorRef,
    private title:Title, 
    private meta:Meta
    ) { }

  @ViewChild('appContainer') appContainerElement: ElementRef;
  @ViewChild('appRightContainer') appRightContainer: ElementRef;

  metaTags:MetaDefinition[] = [
    {name: "title", content: "Wave"}
  ];

  destroy$: Subject<boolean> = new Subject<boolean>();

  appColum = 'col-10';

  appContainerHeight:number;
  appContainerWidth:number;
  appRightContainerWidth:number;

  userObj:USER_OBJ;

  notification:APP_ACTIVE_PATH;

  navProfileState = false;
  navInterestState = false;
  navContactState = false;
  navSettingsState = false;


  ngOnInit(): void {
    this.title.setTitle("Wave");
    this.meta.addTags(this.metaTags);

    this.userObj = this.userDataService.getItem({userObject:true}).userObject;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.userObj = this.userDataService.getItem({userObject:true}).userObject;
    });

    this.notificationService.onInit();

    this.notification = this.appDataShareService.appActivePath;
    this.appDataShareService.notification.pipe(takeUntil(this.destroy$)).subscribe(() => {
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

    this.navStateChange('interest');

    this.Ref.detectChanges();

    this.responsiveService.getScreenWidthStatus().pipe(takeUntil(this.destroy$)).subscribe( () =>{
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
    this.destroy$.next(true);
    this.destroy$.unsubscribe();

    this.notificationService.closeConnection();
  }


}
