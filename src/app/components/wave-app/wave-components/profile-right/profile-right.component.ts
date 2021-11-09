import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { DISCOVERY, LINK_PREVIEW } from 'src/app/_helpers/constents';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';

@Component({
  selector: 'app-profile-right',
  templateUrl: './profile-right.component.html',
  styleUrls: ['./profile-right.component.scss']
})
export class ProfileRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  myPublicVueArray:LINK_PREVIEW[] = [];
  myPublicVuefetchLength = 3;
  myDataVueArray:LINK_PREVIEW[] = [];

  discoveryArray:DISCOVERY[] = [];

  detailedVueOpened = false;
  deatiledVueData:LINK_PREVIEW;

  masonryOption: NgxMasonryOptions = {
    gutter: 80,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };
  masonryLoading = true;


  fetchMore = false;
  fetchMoreLoading = false;
  isMyDataVueFetching = false;


  ngOnInit(): void {
    this.appDataShareService.myVueArray.forEach(vue => {
      if (vue.public){
        this.myPublicVueArray.push(vue);
      }
    });

    this.myDataVueArray = this.myPublicVueArray.slice(0, this.myPublicVuefetchLength);
    this.checkFetchMore();
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      if (this.fetchMore && !this.isMyDataVueFetching){
        this.isMyDataVueFetching = true;
        this.getMyPublicVue();
      }
    }
  }

  
  getMyPublicVue(){
    this.fetchMoreLoading = true;

    const myPublicVueIndex = this.myPublicVueArray.findIndex(obj => obj.id === this.myDataVueArray[this.myDataVueArray.length - 1].id);
    this.myPublicVueArray.slice(myPublicVueIndex+1, myPublicVueIndex+1+this.myPublicVuefetchLength).forEach(element => {
      this.myDataVueArray.push(element);
    });

    this.checkFetchMore();
  }
  
  checkFetchMore(){
    const myPublicVueIndex = this.myPublicVueArray.findIndex(obj => obj.id === this.myDataVueArray[this.myDataVueArray.length - 1].id);
    if (myPublicVueIndex > -1 && (this.myPublicVueArray.length-1) > myPublicVueIndex){
      this.fetchMore = true;
    }
    else{
      this.fetchMore = false;
    }
  }


  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.isMyDataVueFetching = false;
    this.masonryLoading = false;
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
  }

}
