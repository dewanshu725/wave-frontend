import { AppDataShareService } from './../../../../../_services/app-data-share.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';

@Component({
  selector: 'app-my-vue',
  templateUrl: './my-vue.component.html',
  styleUrls: ['./my-vue.component.scss']
})
export class MyVueComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private Ref:ChangeDetectorRef,
    private matDialog:MatDialog
    ) { }

  vue_backgorund_url:string;
  myVueEmpty:boolean;
  myVueArrayLength = 0;

  navCreatedVuesState = false;
  navCreateVueState = false;

  isVueConstructed = false;
  createVueStatusMessage:string;

  navStateChange(state:string){
    if (state === 'createdvues'){
      this.navCreatedVuesState = true;
      this.navCreateVueState = false;
    }
    else if (state === 'createvue'){
      this.navCreateVueState = true;
      this.navCreatedVuesState = false;
    }
  }

  createVueStatus(status:string){
    this.createVueStatusMessage = status;
  }

  vueConstructed(){
    this.isVueConstructed = true;
    this.appDataShareService.isVueConstructed.next(true);
  }

  ngOnInit(): void {
    this.vue_backgorund_url = this.appDataShareService.vue_background;
    this.navStateChange('createdvues');
  }

  backToMyvue(){
    if (this.isVueConstructed){
      const dialogRef = this.matDialog.open(AlertBoxComponent, {
        width:'30%',
        backdropClass: ['frosted-glass-blur'],
        data: {
          title: 'Confirm',
          message: 'Do you want to navigate back? Your current Vue will be lost!',
          singleAction: false,
          actionName: 'Yes',
        }
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response){
          this.navStateChange('createdvues');
          this.isVueConstructed = false;
          this.appDataShareService.isVueConstructed.next(false);
        }
      });
    }
    else{
      this.navStateChange('createdvues');
    }

  }

  vueSubmited(){
    this.navStateChange('createdvues');
    this.isVueConstructed = false;
    this.appDataShareService.isVueConstructed.next(false);
  }

  vueEmptyEvent(value){
    this.myVueEmpty = value;
    this.Ref.detectChanges();
  }

  reInitCreatedVue(value){
    if (value){
      this.navCreatedVuesState = false;
      this.appDataShareService.isVueConstructed.next(false);
      setTimeout(() => this.navCreatedVuesState = true, 500);
    }
  }

  vueArrayLengthEvent(value){
    this.myVueArrayLength = value;
    this.Ref.detectChanges();
  }

  ngOnDestroy(){
    this.appDataShareService.isVueConstructed.next(false);
  }

}
