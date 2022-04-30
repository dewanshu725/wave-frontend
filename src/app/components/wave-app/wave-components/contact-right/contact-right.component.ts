import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';

@Component({
  selector: 'app-contact-right',
  templateUrl: './contact-right.component.html',
  styleUrls: ['./contact-right.component.scss']
})
export class ContactRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  contactOption:number;

  ngOnInit(): void {
    this.appDataShareService.contactOption.pipe(takeUntil(this.destroy$)).subscribe(result => this.contactOption = result);

    this.appDataShareService.appActivePath.contact.active = true;
    this.appDataShareService.appActivePath.contact.notification = false;
    this.appDataShareService.notification.next(true);
  }

  ngOnDestroy(){
    this.appDataShareService.appActivePath.contact.active = false;
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
