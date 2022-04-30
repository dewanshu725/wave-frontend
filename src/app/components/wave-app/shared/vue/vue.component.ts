import { MatSnackBar } from '@angular/material/snack-bar';
import { VUE_CONVERSATION_UPDATE, VUE_DELETE, REPORT_VUE, UPDATE_VUE_FEED, START_CONVERSATION, ALL_INTERACTION_DRAFT_CONVERSE, VUE_PUBLIC_UPDATE } from './../../../../_helpers/graphql.query';
import { GraphqlService } from './../../../../_services/graphql.service';
import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { INTEREST_KEYWORD } from './../../../../_helpers/constents';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Component, OnInit, Input, ViewChild, OnDestroy, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { LINK_PREVIEW } from 'src/app/_helpers/constents';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import { composedPath, createInteraction, createVueObj, placeholderImage, truncate } from 'src/app/_helpers/functions.utils';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';
import { UserDataService } from 'src/app/_services/user-data.service';

@Component({
  selector: 'app-vue',
  templateUrl: './vue.component.html',
  styleUrls: ['./vue.component.scss']
})
export class VueComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private userDataService: UserDataService,
    private graphqlService:GraphqlService,
    private snackBar: MatSnackBar,
    private matDialog:MatDialog,
    private Ref:ChangeDetectorRef
    ) { }

  @Input() linkPreview:LINK_PREVIEW;
  @Input() editVue = false;
  @Input() profileVue = false;
  @Input() vueDisplayContext:string;
  @Input() currentSelectedInterest:INTEREST_KEYWORD[] = [];

  @Output() vueSubmited = new EventEmitter();
  @Output() vueDeleted = new EventEmitter();
  @Output() savedVueRemoved = new EventEmitter();
  @Output() openDetailedVue = new EventEmitter();

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('vueBox') vueBox: ElementRef;
  @ViewChild('clickTriger') clickTriger: HTMLElement;

  img_display:boolean;
  truncatedTitle:string;
  truncatedDescription:string;
  vueOptionOverlayHeight:number;

  vueReportForm: FormGroup;
  vueReportFromHeight = 286.650;
  vueDeleteLoading = false;
  vueStartConversationLoading = false;
  vueMenu = false;
  vueOpened = false;
  vueSaved = false;
  vueDisliked = false;
  vueMisleaded = false;
  vueReported = false;

  removeSavedVueLoading = false;

  disableNewConversation = false;

  imgError(event){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy') && this.linkPreview.image != null){
      path[0].src = placeholderImage(this.linkPreview.image.width, this.linkPreview.image.height);
    }
    else if (!path[0].classList.contains('lazy') && this.linkPreview.image != null){
      this.img_display = false;
    }
  }

  imgLoaded(event){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = this.linkPreview.image.image;
      path[0].classList.remove('lazy');
    }
  }


  ngOnInit(): void {
    this.vueSaved = this.linkPreview.user_saved;
    this.img_display = this.linkPreview.image != null ? true : false;
    this.truncatedTitle = this.linkPreview.title ? truncate(this.linkPreview.title, 30) : null;
    this.truncatedDescription = this.linkPreview.description ? truncate(this.linkPreview.description, 160) : null;
  }

  ngAfterViewInit(){
    this.Ref.detectChanges();
  }

  openDetailVue(){
    if(!this.editVue && !this.vueOpened){
      this.updateVueFeed(true);
    }

    this.openDetailedVue.emit(true);
  }

  openVue(url: string){
    window.open(url, "_blank");

    if (!this.editVue){
      this.updateVueFeed(true);
      this.vueOpened = true;
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
      if (result.data?.updateVueFeed?.result != null){
        if (this.vueDisplayContext === 'vues'){
          if (opened && !this.linkPreview.user_opened){
            this.linkPreview.user_opened = true;

            const vueHistoryIndex = this.appDataShareService.vueHistoryArray.findIndex(obj => obj.vue_feed_id === result.data.updateVueFeed.result);
            if (vueHistoryIndex === -1){
              this.appDataShareService.vueHistoryArray.unshift(createVueObj(this.linkPreview, result.data.updateVueFeed.result));
            }
          }
          else if (saved){
            this.linkPreview.user_saved = true;

            const vueSavedIndex = this.appDataShareService.vueSavedArray.findIndex(obj => obj.vue_feed_id === result.data.updateVueFeed.result);
            if (vueSavedIndex === -1){
              this.appDataShareService.vueSavedArray.unshift(createVueObj(this.linkPreview, result.data.updateVueFeed.result));
            }
          }
        }
        else if (this.vueDisplayContext === 'savedvue' && opened && !this.linkPreview.user_opened){
          this.linkPreview.user_opened = true;

          const vueFeedObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
          if (vueFeedObjIndex > -1){
            this.appDataShareService.vueFeedArray[vueFeedObjIndex].user_opened = true;
          }

          const vueHistoryIndex = this.appDataShareService.vueHistoryArray.findIndex(obj => obj.vue_feed_id === result.data.updateVueFeed.result);
          if (vueHistoryIndex === -1){
            this.appDataShareService.vueHistoryArray.unshift(createVueObj(this.linkPreview, result.data.updateVueFeed.result));
          }
        }
        else if (this.vueDisplayContext === 'vuehistory' && saved && !this.linkPreview.user_saved){
          this.linkPreview.user_saved = true;

          const vueFeedObjIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
          if (vueFeedObjIndex > -1){
            this.appDataShareService.vueFeedArray[vueFeedObjIndex].user_saved = true;
          }

          const vueSavedIndex = this.appDataShareService.vueSavedArray.findIndex(obj => obj.vue_feed_id === result.data.updateVueFeed.result);
          if (vueSavedIndex === -1){
            this.appDataShareService.vueSavedArray.unshift(createVueObj(this.linkPreview, result.data.updateVueFeed.result));
          }
        }

      }
    });
  }

  startConversation(){
    if (!this.linkPreview.conversation_started){
      this.vueStartConversationLoading = true;

      const mutationArrgs = {
        vueId: this.linkPreview.id,
      }

      this.graphqlService.graphqlMutation(START_CONVERSATION, mutationArrgs).pipe(take(1))
      .subscribe((result:any) =>{
        if (result.data?.startConversation?.result != null){
          const interactionObj = result.data.startConversation.result;
          const studentProfileId = this.userDataService.getItem({userObject:true}).userObject.student_profile_id;
          this.appDataShareService.allInteraction.draft_converse.unshift(createInteraction(interactionObj, studentProfileId, ''));

          this.appDataShareService.vueFeedArray.forEach(vueFeed => {
            vueFeed.author_id === this.linkPreview.author_id ? vueFeed.conversation_started = true : null;
          });

          this.appDataShareService.vueHistoryArray.forEach(vueHistory => {
            vueHistory.author_id === this.linkPreview.author_id ? vueHistory.conversation_started = true : null;
          });

          this.appDataShareService.vueSavedArray.forEach(vueSave =>{
            vueSave.author_id === this.linkPreview.author_id ? vueSave.conversation_started = true : null;
          });

          this.vueStartConversationLoading = false;
          this.linkPreview.conversation_started = true;

          this.snackBar.open("conversation started", "GO TO DRAFT", {duration:2000});
          this.appDataShareService.appNotification({contact_draft: true});
        }
        else{
          this.vueStartConversationLoading = false;
          this.snackBar.open("something went wrong", "TRY AGAIN", {duration:2000});
        }
      });
    }
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
      if (result.data?.updateVueFeed?.result === null){

        if (this.linkPreview.user_opened){
          const vueHistoryIndex = this.appDataShareService.vueHistoryArray.findIndex(obj => obj.id === this.linkPreview.id);
          if (vueHistoryIndex > -1){
            this.appDataShareService.vueHistoryArray[vueHistoryIndex].user_saved = false;
          }
        }
        
        const vueFeedIndex = this.appDataShareService.vueFeedArray.findIndex(obj => obj.id === this.linkPreview.id);
        if (vueFeedIndex > -1){
          this.appDataShareService.vueFeedArray[vueFeedIndex].user_saved = false;
        }

        this.savedVueRemoved.emit(this.linkPreview.id);
      }
    });

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
            if (result.data?.vueConversationUpdate?.result === false){
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

  vuePublicUpdate(){
    this.linkPreview.public = !this.linkPreview.public;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const mutationArrgs = {
          'vueID': this.linkPreview.id
        }
        this.graphqlService.graphqlMutation(VUE_PUBLIC_UPDATE, mutationArrgs).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data?.vuePublicUpdate?.result === false){
              this.linkPreview.public = !this.linkPreview.public;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          },
          error =>{
            this.linkPreview.public = !this.linkPreview.public;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        );
      }
      else{
        this.linkPreview.public = !this.linkPreview.public;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();
  }

  vueDelete(){
    const dialogRef = this.matDialog.open(AlertBoxComponent, {
      width:'30%',
      height:'30%',
      backdropClass: ['frosted-glass-blur'],
      data: {
        title: 'Delete Vue',
        message: 'Do you want to Delete this Vue? This will be a permanent change.',
        singleAction: false,
        actionName: 'Delete',
      }
    });

    dialogRef.afterClosed().subscribe(response => {
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
                if (result.data?.vueDelete?.result === true){
                  this.vueDeleted.emit(this.linkPreview.id);
                }
                else{
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

  ngOnDestroy(){

  }

}
