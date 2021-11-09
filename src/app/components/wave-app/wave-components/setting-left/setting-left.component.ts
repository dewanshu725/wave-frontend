import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

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

  ngOnInit(): void {
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
