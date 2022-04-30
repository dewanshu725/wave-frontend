import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { INTEREST_KEYWORD, LINK_ERROR, LINK_PREVIEW } from 'src/app/_helpers/constents';
import { composedPath, createInteraction, createMyVueObj, createVueObj, getDomain, truncate } from 'src/app/_helpers/functions.utils';
import { LINK_VALIDATION_MUTATION, REPORT_VUE, START_CONVERSATION, UPDATE_VUE_FEED, VUE_CONVERSATION_UPDATE, VUE_DELETE, VUE_PUBLIC_UPDATE, VUE_PUBLISH } from 'src/app/_helpers/graphql.query';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';
import { UserDataService } from 'src/app/_services/user-data.service';

@Component({
  selector: 'app-display-vue',
  templateUrl: './display-vue.component.html',
  styleUrls: ['./display-vue.component.scss']
})
export class DisplayVueComponent implements OnInit, AfterViewInit {

  constructor(
    private appDataShareService:AppDataShareService,
    private userDataService: UserDataService,
    private graphqlService:GraphqlService,
    private Ref:ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private matDialog:MatDialog
  ) { }

  @Input() linkPreview:LINK_PREVIEW = {
    title: null,
    description: null,
    image: {
      id: null,
      image: null,
      thumnail: null,
      width: null,
      height: null
    },
    conversation_disabled: null,
    url: null,
    domain_url: null,
    domain_name: null,
    site_name: null

  };
  @Input() mode = {create: false, edit: false, display: false};
  @Input() profileVue = false;
  @Input() vueDisplayContext:string;
  @Input() currentSelectedInterest:INTEREST_KEYWORD[] = [];

  @Output() linkValidationStatus = new EventEmitter();
  @Output() vueSubmited = new EventEmitter();
  @Output() savedVueRemoved = new EventEmitter();
  @Output() vueDeleted = new EventEmitter();
  @Output() closeDetailedVue = new EventEmitter();

  @ViewChild('vueRightContainer') vueRightContainer: ElementRef;

  vueDescriptionFormHeight:string;
  vueDescriptionHeight:string;
  
  linkSubmitData: {
    title?: string,
    description?: string,
    image?: string,
    image_width?: string,
    image_height?: string,
    conversation_disabled?: boolean,
    public?:boolean,
    interest_keyword?: INTEREST_KEYWORD[],
    url?: string,
    domain_url?: string,
    domain_name?: string,
    site_name?: string
  } = {
    title : null,
    description : null,
    image : null,
    image_width : null,
    image_height : null,
    conversation_disabled : null,
    public: null,
    interest_keyword : null,
    url : null,
    domain_url : null,
    domain_name : null,
    site_name : null
  }
  
  linkError:LINK_ERROR = {
    error:false,
    blacklist:false,
    sentence_filler:"",
    error_message:""
  }

  linkValue:string = '';
  linkInputValid = true;

  vueCreateForm:FormGroup;
  vueReportForm:FormGroup;

  disableNewConversation = false;
  vuePublic = true;
  vueSubmitStatus = false;
  vueSubmitError = false;

  vueDeleteLoading = false;
  vueStartConversationLoading = false;
  removeSavedVueLoading = false;

  vueSaved = false;
  vueMenu = {
    menu: false,
    save:false,
    disliked: false,
    misleaded: false,
    reported: false
  }


  ngOnInit(): void {
    if (this.mode.create){
      this.vueCreateForm = new FormGroup({
        'title': new FormControl(null, Validators.required),
        'description': new FormControl(null, Validators.required)
      });
    }

    else if (this.mode.display){
      this.vueSaved = this.linkPreview.user_saved;
      
      if (this.linkPreview.image === null){
        this.vueMenu.menu = true;
      }
    }
  }

  ngAfterViewInit(){
    this.vueDescriptionFormHeight = (this.vueRightContainer.nativeElement.clientHeight - 100) + 'px';
    this.vueDescriptionHeight = (this.vueRightContainer.nativeElement.clientHeight - 70) + 'px';
    this.Ref.detectChanges();
  }

  imgError(error){
    this.linkPreview.image = null;

    if (this.mode.create){
      this.linkSubmitData.image = null;
    }
  }

  imgLoaded(event){
    if (this.mode.create){
      const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

      this.linkSubmitData.image_width = path[0].naturalWidth;
      this.linkSubmitData.image_height = path[0].naturalHeight;
    }
  }

  openVue(url: string){
    window.open(url, "_blank");
  }

  linkInputChange(linkInput:HTMLInputElement){
    this.linkValue = linkInput.value;
    if (this.linkValue.length != 0){
      const linkValid = this.linkValue.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)+[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}(:[0-9]{1,10})?(\/.*)?$/g);
      if (linkValid){
        this.linkInputValid = true;
      }
      else{
        this.linkInputValid = false;
      }
    }
    else{
      this.linkInputValid = true;
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

  vueReportSubmit(){
    let canSubmit = false;
    !this.vueMenu.misleaded && !this.vueReportForm.get('adult').value && !this.vueReportForm.get('gambling').value &&
    !this.vueReportForm.get('shopping').value && !this.vueReportForm.get('clickbait').value &&
    !this.vueReportForm.get('dangerous').value && !this.vueReportForm.get('others').value ?
    canSubmit = false : canSubmit = true;

    if (canSubmit){
      const mutationArrgs = {
        'vueId': this.linkPreview.id,
        'misleading': this.vueMenu.misleaded,
        'adultSite': this.vueReportForm ? this.vueReportForm.get('adult').value : false,
        'gamblingSite': this.vueReportForm ? this.vueReportForm.get('gambling').value : false,
        'shoppingSite': this.vueReportForm ? this.vueReportForm.get('shopping').value : false,
        'clickbait': this.vueReportForm ? this.vueReportForm.get('clickbait').value : false,
        'dangerous': this.vueReportForm ? this.vueReportForm.get('dangerous').value : false,
        'others': this.vueReportForm ? this.vueReportForm.get('others').value : false
      }
      this.graphqlService.graphqlMutation(REPORT_VUE, mutationArrgs).pipe(take(1)).subscribe(result =>{});
      this.vueMenu.reported === true ? this.vueMenu.reported = null : null;
    }

  }

  vueOptions(dislike=false, misleading=false, reported=false){
    if (dislike){
      this.vueMenu.disliked = !this.vueMenu.disliked;
    }

    if (misleading){
      this.vueMenu.misleaded = !this.vueMenu.misleaded;
    }

    if (reported){
      this.vueMenu.reported = !this.vueMenu.reported;
      this.vueMenu.reported ? this.vueReport() : null;
    }
  }

  vueMenuAction(){
    if (this.vueMenu.menu){
      this.vueMenu.menu = false;


      if (this.vueMenu.disliked){
        this.updateVueFeed(false,true);
        this.vueMenu.disliked = false;
      }


      if (this.vueMenu.misleaded){
        if (this.vueMenu.reported === null){
          this.vueMenu.reported = false;
        }
        else if (this.vueMenu.reported === false || this.vueMenu.reported === true){
          this.vueMenu.reported = false;
          this.vueReportSubmit();
        }
        this.vueMenu.misleaded = false;
      }
      else{
        this.vueMenu.reported = false;
      }
    }
    else{
      this.vueMenu.menu = true;
    }

  }

  linkSubmit(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.linkValidationStatus.emit("Preparing your Vue...");

      const mutationArrgs = {
        "link": this.linkValue
      }

      this.graphqlService.graphqlMutation(LINK_VALIDATION_MUTATION, mutationArrgs).pipe(take(1))
      .subscribe((result:any) =>{
        if(result.errors){
          this.linkValidationStatus.emit("");
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"something went wrong",
            error_message:"On Our End"
          }

          resolve(false);
        }
        else{
          const data = result.data.linkValidation;
          if (data.error){
            this.linkError.error = true;
            this.linkValidationStatus.emit("");

            if (data.error === 'INVALID_LINK'){
              this.linkError.sentence_filler = "your web link is";
              this.linkError.error_message = "Invalide";
            }
            else if (data.error === 'TIMEOUT'){
              this.linkError.sentence_filler = "your web link is taking";
              this.linkError.error_message = "Too Much Time To Respond";
            }
            else if (data.error === 'TOO_MANY_REDIRECTS'){
              this.linkError.sentence_filler = "your web link has";
              this.linkError.error_message = "Too Many Redirects";
            }
            else if (data.error === 'BROKEN_LINK'){
              this.linkError.sentence_filler = "your web link is";
              this.linkError.error_message = "Not Responding";
            }

            resolve(false);
          }
          else if (data.blackList){
            this.linkValidationStatus.emit("");
            this.linkError.error = true;
            this.linkError.blacklist = true;
            this.linkError.sentence_filler = "your web link points to";

            if (data.blackList === 'ADULT'){
              this.linkError.error_message = "Adult Content";
            }
            else if(data.blackList === 'GAMBLING'){
              this.linkError.error_message = "Gambling Website";
            }
            else if(data.blackList === 'SHOPPING'){
              this.linkError.error_message = "Shopping Website";
            }

            resolve(false);
          }
          else{
            this.linkValidationStatus.emit("");
            const linkPreview = JSON.parse(data.linkPreview);
            
            if (linkPreview.error){
              this.linkError = {
                error:true,
                blacklist:false,
                sentence_filler:"something went wrong",
                error_message: "On Our End"
              }

              resolve(false);
            }
            else{
              const domain_url = getDomain(linkPreview.url);

              this.linkSubmitData.image = linkPreview.image,
              this.linkSubmitData.image_width = null,
              this.linkSubmitData.image_height = null,
              this.linkSubmitData.url = linkPreview.url,
              this.linkSubmitData.domain_url = domain_url,
              this.linkSubmitData.domain_name = domain_url.split('.')[0],
              this.linkSubmitData.site_name = linkPreview.site_name,

              resolve(true);
            }
          }
        }
      },
      error =>{
        this.linkValidationStatus.emit("");
        if (this.graphqlService.internetStatus){
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"something went wrong",
            error_message:"On Our End"
          }
        }
        else{
          this.linkError = {
            error:true,
            blacklist:false,
            sentence_filler:"You don't have",
            error_message:"Proper Internet"
          }
        }

        resolve(false);
      });
    });
  }

  vueSubmit(){
    this.vueSubmitStatus = null;

    this.linkSubmitData.title = truncate(this.vueCreateForm.get('title').value.trim(), 100);
    this.linkSubmitData.description = this.vueCreateForm.get('description').value.trim();
    this.linkSubmitData.interest_keyword = this.currentSelectedInterest;
    this.linkSubmitData.conversation_disabled = this.disableNewConversation;
    this.linkSubmitData.public = this.vuePublic;

    (async () =>{

      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        let linkResult = true;

        if (this.linkValue.length != 0){
          linkResult = await this.linkSubmit();
          this.linkValue = '';
        }

        if (linkResult){
          const mutationArrgs = {
            'vueJson': JSON.stringify(this.linkSubmitData)
          }
  
          this.graphqlService.graphqlMutation(VUE_PUBLISH, mutationArrgs).pipe(take(1))
          .subscribe(
            (result:any) =>{
              if (result.errors){
                this.vueSubmitStatus = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
              else if (result.data?.vuePublish?.result != null){
                this.appDataShareService.myVueArray.unshift(createMyVueObj(result.data.vuePublish.result));
                this.vueSubmited.emit(true);
              }
              else{
                this.vueSubmitStatus = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
            },
            error =>{
              this.vueSubmitStatus = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          );
        }
        else{
          this.vueSubmitStatus = false;
        }
      }
      else{
        this.vueSubmitStatus = false;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    })();

  }

  tryAgain(){
    this.linkValue = '';
    this.linkError = {
      error:false,
      blacklist:false,
      sentence_filler:"",
      error_message:""
    }
  }

  updateVueFeed(saved=false, disliked=false){
    saved ? this.vueSaved = true : null;

    if (saved && this.linkPreview.user_saved){
      return;
    }

    const mutationArrgs = {
      vueId: this.linkPreview.id,
      opened: false,
      saved: saved,
      disliked: disliked
    }
    this.graphqlService.graphqlMutation(UPDATE_VUE_FEED, mutationArrgs).pipe(take(1))
    .subscribe((result:any) =>{
      if (result.data && result.data.updateVueFeed.result){
        if (this.vueDisplayContext === 'vues'){
          if (saved){
            this.linkPreview.user_saved = true;
            
            const vueSavedIndex = this.appDataShareService.vueSavedArray.findIndex(obj => obj.vue_feed_id === result.data.updateVueFeed.result);
            if (vueSavedIndex === -1){
              this.appDataShareService.vueSavedArray.unshift(createVueObj(this.linkPreview, result.data.updateVueFeed.result));
            }
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

}
