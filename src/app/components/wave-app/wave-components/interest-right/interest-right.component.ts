import { Subject } from 'rxjs';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-interest-right',
  templateUrl: './interest-right.component.html',
  styleUrls: ['./interest-right.component.scss']
})
export class InterestRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  interestOption:string;

  ngOnInit(): void {
    this.appDataShareService.interestOption.pipe(takeUntil(this.destroy$)).subscribe(result => this.interestOption = result);

    this.appDataShareService.appActivePath.interest.active = true;
    this.appDataShareService.appActivePath.interest.notification = false;
  }

  reInitVueSaved(){
    this.interestOption = null;
    this.appDataShareService.isVueConstructed.next(false);
    setTimeout(() => this.interestOption = 'savedvue', 500);
  }

  ngOnDestroy(){
    this.appDataShareService.appActivePath.interest.active = false;

    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}