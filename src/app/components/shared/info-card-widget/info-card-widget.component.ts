import { STUDENT_INFO_CARD_DATA } from './../../../_helpers/constents';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';

@Component({
  selector: 'app-info-card-widget',
  templateUrl: './info-card-widget.component.html',
  styleUrls: ['./info-card-widget.component.scss']
})
export class InfoCardWidgetComponent implements OnInit {

  constructor(private domSanitizer: DomSanitizer) { }

  @Input() infoCardData:STUDENT_INFO_CARD_DATA;


  svg(username:string): SafeHtml{
    return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));
  }


  ngOnInit(): void {
  }

}
