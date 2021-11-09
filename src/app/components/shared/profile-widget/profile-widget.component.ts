import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';

@Component({
  selector: 'app-profile-widget',
  templateUrl: './profile-widget.component.html',
  styleUrls: ['./profile-widget.component.scss']
})
export class ProfileWidgetComponent implements OnInit {

  constructor(private domSanitizer: DomSanitizer) { }

  @Input() public photoUrl: string = null;
  @Input() public displyText: string;
  @Input() public bgColor = true;
  @Input() public size: string;

  public showInitials = false;
  public initials: string;
  public circleColor: string;
  public circleSize: string;

  private colors = [
      '#25282A', // space gray
      '#4E5851', // midnight green
      '#1F2020', // black
      '#FFE681', // light yellow
      '#BA0C2E', // red
  ];

  ngOnInit() {

      if (!this.photoUrl) {
          this.showInitials = true;
          this.createInititals();

          const randomIndex = Math.floor(Math.random() * Math.floor(this.colors.length));
          this.circleColor = this.colors[randomIndex];
      }
  }

  svg(username:string): SafeHtml{
    return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));
  }

  private createInititals(): void {
      let initials;
      initials  = this.displyText.charAt(0).toUpperCase();
      this.initials = initials;
  }

}
