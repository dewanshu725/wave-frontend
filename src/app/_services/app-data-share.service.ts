import { Subject } from 'rxjs';
import { INTEREST_KEYWORD, LINK_PREVIEW, PAGE_INFO, dev_prod, ALL_INTERACTION, APP_ACTIVE_PATH, APP_NOTIFICATION, DISCOVERY } from './../_helpers/constents';
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
  contactOption = new  BehaviorSubject<number>(null);
  settingsOption = new BehaviorSubject<string>(null);

  studentInterest:INTEREST_KEYWORD[] = []
  currentSelectedInterestArray:INTEREST_KEYWORD[] = [];

  // ------------------------------------------------  Selected Interest Subject --------------------------------------------------
  currentSelectedInterest = new Subject<INTEREST_KEYWORD>();
  // ------------------------------------------------  Selected Interest Subject ------------------------------------------

  
  // --------------------------------------------------Scroll End Subject -------------------------------------------------
  scrollEnd = new Subject<boolean>();
  // --------------------------------------------------Scroll End Subject ----------------------------------------------------


  // --------------------------------------------------Change Contact Subject---------------------------------------
  changeContact = new Subject<string>();
  // --------------------------------------------------Change Contact Subject----------------------------------------


  // --------------------------------------------------Change Contact Section Subject---------------------------------------
  changeContactSection = new Subject<number>();
  // --------------------------------------------------Change Contact Section Subject----------------------------------------

  // --------------------------------------------------Update User Data Subject---------------------------------------
  updateUserData = new Subject<boolean>();
  // --------------------------------------------------Update User Data Subject----------------------------------------
  
  // --------------------------------------------------Update Contact Section Subject---------------------------------------
  updateContactSection = new Subject<string>();
  // --------------------------------------------------Update Contact Section Subject----------------------------------------

  // --------------------------------------------------Update Contact Section Subject----------------------------------------
  notifyUpdates = new Subject<string>();
  // --------------------------------------------------Update Contact Section Subject----------------------------------------

  // --------------------------------------------------Nontifications--------------------------------------------------------
  notification = new Subject<boolean>();
  // --------------------------------------------------Nontifications--------------------------------------------------------

  appContainerHeight:number;
  appContainerWidth:number;
  appRightContainerWidth:number;

  vue_background:string;

  locationEdited = false;

  myVueArray:LINK_PREVIEW[] = [];
  myVuePageInfo:PAGE_INFO;
  resetMyVue(){
    this.myVueArray = [];
    this.myVuePageInfo = null;
  }

  myDiscoveryArray:DISCOVERY[] = [];

  vueFeedIds:string[] = [];
  vueFeedArray:LINK_PREVIEW[] = [];
  vueFeedLocationPreferance:string = null;
  resetVueFeed(){
    this.vueFeedIds = [];
    this.vueFeedArray = [];
    this.vueFeedLocationPreferance = null;
  }

  vueHistoryArray:LINK_PREVIEW[] = [];
  vueHistoryPageInfo:PAGE_INFO;
  resetVueHistory(){
    this.vueHistoryArray = [];
    this.vueHistoryPageInfo = null;
  }

  vueSavedArray:LINK_PREVIEW[] = [];
  vueSavedPageInfo:PAGE_INFO;
  resetVueSaved(){
    this.vueSavedArray = [];
    this.vueSavedPageInfo = null;
  }

  isVueConstructed = new BehaviorSubject<boolean>(null);
  isVueFeedGenerated:boolean;

  allInteraction:ALL_INTERACTION = {
    explorers: [],
    converse: [],
    draft_converse: []
  }

  appActivePath:APP_ACTIVE_PATH = {
    interest:{
      active: false,
      notification: false,
      vue_feed:{active: false, notification: false},
      vue_history:{active: false, notification: false},
      vue_save:{active: false, notification: false},
      your_vue:{active: false, notification: false}
    },
    contact:{
      active: false,
      notification: false,
      explorers:{
        active: false,
        notification: false,
        chat:{
          active: false,
          notification: false
        },
        converse:{
          active: false,
          notification: false
        }
      },
      converse:{active: false, notification: false},
      draft:{active: false, notification: false}
    }
  }
  resetAppActivePath(){
    this.appActivePath = {
      interest:{
        active: false,
        notification: false,
        vue_feed:{active: false, notification: false},
        vue_history:{active: false, notification: false},
        vue_save:{active: false, notification: false},
        your_vue:{active: false, notification: false}
      },
      contact:{
        active: false,
        notification: false,
        explorers:{
          active: false,
          notification: false,
          chat:{
            active: false,
            notification: false
          },
          converse:{
            active: false,
            notification: false
          }
        },
        converse:{active: false, notification: false},
        draft:{active: false, notification: false}
      }
    }
  }



  appNotification(parems:APP_NOTIFICATION){
    if (parems.interest_vue_feed){
      if (!this.appActivePath.interest.active){
        this.appActivePath.interest.notification = true;
        this.appActivePath.interest.vue_feed.notification = true;
      }
      else if (!this.appActivePath.interest.vue_feed.active){
        this.appActivePath.interest.vue_feed.notification = true;
      }
    }
    else if (parems.interest_vue_history){
      if (!this.appActivePath.interest.active){
        this.appActivePath.interest.notification = true;
        this.appActivePath.interest.vue_history.notification = true;
      }
      else if (!this.appActivePath.interest.vue_history.active){
        this.appActivePath.interest.vue_history.notification = true;
      }
    }
    else if (parems.interest_vue_save){
      if (!this.appActivePath.interest.active){
        this.appActivePath.interest.notification = true;
        this.appActivePath.interest.vue_save.notification = true;
      }
      else if (!this.appActivePath.interest.vue_save.active){
        this.appActivePath.interest.vue_save.notification = true;
      }
    }
    else if (parems.interest_your_vue){
      if (!this.appActivePath.interest.active){
        this.appActivePath.interest.notification = true;
        this.appActivePath.interest.your_vue.notification = true;
      }
      else if (!this.appActivePath.interest.your_vue.active){
        this.appActivePath.interest.your_vue.notification = true;
      }
    }

    else if (parems.contact_explorers_chat){
      if (!this.appActivePath.contact.active){
        this.appActivePath.contact.notification = true;
        this.appActivePath.contact.explorers.notification = true;
        this.appActivePath.contact.explorers.chat.notification = true;
      }
      else if (!this.appActivePath.contact.explorers.active){
        this.appActivePath.contact.explorers.notification = true;
        this.appActivePath.contact.explorers.chat.notification = true;
      }
      else if (!this.appActivePath.contact.explorers.chat.active){
        this.appActivePath.contact.explorers.chat.notification = true;
      }
    }
    else if (parems.contact_explorers_converse){
      if (!this.appActivePath.contact.active){
        this.appActivePath.contact.notification = true;
        this.appActivePath.contact.explorers.notification = true;
        this.appActivePath.contact.explorers.converse.notification = true;
      }
      else if (!this.appActivePath.contact.explorers.active){
        this.appActivePath.contact.explorers.notification = true;
        this.appActivePath.contact.explorers.converse.notification = true;
      }
      else if (!this.appActivePath.contact.explorers.converse.active){
        this.appActivePath.contact.explorers.converse.notification = true;
      }
    }
    else if (parems.contact_converse){
      if (!this.appActivePath.contact.active){
        this.appActivePath.contact.notification = true;
        this.appActivePath.contact.converse.notification = true;
      }
      else if (!this.appActivePath.contact.converse.active){
        this.appActivePath.contact.converse.notification = true;
      }
    }
    else if (parems.contact_draft){
      if (!this.appActivePath.contact.active){
        this.appActivePath.contact.notification = true;
        this.appActivePath.contact.draft.notification = true;
      }
      else if (!this.appActivePath.contact.draft.active){
        this.appActivePath.contact.draft.notification = true;
      }
    }

    this.notification.next(true);
  }
  

  reset(){
    this.initialSetup.next(null);
    this.interestOption.next(null);
    this.contactOption.next(null);
    this.settingsOption.next(null);
    this.studentInterest = [];
    this.currentSelectedInterestArray = [];
    this.myVueArray = [];
    this.myDiscoveryArray = [];
    this.appContainerHeight = null;
    this.appContainerWidth = null;
    this.appRightContainerWidth = null;
    this.locationEdited = null;
    this.allInteraction = {explorers:[], converse:[], draft_converse:[]};

    this.resetAppActivePath();

    this.resetMyVue();

    this.resetVueFeed();

    this.resetVueHistory();

    this.resetVueSaved();

    this.isVueConstructed.next(null);
    this.isVueFeedGenerated = null;
  }

}
