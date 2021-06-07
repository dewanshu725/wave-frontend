import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  svg(username:string): SafeHtml{
    return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));
  }

}
