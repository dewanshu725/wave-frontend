import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { INTEREST_KEYWORD } from 'src/app/_helpers/constents';

@Component({
  selector: 'app-setting-left',
  templateUrl: './setting-left.component.html',
  styleUrls: ['./setting-left.component.scss']
})
export class SettingLeftComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }


  nav = {
    interest: false,
    preference: false
  }

  studentInterest:string[] = [];

  ngOnInit(): void {
    for (let [index, interest] of this.appDataShareService.studentInterest.entries()){
      if (index < 3){
        this.studentInterest.push(interest.name);
      }
      else{
        break;
      }
    }

    this.navStateChange('Interest');
  }

  navStateChange(state:string){
    if (state === 'Interest'){
      this.nav.interest = true;
      this.nav.preference = false;
    }
    else if (state === 'Preference'){
      this.nav.preference = true;
      this.nav.interest = false;
    }

    this.appDataShareService.settingsOption.next(state);
  }

  settingsNav(navButton: string){
    this.navStateChange(navButton);
  }

  ngOnDestroy(){
  }

}
