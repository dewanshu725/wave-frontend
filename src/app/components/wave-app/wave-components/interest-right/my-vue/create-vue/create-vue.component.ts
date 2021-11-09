import { INTEREST_KEYWORD } from './../../../../../../_helpers/constents';
import { ResponsiveService } from './../../../../../../_services/responsive.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AppDataShareService } from './../../../../../../_services/app-data-share.service';

@Component({
  selector: 'app-create-vue',
  templateUrl: './create-vue.component.html',
  styleUrls: ['./create-vue.component.scss']
})
export class CreateVueComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private responsiveService:ResponsiveService,
  ) { }

  @Output() linkResultStatus = new EventEmitter();
  @Output() vueConstructed = new EventEmitter();
  @Output() vueSubmited = new EventEmitter();

  isMobile:boolean;

  currentSelectedInterest:INTEREST_KEYWORD[] = [];
  selectedInterestUnsub: Subscription;

  ngOnInit(): void {
    this.isMobile = this.responsiveService.isMobile;

    this.currentSelectedInterest = this.appDataShareService.currentSelectedInterestArray;

    this.selectedInterestUnsub = this.appDataShareService.currentSelectedInterest
    .subscribe(result =>{
      this.currentSelectedInterest = this.appDataShareService.currentSelectedInterestArray;
    });

    this.vueConstructed.emit(true);
  }

  ngOnDestroy(){
    this.selectedInterestUnsub.unsubscribe();
    this.currentSelectedInterest = [];
  }

}
