import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';
import { NgxMasonryOptions } from 'ngx-masonry';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { APP_ACTIVE_PATH, DRAFT_EDITOR_CONTEXT, INTERACTION, LINK_PREVIEW, NOTIFY_DATA } from 'src/app/_helpers/constents';
import { createMyVueObj, createMyDiscoveryObj, timeSinceFormat } from 'src/app/_helpers/functions.utils';
import { DECLINE_INTERACTION, GET_PROFILE_DATA, RESTART_INTERACTION, SEND_CONVERSATION, TOUCH_CONVERSATION } from 'src/app/_helpers/graphql.query';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';

@Component({
  selector: 'app-explorers',
  templateUrl: './explorers.component.html',
  styleUrls: ['./explorers.component.scss']
})
export class ExplorersComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private graphqlService: GraphqlService,
    private domSanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private matDialog:MatDialog,
    private Ref:ChangeDetectorRef
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  converseContainerWidthNumber:number;
  converseContainerHeightNumber:number;

  interaction:INTERACTION = null;

  notification:APP_ACTIVE_PATH;

  studentProfileVisible = false;
  hideConverseMessage = false;
  converseLayer = {draftEditor:false, notify:false};
  draftEditorContext:DRAFT_EDITOR_CONTEXT = {converseId:null, converseView:false, draftView:false, edit:false, converse:true};
  notifyData:NOTIFY_DATA;

  masonryLoading = true;
  masonryOption: NgxMasonryOptions = {
    gutter: 80,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  studentPublicVueArray:LINK_PREVIEW[] = [];
  studentPublicVuefetchLength = 3;

  detailedVueOpened = false;
  deatiledVueData:LINK_PREVIEW;

  fetchMore = false;
  fetchMoreLoading = false;
  isStudentDataVueFetching = false;

  extraOptions = false;
  userBlocking = false;
  userReporting = false;
  userUnblocking = false;

  stopInteractionActive = false;
  unblockActive = false;
  

  ngOnInit(): void {
    this.converseContainerWidthNumber = this.appDataShareService.appRightContainerWidth;
    this.converseContainerHeightNumber = (this.appDataShareService.appContainerHeight - 59 - 49);

    this.appDataShareService.appActivePath.contact.explorers.active = true;
    this.appDataShareService.appActivePath.contact.explorers.notification = false;
    this.appDataShareService.notification.next(true);

    this.notification = this.appDataShareService.appActivePath;
    this.appDataShareService.notification.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.notification = this.appDataShareService.appActivePath;
      this.Ref.detectChanges();
    });

    this.appDataShareService.changeContact.pipe(takeUntil(this.destroy$)).subscribe(result => {
      const Index = this.appDataShareService.allInteraction.explorers.findIndex(obj => obj.id === result);
      if (Index > -1){
        this.interaction = this.appDataShareService.allInteraction.explorers[Index];
        this.reset();
      }
    });
  }

  svg(username:string): SafeHtml{return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));}

  friendlyTimeFormat(time:Date):string{
    return timeSinceFormat(time);
  }

  reset(){
    this.extraOptions = false;
    this.studentProfileVisible = false;
    this.hideConverseMessage = false;
    this.converseLayer = {draftEditor:false, notify:false};
    this.draftEditorContext = {converseId:null, converseView:false, draftView:false, edit:false, converse:true};
    this.notifyData = null;
    this.masonryLoading = true;
    this.detailedVueOpened = false;
    this.fetchMore = false;
    this.fetchMoreLoading = false;
    this.isStudentDataVueFetching = false;
    this.studentPublicVueArray = [];
  }

  converseLayerChanged(parems:{draftEditor?:boolean, notify?:boolean}){
    this.converseLayer = {
      draftEditor: parems.draftEditor ? parems.draftEditor : false,
      notify: parems.notify ? parems.notify : false
    }
  }

  openConverseMessage(message){
    this.draftEditorContext = {converseId:null, converseView:false, draftView:false, edit:false, converse:true};

    if (message.draft === true){
      if (this.interaction.draft_converse.in_transit){
        this.draftEditorContext.draftView = true;
      }
      else{
        this.draftEditorContext.edit = true;
      }
    }
    else{
      this.draftEditorContext.converseId = message.id;
      this.draftEditorContext.converseView = true;

      const Index = this.interaction.converse.findIndex(obj => obj.id === message.id);
      if (Index > -1){
        if (this.interaction.converse[Index].opened === false){
          const mutationArrgs = {
            converseMessageId: message.id,
            converseSeen: false
          }
    
          this.graphqlService.graphqlMutation(TOUCH_CONVERSATION, mutationArrgs).pipe(take(1))
          .subscribe((result:any) => {
            if (result.data && result.data.touchConversation.result){
              this.interaction.converse[Index].opened = true;
              this.appDataShareService.updateContactSection.next(this.interaction.id);
            }
          });
        }
      }
    }

    this.hideConverseMessage = true;
    this.converseLayerChanged({draftEditor: true});
  }

  closeDraftEditor(){
    this.converseLayerChanged({draftEditor: false});
    this.hideConverseMessage = false;
  }

  draftSend(){
    this.notifyData = {
      notify_context: "SEND",
      title: "CONFIRM",
      body: "Replying to " + this.interaction.student_interaction.profile.nickname +"." + " once sent, it can't be taken back.",
      singleAction: false,
      action: "Send",
      actionLoading: false
    }
    this.converseLayerChanged({notify:true});
  }

  notifyResponse(response){
    if (response){
      if (this.notifyData.notify_context === "SEND"){
        this.notifyData.actionLoading = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            const sendConversation = await this.sendConversation();

            if (sendConversation){
              const Index = this.appDataShareService.allInteraction.explorers.findIndex(obj => obj.id === this.interaction.id);
              if (Index > -1){
                this.appDataShareService.allInteraction.explorers[Index].draft_converse.in_transit = true;
                this.appDataShareService.allInteraction.explorers[Index].draft_converse.updated = new Date();
                this.appDataShareService.updateContactSection.next(this.interaction.id);
              }

              this.converseLayerChanged({draftEditor:false, notify:false});
              this.hideConverseMessage = false;
            }
            else{
              this.notifyData.actionLoading = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          }
          else{
            this.notifyData.actionLoading = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        })();
      }
    }
    else{
      if (this.notifyData.notify_context === "SEND"){
        this.draftEditorContext = {converseId:null, converseView:false, draftView:false, edit:true, converse:true};
        this.converseLayerChanged({draftEditor:true});
      }
    }
  }

  sendConversation(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      const mutationArrgs = {
        messageType: "page",
        studentInteractionId: this.interaction.user_interaction.id
      }
      this.graphqlService.graphqlMutation(SEND_CONVERSATION, mutationArrgs).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data && result.data.sendConversation.result){
            resolve(true);
          }
          else{
            resolve(false);
          }
        },
        error => resolve(false)
      );
    });
  }

  getProfileData(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlService.graphqlMutation(GET_PROFILE_DATA, {studentInteractionId: this.interaction.student_interaction.id}).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data?.getProfileData?.publicVues != null){
            const publicVues = result.data.getProfileData.publicVues;
            const discoveries = result.data.getProfileData.discoveries;

            publicVues.forEach(vue => {
              this.interaction.student_interaction.profile.public_vues.push(createMyVueObj(vue));              
            });

            discoveries.forEach(discovery => {
              this.interaction.student_interaction.profile.discovery.push(
                createMyDiscoveryObj(discovery, this.interaction.student_interaction.profile.public_vues)
              );
            });

            resolve(true);
          }
          else{
            resolve(false);
          }
        },
        error => resolve(false)
      );
    });
  }

  
  studentProfileToggle(){
    if (!this.studentProfileVisible){
      this.studentProfileVisible = true;
      this.getStudentProfileData();
    }
    else{
      this.studentProfileVisible = false;
    }
  }

  getStudentProfileData(){
    this.masonryLoading = true;
    this.detailedVueOpened = false;
    this.fetchMore = false;
    this.fetchMoreLoading = false;
    this.isStudentDataVueFetching = false;

    if (this.interaction.student_interaction.profile.public_vues.length === 0){
      (async () => {
        const tokenStatus = await this.graphqlService.isTokenValid();

        if (tokenStatus){
          const profileData = await this.getProfileData();

          if (profileData){
            this.arrangeStudentProfileData();
            this.masonryLoading = false;
          }
          else{
            this.masonryLoading = null;
          }
        }
        else{
          this.masonryLoading = null;
        }
      })();
    }
    else{
      this.arrangeStudentProfileData();
      this.masonryLoading = false;
    }
  }

  arrangeStudentProfileData(){
    this.studentPublicVueArray = this.interaction.student_interaction.profile.public_vues.slice(0, this.studentPublicVuefetchLength);
    this.checkFetchMore();
  }

  masonryLoaded(){
    this.fetchMoreLoading = false;
    this.isStudentDataVueFetching = false;
    this.masonryLoading = false;
  }

  onScroll(scrollEvent){
    let element = scrollEvent.target;

    if ((element.offsetHeight+element.scrollTop) > (element.scrollHeight - 59)){
      if (this.fetchMore && !this.isStudentDataVueFetching){
        this.isStudentDataVueFetching = true;
        this.getStudentPublicVues();
      }
    }
  }

  getStudentPublicVues(){
    this.fetchMoreLoading = true;

    const studentPublicVueIndex = this.interaction.student_interaction.profile.public_vues.findIndex(
      obj => obj.id === this.studentPublicVueArray[this.studentPublicVueArray.length - 1].id
    );

    this.interaction.student_interaction.profile.public_vues.slice(
      studentPublicVueIndex+1, studentPublicVueIndex+1+this.studentPublicVuefetchLength
    ).forEach(element => {
      this.studentPublicVueArray.push(element);
    });

    this.checkFetchMore();
  }
  
  checkFetchMore(){
    const studentPublicVueIndex = this.interaction.student_interaction.profile.public_vues.findIndex(
      obj => obj.id === this.studentPublicVueArray[this.studentPublicVueArray.length - 1].id
    );

    if (studentPublicVueIndex > -1 && (this.interaction.student_interaction.profile.public_vues.length-1) > studentPublicVueIndex){
      this.fetchMore = true;
    }
    else{
      this.fetchMore = false;
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

  stopInteraction(report:boolean){
    if (!this.stopInteractionActive){
      this.stopInteractionActive = true;

      const blockMessage = `Once blocked, all communication will cease between you and 
      ${this.interaction.student_interaction.profile.fullname}. You can unblock it later if you wish to resume communication.`

      const reportMessage = `Once reported, ${this.interaction.student_interaction.profile.fullname} 
      will be removed from your explorer's list and all the data will be deleted permanently.`

      const dialogRef = this.matDialog.open(AlertBoxComponent, {
        width:'30%',
        backdropClass: ['frosted-glass-blur'],
        data: {
          title: report ? 'Report' : 'Block',
          message: report ? reportMessage : blockMessage,
          singleAction: false,
          actionName: report ? 'Report' : 'Block',
        }
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response){
          report ? this.userReporting = true : this.userBlocking = true;

          (async () => {
            const tokenStatus = await this.graphqlService.isTokenValid();

            if (tokenStatus){
              const mutationArrg = {
                userInteractionId: this.interaction.user_interaction.id,
                report: report
              }
              this.graphqlService.graphqlMutation(DECLINE_INTERACTION, mutationArrg).pipe(take(1))
              .subscribe(
                (result:any) => {
                  if (result.data?.declineInteraction?.result === true){
                    if (report){
                      const explorerIndex = this.appDataShareService.allInteraction.explorers.findIndex(obj => obj.id === this.interaction.id);
                      if (explorerIndex > -1) this.appDataShareService.allInteraction.explorers.splice(explorerIndex, 1);

                      this.interaction = null;
                      this.reset();
                    }
                    else{
                      this.interaction.user_interaction.blocked = true;
                      this.interaction.blocked = true;
                      this.appDataShareService.updateContactSection.next(this.interaction.id);
                    }
                  }
                  else{
                    this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                  }

                  this.userBlocking = false;
                  this.userReporting = false;
                  this.stopInteractionActive = false;
                },
                error => {
                  this.userBlocking = false;
                  this.userReporting = false;
                  this.stopInteractionActive = false;
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                }
              );
            }
            else{
              this.userBlocking = false;
              this.userReporting = false;
              this.stopInteractionActive = false;
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
          })();
        }
        else{
          this.stopInteractionActive = false;
        }
      });
    }
  }

  unblock(){
    if (!this.unblockActive){
      this.unblockActive = true;

      const dialogRef = this.matDialog.open(AlertBoxComponent, {
        width:'30%',
        backdropClass: ['frosted-glass-blur'],
        data: {
          title: 'Unblock',
          message: 'Once unblocked, all services will resume as normal.',
          singleAction: false,
          actionName: 'Unblock',
        }
      });
  
      dialogRef.afterClosed().subscribe(response => {
        if (response){
          this.userUnblocking = true;
  
          (async () => {
            const tokenStatus = await this.graphqlService.isTokenValid();
  
              if (tokenStatus){
                this.graphqlService.graphqlMutation(RESTART_INTERACTION, {studentInteractionId: this.interaction.user_interaction.id})
                .pipe(take(1)).subscribe(
                  (result:any) => {
                    if (result.data?.restartInteraction?.result === true){
                      this.interaction.user_interaction.blocked = false;
                      this.interaction.blocked = false;
                      this.appDataShareService.updateContactSection.next(this.interaction.id);
                    }
                    else{
                      this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                    }
  
                    this.userUnblocking = false;
                    this.unblockActive = false;
                  },
                  error => {
                    this.userUnblocking = false;
                    this.unblockActive = false;
                    this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                  }
                );
              }
              else{
                this.userUnblocking = false;
                this.unblockActive = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
          })();
        }
        else{
          this.unblockActive = false;
        }
      });
    }
  }

  ngOnDestroy(){
    this.appDataShareService.appActivePath.contact.explorers.active = false;
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
