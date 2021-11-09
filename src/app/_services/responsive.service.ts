import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private isMobileSubject = new Subject();
  public isMobile: boolean;

  private screenWidthSubject = new Subject();
  public screenWidth: string;
  public screenSize:number;

  constructor() {
    this.checkWidth();
  }

  onMobileChange(status: boolean) {
    this.isMobile = status;
    this.isMobileSubject.next(status);
  }

  onScreenWidthChange(status: string, screenSize:number) {
    this.screenWidth = status;
    this.screenWidthSubject.next(status);
    this.screenSize = screenSize;
  }

  getMobileStatus(): Observable<any> {
      return this.isMobileSubject.asObservable();
  }

  getScreenWidthStatus(): Observable<any> {
    return this.screenWidthSubject.asObservable();
  }

  public checkWidth() {
      const width = window.innerWidth;
      if (width < 576) {
        this.onScreenWidthChange('xs', width);
        this.onMobileChange(true);
      }
      else if(width >= 576 && width < 768) {
        this.onScreenWidthChange('sm', width);
        this.onMobileChange(true);
      }
      else if (width >= 768 && width < 992) {
          this.onScreenWidthChange('md', width);
          this.onMobileChange(true);
      }
      else if (width >= 992 && width < 1200) {
        this.onScreenWidthChange('lg', width);
        this.onMobileChange(false);
    }
    else {
      this.onScreenWidthChange('xl', width);
      this.onMobileChange(false);
    }
  }
}
