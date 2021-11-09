import {
   ACCESS_TOKEN,
   REFRESH_TOKEN,
   TRUSTED_DEVICE,
   USER_OBJ,
   STUDENT_STATE_OBJ,
   INTEREST_CATEGORY
  } from './../_helpers/constents';

import { Injectable } from '@angular/core';
import { AppDataShareService } from './app-data-share.service';

export interface setDataParems{
  accessToken?:string,
  refreshToken?:string,
  userObject?:USER_OBJ,
  studentState?:string,
  interestCategory?:string
}

export interface getUserData{
  accessToken?:string,
  refreshToken?:string,
  userObject?:USER_OBJ,
  studentState?:STUDENT_STATE_OBJ,
  interestCategory?:INTEREST_CATEGORY[]
}

export interface getDataParems{
  accessToken?:boolean,
  refreshToken?:boolean,
  userObject?:boolean,
  studentState?:boolean,
  interestCategory?:boolean
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(private appDataShareService:AppDataShareService) { }

  private accessToken:string;
  private refreshToken:string;
  private userObject:string;
  private studentState:string;
  private interestCategory:string;

  setItem(parems:setDataParems){

    if (localStorage.getItem(TRUSTED_DEVICE)){
      parems.accessToken ? localStorage.setItem(ACCESS_TOKEN, parems.accessToken) : null;
      parems.refreshToken ? localStorage.setItem(REFRESH_TOKEN, parems.refreshToken) : null;
    }
    else{
      parems.accessToken ? this.accessToken = parems.accessToken : null;
      parems.refreshToken ? this.refreshToken = parems.refreshToken : null;
    }

    parems.userObject ? this.userObject = JSON.stringify(parems.userObject) : null;
    parems.studentState ? this.studentState = parems.studentState : null;
    parems.interestCategory ? this.interestCategory = parems.interestCategory : null;

    this.appDataShareService.updateUserData.next(true);
  }

  getItem(parems:getDataParems){

    const userData:getUserData = {};

    if (localStorage.getItem(TRUSTED_DEVICE)){
      parems.accessToken ? userData.accessToken = localStorage.getItem(ACCESS_TOKEN) : null;
      parems.refreshToken ? userData.refreshToken = localStorage.getItem(REFRESH_TOKEN) : null;
    }
    else{
      parems.accessToken ? userData.accessToken = this.accessToken : null;
      parems.refreshToken ? userData.refreshToken = this.refreshToken : null;
    }

    parems.userObject ? userData.userObject = (this.userObject ? JSON.parse(this.userObject) : null) : null;
    parems.studentState ? userData.studentState = (this.studentState ? JSON.parse(this.studentState) : null) : null;
    parems.interestCategory ? userData.interestCategory = (this.interestCategory ? JSON.parse(this.interestCategory) : null) : null;

    return userData;
  }

  removeItem(){
    this.accessToken = null;
    this.refreshToken = null;
    this.userObject = null;
    this.studentState = null;
    this.interestCategory = null;
    localStorage.removeItem(TRUSTED_DEVICE);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  }
}
