import { UserDataService } from './../../../../../_services/user-data.service';
import { take } from 'rxjs/operators';
import { INTEREST_CATEGORY, INTEREST_KEYWORD } from './../../../../../_helpers/constents';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';
import { GraphqlService } from './../../../../../_services/graphql.service';
import { INTEREST_KEYWORD_MUTATION, ALL_INTEREST_CATEGORY } from './../../../../../_helpers/graphql.query';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatChipSelectionChange } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

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

  initialSetup:boolean = false;
  chipChanged = false;
  selectedInterestSaving = false;
  allInterestCategory:INTEREST_CATEGORY[];
  selectedInterest:INTEREST_KEYWORD[] = [];
  chipSelectionCounter = 0;
  
  userDataUnsub:Subscription;

  ngOnInit(): void {
    this.allInterestCategory = this.userDataService.getItem({interestCategory:true}).interestCategory;

    this.userDataUnsub = this.appDataShareService.updateUserData.subscribe(() => {
      this.allInterestCategory = this.userDataService.getItem({interestCategory:true}).interestCategory;
    });

    if (this.appDataShareService.initialSetup.value){
      this.initialSetup = true;
    }
    else{
      this.appDataShareService.studentInterest.forEach(element =>{
        if (element.saved){
          this.selectedInterest.push(element);
        }
      });
    }
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
    const mutationArrgs = {
      "selected_keyword":JSON.stringify(this.selectedInterest)
    };
    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        this.graphqlService.graphqlMutation(INTEREST_KEYWORD_MUTATION, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data?.interestKeywordMutation?.result){
              const all_interest_category:INTEREST_CATEGORY[] = [];
              const localAllInterestCategory = this.graphqlService.graphqlLocalQuery(ALL_INTEREST_CATEGORY);
              localAllInterestCategory.allInterestCategory.edges.forEach(interest_category => {
                const interest_keyword_set:INTEREST_KEYWORD[] = [];
                interest_category.node.interestkeywordSet.edges.forEach(interest => {
                  let selected = false;
                  this.selectedInterest.forEach(user_interest =>{
                    user_interest.id === interest.node.id ? selected = true : null;
                  });
                  interest_keyword_set.push(
                    {
                      id:interest.node.id,
                      name:interest.node.word,
                      selected:selected
                    }
                  );
                });
                all_interest_category.push(
                  {
                    name:interest_category.node.name,
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
              this.appDataShareService.initialSetup.next(false);
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
    this.userDataUnsub.unsubscribe();
  }
}
