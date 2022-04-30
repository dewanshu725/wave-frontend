import { Subject } from 'rxjs';
import { INTEREST_KEYWORD } from './../../../../_helpers/constents';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-interest-left',
  templateUrl: './interest-left.component.html',
  styleUrls: ['./interest-left.component.scss']
})
export class InterestLeftComponent implements OnInit, OnDestroy {

  constructor(
    private snackBar: MatSnackBar,
    private appDataShareService:AppDataShareService,
    private Ref:ChangeDetectorRef
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  studentInterests:INTEREST_KEYWORD[] = [];
  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelectedCounter = 0;

  navVuesState = false;
  navMyvueState = false;
  navSavedvueState = false;
  navVuehistoryState = false;

  isVueConstructed = false;

  interestClicked(interest){
    if (!interest.selected && this.interestSelectedCounter < 3){
      interest.selected = true;
      this.interestSelectedCounter++;
      this.selectedInterest.push(interest);
      this.appDataShareService.currentSelectedInterestArray = this.selectedInterest;
      this.appDataShareService.currentSelectedInterest.next(interest);
    }
    else if (!interest.selected && this.interestSelectedCounter === 3){
      this.snackBar.open("Only 3 interest can be selected at once",'',{duration:2000});
    }
    else{
      interest.selected = false;
      this.interestSelectedCounter--;

      const objIndex = this.selectedInterest.findIndex(obj => obj.id === interest.id);
      if (objIndex > -1) {
        this.selectedInterest.splice(objIndex, 1);
      }

      this.appDataShareService.currentSelectedInterestArray = this.selectedInterest;
      this.appDataShareService.currentSelectedInterest.next(interest);
    }
  }

  navStateChange(state:string){
    if (state === 'vues'){
      this.navVuesState = true;
      this.navMyvueState = false;
      this.navSavedvueState = false;
      this.navVuehistoryState = false;
    }
    else if (state === 'myvue'){
      this.navMyvueState = true;
      this.navVuesState = false;
      this.navSavedvueState = false;
      this.navVuehistoryState = false;
    }
    else if (state === 'savedvue'){
      this.navSavedvueState = true;
      this.navMyvueState = false;
      this.navVuesState = false;
      this.navVuehistoryState = false;
    }
    else if (state === 'vuehistory'){
      this.navVuehistoryState = true;
      this.navSavedvueState = false;
      this.navMyvueState = false;
      this.navVuesState = false;
    }
    this.appDataShareService.interestOption.next(state);
  }

  appNav(navButton:string){
    this.navStateChange(navButton);
  }

  ngOnInit(): void {
    this.navStateChange('vues');

    this.appDataShareService.studentInterest.forEach(element => {
      this.studentInterests.push({
        id:element.id,
        name:element.name,
        selected:false,
        saved: element.saved
      });
    });

    this.appDataShareService.isVueConstructed.pipe(takeUntil(this.destroy$)).subscribe(result =>{
      if (result != null){
        this.isVueConstructed = result;
        if (!result){
          this.studentInterests.forEach(element =>{
            if (element.selected){
              element.selected = false;
              this.interestSelectedCounter-- ;
            }
          });
          this.appDataShareService.currentSelectedInterestArray = [];
          this.selectedInterest = [];
        }
        this.Ref.detectChanges();
      }
    });

  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
