import { UserDataService } from './../../../../../_services/user-data.service';
import { take, takeUntil } from 'rxjs/operators';
import { INTEREST_CATEGORY, INTEREST_KEYWORD } from './../../../../../_helpers/constents';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { INTEREST_KEYWORD_MUTATION, ALL_INTEREST_CATEGORY } from './../../../../../_helpers/graphql.query';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatChipSelectionChange } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-interest',
  templateUrl: './interest.component.html',
  styleUrls: ['./interest.component.scss']
})
export class InterestComponent implements OnInit, OnDestroy {

  constructor(
    private graphqlService: GraphqlService,
    private appDataShareService:AppDataShareService,
    private userDataService:UserDataService,
    private Ref:ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  chipChanged = false;
  selectedInterestSaving = false;
  allInterestCategory:INTEREST_CATEGORY[];
  selectedInterest:INTEREST_KEYWORD[] = [];
  chipSelectionCounter = 0;

  ngOnInit(): void {
    this.allInterestCategory = this.userDataService.getItem({interestCategory:true}).interestCategory;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.allInterestCategory = this.userDataService.getItem({interestCategory:true}).interestCategory;
    });

    this.appDataShareService.studentInterest.forEach(element =>{
      if (element.saved){
        this.selectedInterest.push(element);
      }
    });
  }

  chipChangeSelected(event:MatChipSelectionChange){
    if (event.selected){
      this.chipSelectionCounter++;
    }
    else{
      this.chipSelectionCounter--;
    }
    this.Ref.detectChanges();
  }

  chipClick(chipState){
    this.chipChanged = true;
    chipState.selected = !chipState.selected;

    if (chipState.selected){
      this.selectedInterest.push(
        {
          id:chipState.id,
          name:chipState.name,
          saved:true,
          count:0,
          average_percent:0
        }
      );
    }
    else{
      const objIndex = this.selectedInterest.findIndex(obj => obj.id === chipState.id);
      if (objIndex > -1) {
        this.selectedInterest.splice(objIndex, 1);
      }
    }
  }

  chipSubmit(){
    this.selectedInterestSaving = true;

    const selectedInterestIds:string[] = [];

    this.selectedInterest.forEach(interest => {selectedInterestIds.push(interest.id)});

    const mutationArrgs = {
      selectedInterests: selectedInterestIds
    };

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        this.graphqlService.graphqlMutation(INTEREST_KEYWORD_MUTATION, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data?.interestKeywordMutation?.result === true){
              const all_interest_category:INTEREST_CATEGORY[] = [];
              this.allInterestCategory.forEach(interest_category => {
                const interest_keyword_set:INTEREST_KEYWORD[] = [];
                interest_category.interest_keyword.forEach(interest => {
                  let selected = false;
                  this.selectedInterest.forEach(user_interest =>{
                    user_interest.id === interest.id ? selected = true : null;
                  });
                  interest_keyword_set.push(
                    {
                      id:interest.id,
                      name:interest.name,
                      selected:selected
                    }
                  );
                });
                all_interest_category.push(
                  {
                    name:interest_category.name,
                    interest_keyword:interest_keyword_set
                  }
                );
              });

              this.appDataShareService.studentInterest.forEach(element =>{element.saved = false});
              this.selectedInterest.forEach(element =>{
                const objIndex = this.appDataShareService.studentInterest.findIndex(obj => obj.id === element.id);
                if (objIndex > -1){
                  this.appDataShareService.studentInterest[objIndex].saved = true;
                }
                else{
                  this.appDataShareService.studentInterest.push(element);
                }
              });
              this.userDataService.setItem({interestCategory:JSON.stringify(all_interest_category)});
              this.selectedInterestSaving = false;
              this.appDataShareService.vueFeedIds = [];
              this.appDataShareService.vueFeedArray = [];
              this.snackBar.open("Successfully Saved","",{duration:2000});
              this.chipChanged = false;
            }
            else{
              this.selectedInterestSaving = false;
              this.snackBar.open("Something went wrong","Try again!",{duration:2000});
            }
          },
          error =>{
            this.selectedInterestSaving = false;
            this.snackBar.open("Something went wrong","Try again!",{duration:2000});
          }
        );
      }
      else{
        this.selectedInterestSaving = false;
        this.snackBar.open("Something went wrong","Try again!",{duration:2000});
      }
    })();
  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
