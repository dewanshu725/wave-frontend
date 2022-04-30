import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-setting-right',
  templateUrl: './setting-right.component.html',
  styleUrls: ['./setting-right.component.scss']
})
export class SettingRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  settingsOption:string;

  ngOnInit(): void {
    this.appDataShareService.settingsOption.pipe(takeUntil(this.destroy$)).subscribe(result =>{this.settingsOption = result});
  }

  ngOnDestroy(){
    this.appDataShareService.settingsOption.next(null);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
