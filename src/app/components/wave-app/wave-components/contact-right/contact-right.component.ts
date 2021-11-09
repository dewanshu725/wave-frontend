import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';

@Component({
  selector: 'app-contact-right',
  templateUrl: './contact-right.component.html',
  styleUrls: ['./contact-right.component.scss']
})
export class ContactRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  contactOption:number;
  contactOptionUnsub: Subscription;

  ngOnInit(): void {
    this.contactOptionUnsub = this.appDataShareService.contactOption.subscribe(result => this.contactOption = result);

    this.appDataShareService.appActivePath.contact.active = true;
    this.appDataShareService.appActivePath.contact.notification = false;
    this.appDataShareService.notification.next(true);
  }

  ngOnDestroy(){
    this.contactOptionUnsub.unsubscribe();
    this.appDataShareService.appActivePath.contact.active = false;
  }

}
