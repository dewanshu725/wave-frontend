import { MatSnackBar } from '@angular/material/snack-bar';
import { VUE_CONVERSATION_UPDATE, VUE_PUBLISH, VUE_DESCRIPTION_UPDATE, VUE_DELETE, REPORT_VUE, UPDATE_VUE_FEED } from './../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../_services/graphql.service';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { INTEREST_KEYWORD } from './../../../../_helpers/constents';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Component, OnInit, Input, ViewChild, NgZone, OnDestroy, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { LINK_PREVIEW } from 'src/app/_helpers/constents';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';

@Component({
  selector: 'app-vue',
  templateUrl: './vue.component.html',
  styleUrls: ['./vue.component.scss']
})
export class VueComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private _ngZone: NgZone,
    private appDataShareService:AppDataShareService,
    private graphqlService:GraphqlService,
    private snackBar: MatSnackBar,
    private Ref:ChangeDetectorRef
    ) { }

  @Input() linkPreview:LINK_PREVIEW;
  @Input() createVue = false;
  @Input() editVue = false;
  @Input() vueDisplayContext:string;
  @Input() currentSelectedInterest:INTEREST_KEYWORD[] = [];
  @Output() vueSubmited = new EventEmitter();
  @Output() vueDeleted = new EventEmitter();
  @Output() savedVueRemoved = new EventEmitter();

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('vueBox') vueBox: ElementRef;
  @ViewChild('clickTriger') clickTriger: HTMLElement;

  img_display = true;
  vueOptionOverlayHeight:number;
  vueForm: FormGroup;
  vueReportForm: FormGroup;
  vueReportFromHeight = 286.650;
  vueSubmitStatus = false;
  vueSubmitError = false;
  vueDeleteLoading = false;
  vueMenu = false;
  vueSaved = false;
  vueDisliked = false;
  vueMisleaded = false;
  vueReported = false;

  removeSavedVueLoading = false;

  editVueDescription = false;
  editVueConversation = false;

  disableNewConversation = false;

  imgError(error){
    this.img_display = false;
    this.linkPreview.image = null;
  }

  imgLoaded(event){
    event.path[0].height < 150 ? this.linkPreview.image_height = event.path[0].height : null;
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  createVueForm(description=null){
    this.vueForm = new FormGroup({
      'description': new FormControl(description, Validators.required)
    });
  }

  ngOnInit(): void {
    if (this.createVue === true && this.editVue === false){
      this.createVueForm();
    }

    this.vueSaved = this.linkPreview.user_saved;
  }

  ngAfterViewInit(){
    this.Ref.detectChanges();
  }

  vueOpened(url: string, instant=false){
    if (!this.editVue && !this.createVue){
      instant ? window.open(url, "_blank") : setTimeout(() => window.open(url, "_blank"), 230);
      this.updateVueFeed(true);
    }
  }

  vueReport(){
    this.vueReportForm = new FormGroup({
      'adult': new FormControl(false, Validators.required),
      'shopping': new FormControl(false, Validators.required),
      'gambling': new FormControl(false, Validators.required),
      'clickbait': new FormControl(false, Validators.required),
      'dangerous': new FormControl(false, Validators.required),
      'others': new FormControl(false, Validators.required)
    });
  }

  vueOptions(dislike=false, misleading=false, reported=false){
    if (dislike){
      this.vueDisliked = !this.vueDisliked;
    }

    if (misleading){
      this.vueMisleaded = !this.vueMisleaded;
    }

    if (reported){
      this.vueReported = !this.vueReported;
      this.vueReported ? this.vueReport() : null;
    }
  }

  vueMenuAction(){
    if (this.vueMenu){
      this.vueMenu = false;


      if (this.vueDisliked){
        this.updateVueFeed(false,false,true);
        this.vueDisliked = false;
      }


      if (this.vueMisleaded){
        if (this.vueReported === null){
          this.vueReported = false;
        }
        else if (this.vueReported === false || this.vueReported === true){
          this.vueReported = false;
          this.vueReportSubmit();
        }
        this.vueMisleaded = false;
      }
      else{
        this.vueReported = false;
      }
    }
    else{
      this.vueOptionOverlayHeight = this.vueBox.nativeElement.offsetHeight - 32;
      this.vueMenu = true;
    }

  }

  vueReportSubmit(){
    let canSubmit = false;
    !this.vueMisleaded && !this.vueReportForm.get('adult').value && !this.vueReportForm.get('gambling').value &&
    !this.vueReportForm.get('shopping').value && !this.vueReportForm.get('clickbait').value &&
    !this.vueReportForm.get('dangerous').value && !this.vueReportForm.get('others').value ?
    canSubmit = false : canSubmit = true;

    if (canSubmit){
      const mutationArrgs = {
        'vueId': this.linkPreview.id,
        'misleading': this.vueMisleaded,
        'adultSite': this.vueReportForm ? this.vueReportForm.get('adult').value : false,
        'gamblingSite': this.vueReportForm ? this.vueReportForm.get('gambling').value : false,
        'shoppingSite': this.vueReportForm ? this.vueReportForm.get('shopping').value : false,
        'clickbait': this.vueReportForm ? this.vueReportForm.get('clickbait').value : false,
        'dangerous': this.vueReportForm ? this.vueReportForm.get('dangerous').value : false,
        'others': this.vueReportForm ? this.vueReportForm.get('others').value : false
      }
      this.graphqlService.graphqlMutation(REPORT_VUE, mutationArrgs).pipe(take(1)).subscribe(result =>{});
      this.vueReported === true ? this.vueReported = null : null;
    }

  }

  updateVueFeed(opened=false, saved=false, disliked=false){
    saved ? this.vueSaved = true : null;

    if (saved && this.linkPreview.user_saved){
      return;
    }

    const mutationArrgs = {
      vueId: this.linkPreview.id,
      opened: opened,
      saved: saved,
      disliked: disliked
    }
    this.graphqlService.graphqlMutation(UPDATE_VUE_FEED, mutationArrgs).pipe(take(1))
    .subscribe((result:any) =>{
      if (result.data.updateVueFeed.result){
        if (this.vueDisplayContext === 'vues'){
          if (opened && !this.linkPreview.user_opened){
            this.linkPreview.user_opened = true;
            const ObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
            this.appDataShareService.vueFeedArray[ObjIndex].user_opened = true;
            this.appDataShareService.resetVueHistory();

            if (!this.linkPreview.user_saved){
              this.vueFeedRemoveItemCursorUpdate();
            }
          }
          else if (saved){
            this.linkPreview.user_saved = true;
            const ObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
            this.appDataShareService.vueFeedArray[ObjIndex].user_saved = true;
            this.appDataShareService.resetVueSaved();

            if (!this.linkPreview.user_opened){
              this.vueFeedRemoveItemCursorUpdate();
            }
          }
        }
        else if (this.vueDisplayContext === 'savedvue' && opened && !this.linkPreview.user_opened){
          this.linkPreview.user_opened = true;

          const vueSavedObjIndex = this.appDataShareService.vueSavedArray.findIndex(obj => obj.id === this.linkPreview.id);
          this.appDataShareService.vueSavedArray[vueSavedObjIndex].user_opened = true;

          const vueFeedObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
          if (vueFeedObjIndex > -1){
            this.appDataShareService.vueFeedArray[vueFeedObjIndex].user_opened = true;
          }

          this.appDataShareService.resetVueHistory();
          console.log("vueSaved opened");
        }
        else if (this.vueDisplayContext === 'vuehistory' && saved && !this.linkPreview.user_saved){
          this.linkPreview.user_saved = true;

          const vueHistoryObjIndex = this.appDataShareService.vueHistoryArray.findIndex(obj => obj.id === this.linkPreview.id);
          this.appDataShareService.vueHistoryArray[vueHistoryObjIndex].user_saved = true;

          const vueFeedObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
          if (vueFeedObjIndex > -1){
            this.appDataShareService.vueFeedArray[vueFeedObjIndex].user_saved = true;
          }

          this.appDataShareService.resetVueSaved();
          console.log("vueHistory saved");
        }

      }
    });
  }

  removeSavedVue(){
    this.removeSavedVueLoading = true;

    const mutationArrgs = {
      vueId: this.linkPreview.id,
      opened: false,
      saved: true,
      disliked: false
    }

    this.graphqlService.graphqlMutation(UPDATE_VUE_FEED, mutationArrgs).pipe(take(1))
    .subscribe((result:any) =>{
      if (result.data.updateVueFeed.result){
        const lastIndex = this.appDataShareService.vueSavedArray.length -1;
        const delObjIndex = this.appDataShareService.vueSavedArray.findIndex(obj => obj.id === this.linkPreview.id);
        let currentIndex = delObjIndex + 1;
        let previousCursor = this.appDataShareService.vueSavedArray[currentIndex - 1].cursor;

        if (this.appDataShareService.vueSavedArray.length === 1){
          this.appDataShareService.vueSavedPageInfo ? this.appDataShareService.vueSavedPageInfo.endCursor = "" : null;
        }
        else{
          this.appDataShareService.vueSavedPageInfo ? this.appDataShareService.vueSavedPageInfo.endCursor = this.appDataShareService.vueSavedArray[lastIndex - 1].cursor : null;
        }

        while (currentIndex <= lastIndex){
          let currentCursor = this.appDataShareService.vueSavedArray[currentIndex].cursor;
          this.appDataShareService.vueSavedArray[currentIndex].cursor = previousCursor;
          previousCursor = currentCursor;
          currentIndex +=1;
        }
        this.appDataShareService.vueSavedArrayUpdated = true;
        this.linkPreview.user_opened ? this.appDataShareService.resetVueFeed() : this.appDataShareService.resetVueHistory();
        this.savedVueRemoved.emit(this.linkPreview.id);
      }
    });

  }

  openVue(url: string){
    window.open(url, "_blank");
  }

  changeConversationSetting(){
    if (this.createVue){
      this.disableNewConversation = !this.disableNewConversation;
    }
  }

  vueConversationUpdate(){
    this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueID': this.linkPreview.id
        }
        this.graphqlService.graphqlMutation(VUE_CONVERSATION_UPDATE, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data.vueConversationUpdate.result){
              const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.linkPreview.id);
              this.appDataShareService.myVueArray[objIndex].conversation_disabled = this.linkPreview.conversation_disabled;
              console.log(this.appDataShareService.myVueArray[objIndex]);
            }
            else{
              this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
      else{
        this.linkPreview.conversation_disabled = !this.linkPreview.conversation_disabled;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();
  }

  vueDescriptionUpdate(){
    const vueDescription = this.linkPreview.description;
    this.linkPreview.description = this.vueForm.get('description').value;
    this.editVueDescription = false;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueId': this.linkPreview.id,
          'description': this.vueForm.get('description').value
        }

        this.graphqlService.graphqlMutation(VUE_DESCRIPTION_UPDATE, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data.vueDescriptionUpdate.result){
              const objIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.linkPreview.id);
              this.appDataShareService.myVueArray[objIndex].description = this.linkPreview.description;
            }
            else{
              this.linkPreview.description = vueDescription;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.linkPreview.description = vueDescription;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
      else{
        this.linkPreview.description = vueDescription;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();
  }

  vueSubmit(){
    this.linkPreview.description = this.vueForm.get('description').value.replace(/(\r\n|\n|\r)/gm, "");
    this.linkPreview.interest_keyword = this.currentSelectedInterest;
    this.linkPreview.conversation_disabled = this.disableNewConversation;

    (async () =>{
      this.vueSubmitStatus = null;
      this.vueSubmitError = false;
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueJson': JSON.stringify(this.linkPreview)
        }

        this.graphqlService.graphqlMutation(VUE_PUBLISH, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.errors){
              this.vueSubmitStatus = false;
              this.vueSubmitError = true;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
            else if (result.data.vuePublish.result){
              this.appDataShareService.resetMyVue();
              this.vueSubmited.emit(true);
            }
            else{
              this.vueSubmitStatus = false;
              this.vueSubmitError = true;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.vueSubmitStatus = false;
            this.vueSubmitError = true;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        )
      }
      else{
        this.vueSubmitStatus = false;
        this.vueSubmitError = true;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();

  }


  vueDelete(){
    this.appDataShareService.alertInput.next("Do you want to Delete this Vue? This will be a permanent change!");
    this.appDataShareService.alertResponse().pipe(take(1))
    .subscribe((response:boolean) =>{
      if (response === true){
        this.vueDeleteLoading = true;
        (async () =>{
          const tokenStatus = await this.graphqlService.isTokenValid();
          if (tokenStatus){
            const mutationArrgs = {
              'vueId': this.linkPreview.id
            }
            this.graphqlService.graphqlMutation(VUE_DELETE, mutationArrgs).pipe(take(1))
            .subscribe(
              (result:any) =>{
                if (result.data.vueDelete.result){
                  const lastIndex = this.appDataShareService.myVueArray.length -1;
                  const delObjIndex = this.appDataShareService.myVueArray.findIndex(obj => obj.id === this.linkPreview.id);
                  let currentIndex = delObjIndex + 1;
                  let previousCursor = this.appDataShareService.myVueArray[currentIndex - 1].cursor;

                  if (this.appDataShareService.myVueArray.length == 1){
                    this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor = "" : null;
                  }
                  else{
                    this.appDataShareService.myVuePageInfo ? this.appDataShareService.myVuePageInfo.endCursor = this.appDataShareService.myVueArray[lastIndex - 1].cursor : null;
                  }

                  while (currentIndex <= lastIndex){
                    let currentCursor = this.appDataShareService.myVueArray[currentIndex].cursor;
                    this.appDataShareService.myVueArray[currentIndex].cursor = previousCursor;
                    previousCursor = currentCursor;
                    currentIndex +=1;
                  }

                  this.vueDeleted.emit(this.linkPreview.id);
                }
                else if(!result.data.vueDelete.result){
                  this.vueDeleteLoading = false;
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                }
              },
              error =>{
                this.vueDeleteLoading = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
            );
          }
          else{
            this.vueDeleteLoading = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        })();
      }
    });
  }


  vueFeedRemoveItemCursorUpdate(){
    this.appDataShareService.vueFeedLastIndex -=1;
    const lastIndex = this.appDataShareService.vueFeedArray.length -1;
    const delObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
    let currentIndex = delObjIndex + 1;
    let previousCursor = this.appDataShareService.vueFeedArray[currentIndex - 1].cursor;

    if (this.appDataShareService.vueFeedLastIndex < 0){
      this.appDataShareService.vueFeedPageInfo ? this.appDataShareService.vueFeedPageInfo.endCursor = "" : null;
    }
    else{
      this.appDataShareService.vueFeedPageInfo ? this.appDataShareService.vueFeedPageInfo.endCursor = this.appDataShareService.vueFeedArray[this.appDataShareService.vueFeedLastIndex].cursor : null;
    }

    while (currentIndex <= lastIndex){
      let currentCursor = this.appDataShareService.vueFeedArray[currentIndex].cursor;
      this.appDataShareService.vueFeedArray[currentIndex].cursor = previousCursor;
      previousCursor = currentCursor;
      currentIndex +=1;
    }
    this.appDataShareService.vueFeedArrayUpdated = true;
    console.log(this.appDataShareService.vueFeedPageInfo.endCursor);
    console.log(this.appDataShareService.vueFeedLastIndex);

    /*
    if (this.appDataShareService.vueHistoryArray.length > 0){
      const objIndex = this.appDataShareService.vueHistoryArray.findIndex(obj => obj.vue_feed_id === this.linkPreview.vue_feed_id);
      if (objIndex === -1){
        this.appDataShareService.vueHistoryArray.unshift(this.linkPreview);
        this.appDataShareService.vueHistoryArrayUpdated = true;
      }
    }
    */
  }

  ngOnDestroy(){

  }

}
