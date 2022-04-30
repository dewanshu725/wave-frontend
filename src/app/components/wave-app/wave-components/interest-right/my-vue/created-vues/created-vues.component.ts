import { LINK_PREVIEW, INTEREST_KEYWORD } from './../../../../../../_helpers/constents';
import { Subject } from 'rxjs';
import { AppDataShareService } from './../../../../../../_services/app-data-share.service';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-created-vues',
  templateUrl: './created-vues.component.html',
  styleUrls: ['./created-vues.component.scss']
})
export class CreatedVuesComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Output() createVueRequest = new EventEmitter();
  @Output() myVueEmptyEvent = new EventEmitter();
  @Output() myVueArrayLength = new EventEmitter();
  @Output() reInitCreatedVue = new EventEmitter();

  loading = true;
  masonryLoading = true;

  myVueEmpty:boolean;
  myVueError = false;
  myVuefetchLength = 10;
  myVueSourceArray:LINK_PREVIEW[] = [];
  myVueDataArray:LINK_PREVIEW[] = [];
  isMyVueFetching = false;

  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelected = false;
  noMatchFound = false;

  fetchMore = false;
  fetchMoreLoading = false;
  fetchMoreError = false;

  detailedVueOpened = false;
  deatiledVueData:LINK_PREVIEW;

  masonryOption: NgxMasonryOptions = {
    gutter: 80,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
    this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;

    this.myVueSourceArray = this.appDataShareService.myVueArray.slice(0, this.myVuefetchLength);
    this.arrangeMyVueArray();

    this.appDataShareService.currentSelectedInterest.pipe(takeUntil(this.destroy$)).subscribe(result =>{
      if (this.detailedVueOpened) this.openDetailedVue(false);

      this.selectedInterest = this.appDataShareService.currentSelectedInterestArray;
      this.arrangeMyVueArray();
    });
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      if (this.fetchMore && !this.interestSelected && !this.isMyVueFetching){
        this.isMyVueFetching = true;
        this.getMyVue();
      }
    }
  }

  getMyVue(){
    this.fetchMoreLoading = true;

    const myVueIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.myVueSourceArray[this.myVueSourceArray.length - 1].id);
    this.appDataShareService.myVueArray.slice(myVueIndex+1, myVueIndex+1+this.myVuefetchLength).forEach(element => {
      this.myVueSourceArray.push(element);
    });

    this.arrangeMyVueArray();
  }

  arrangeMyVueArray(){
    if (this.selectedInterest.length === 0){
      this.myVueDataArray = this.myVueSourceArray;

      if (this.myVueDataArray.length === 0){
        this.myVueEmpty = true;
        this.myVueEmptyEvent.emit(true);
      }
      else{
        this.myVueEmpty = false;
        this.myVueEmptyEvent.emit(false);

        const myVueIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.myVueSourceArray[this.myVueSourceArray.length - 1].id);
        if (myVueIndex > -1 && (this.appDataShareService.myVueArray.length-1) > myVueIndex){
          this.fetchMore = true;
        }
        else{
          this.fetchMore = false;
        }
      }

      this.interestSelected = false;
    }
    else{
      this.myVueDataArray = [];
      const selectedInterestLength = this.selectedInterest.length;
      this.myVueSourceArray.forEach(element => {
        let interestMatch = 0;
        element.interest_keyword.forEach(element_interest => {
          this.selectedInterest.forEach(selected_interest => {
            if (element_interest.id === selected_interest.id){
              interestMatch += 1;
              return;
            }
          });
        });
        selectedInterestLength === interestMatch ? this.myVueDataArray.push(element) : null;
      });
      this.interestSelected = true;
    }

    this.myVueArrayLength.emit(this.myVueDataArray.length);
    this.loading = false;
    this.noMatch();
  }

  createVue(){
    this.createVueRequest.emit(true);
  }

  updateVueLayout(id){
    const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === id);
    if (objIndex > -1) {
      this.appDataShareService.myVueArray.splice(objIndex, 1);
    }

    const objIndex2 = this.myVueSourceArray.findIndex(obj => obj.id === id);
    if (objIndex2 > -1) {
      this.myVueSourceArray.splice(objIndex2, 1);
    }

    this.openDetailedVue(false);

    if (this.appDataShareService.myVueArray.length === 0){
      this.myVueSourceArray = [];
      this.myVueDataArray = [];
      this.myVueEmpty = true;
      this.myVueEmptyEvent.emit(true);
    }

    this.myVueArrayLength.emit(this.myVueDataArray.length);
  }

  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.masonryLoading = false;
    this.isMyVueFetching = false;
  }

  noMatch(){
    if (!this.loading && !this.myVueError && !this.myVueEmpty && this.myVueDataArray.length === 0){
      this.noMatchFound = true;
    }
    else{
      this.noMatchFound = false;
    }
  }

  openDetailedVue(open_Status:boolean, openVueData?:LINK_PREVIEW){
    if (open_Status){
      this.deatiledVueData = openVueData;
      this.detailedVueOpened = true;
    }
    else{
      this.deatiledVueData = null;
      this.detailedVueOpened = false;
    }
  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
