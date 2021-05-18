import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { INTEREST_KEYWORD, LINK_PREVIEW, PAGE_INFO, dev_prod } from './../_helpers/constents';
import { BehaviorSubject } from 'rxjs';
import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppDataShareService {

  constructor() {
    isDevMode() ? this.vue_background="url('assets/svg/topography.svg')" : this.vue_background="url("+dev_prod.staticUrl_prod+'assets/svg/topography.svg'+")";
  }

  initialSetup = new BehaviorSubject<boolean>(null);

  interestOption = new BehaviorSubject<string>(null);
  settingsOption = new BehaviorSubject<string>(null);

  studentInterest:INTEREST_KEYWORD[] = []
  currentSelectedInterestArray:INTEREST_KEYWORD[] = [];

  // ------------------------------------------------  Selected Interest Subject --------------------------------------------------
  currentSelectedInterestSubject = new Subject<INTEREST_KEYWORD>();

  currentSelectedInterest(): Observable<INTEREST_KEYWORD> {
    return this.currentSelectedInterestSubject.asObservable();
  }
  // ------------------------------------------------  Selected Interest Subject --------------------------------------------------

  // ------------------------------------------------  Alert Box Subject --------------------------------------------------
  alertInput = new Subject<boolean | string>();

  alertResponse(): Observable<boolean | string> {
    return this.alertInput.asObservable();
  }
  // ------------------------------------------------  Alert Box Subject --------------------------------------------------


  // --------------------------------------------------Scroll End Subject ----------------------------------------------------
  scrollEnd = new Subject<boolean>();

  scrollEndReached(): Observable<boolean> {
    return this.scrollEnd.asObservable();
  }
  // --------------------------------------------------Scroll End Subject ----------------------------------------------------

  appContainerHeight:number;
  appContainerWidth:number;
  appRightContainerWidth:number;

  vue_background:string;

  locationEdited = false;

  myVueArray:LINK_PREVIEW[] = [];
  myVuePageInfo:PAGE_INFO;
  myVueArrayUpdated = false;
  resetMyVue(){
    this.myVueArray = [];
    this.myVuePageInfo = null;
    this.myVueArrayUpdated = false;
  }

  vueFeedArray:LINK_PREVIEW[] = [];
  vueFeedPageInfo:PAGE_INFO;
  vueFeedLastIndex:number;
  vueFeedArrayUpdated = false;
  resetVueFeed(){
    this.vueFeedArray = [];
    this.vueFeedPageInfo = null;
    this.vueFeedLastIndex = null;
    this.vueFeedArrayUpdated = false;
  }

  vueHistoryArray:LINK_PREVIEW[] = [];
  vueHistoryPageInfo:PAGE_INFO;
  vueHistoryArrayUpdated = false;
  resetVueHistory(){
    this.vueHistoryArray = [];
    this.vueHistoryPageInfo = null;
    this.vueHistoryArrayUpdated = false;
  }

  vueSavedArray:LINK_PREVIEW[] = [];
  vueSavedPageInfo:PAGE_INFO;
  vueSavedArrayUpdated = false;
  resetVueSaved(){
    this.vueSavedArray = [];
    this.vueSavedPageInfo = null;
    this.vueSavedArrayUpdated = false;
  }

  isVueConstructed = new BehaviorSubject<boolean>(null);
  isVueFeedGenerated:boolean;

  reset(){
    this.initialSetup.next(null);
    this.interestOption.next(null);
    this.settingsOption.next(null);
    this.studentInterest = [];
    this.currentSelectedInterestArray = [];
    this.myVueArray = [];
    this.appContainerHeight = null;
    this.appContainerWidth = null;
    this.appRightContainerWidth = null;
    this.locationEdited = null;

    this.resetMyVue();

    this.resetVueFeed();

    this.resetVueHistory();

    this.resetVueSaved();

    this.isVueConstructed.next(null);
    this.isVueFeedGenerated = null;
  }

}
