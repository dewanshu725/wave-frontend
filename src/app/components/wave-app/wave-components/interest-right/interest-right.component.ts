import { Subscription } from 'rxjs';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-interest-right',
  templateUrl: './interest-right.component.html',
  styleUrls: ['./interest-right.component.scss']
})
export class InterestRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  interestOption:string;
  interestOptionUnsub: Subscription;

  ngOnInit(): void {
    this.interestOptionUnsub = this.appDataShareService.interestOption.subscribe(result =>{this.interestOption = result;});
  }

  reInitVueSaved(){
    this.interestOption = null;
    this.appDataShareService.isVueConstructed.next(false);
    setTimeout(() => this.interestOption = 'savedvue', 500);
  }

  ngOnDestroy(){
    this.interestOptionUnsub.unsubscribe();
  }

}
