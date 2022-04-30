import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DRAFT_EDITOR_CONTEXT, INTERACTION, NOTIFY_DATA, USER_OBJ } from 'src/app/_helpers/constents';
import { modifyDateByDay, timeAfterInHours } from 'src/app/_helpers/functions.utils';
import { REMOVE_CONVERSATION, SEND_CONVERSATION } from 'src/app/_helpers/graphql.query';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { UserDataService } from 'src/app/_services/user-data.service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss']
})
export class DraftComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private notificationService:NotificationService,
    private userDataService: UserDataService,
    private domSanitizer: DomSanitizer,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar,
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  bodyContainerWidthNumber:number;
  bodyContainerHeightNumber:number;

  userObject:USER_OBJ;

  interaction:INTERACTION = null;

  notifyData:NOTIFY_DATA;
  notify = false;

  displayVue = false;

  draftEditor = false;
  draftEditorContext:DRAFT_EDITOR_CONTEXT = {converseId:null, converseView:false, draftView:false, edit:true, converse:false};


  ngOnInit(): void {
    this.bodyContainerWidthNumber = this.appDataShareService.appRightContainerWidth;
    this.bodyContainerHeightNumber = (this.appDataShareService.appContainerHeight - 59);

    this.appDataShareService.appActivePath.contact.draft.active = true;
    this.appDataShareService.appActivePath.contact.draft.notification = false;
    this.appDataShareService.notification.next(true);

    this.userObject = this.userDataService.getItem({userObject:true}).userObject;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.userObject = this.userDataService.getItem({userObject:true}).userObject;
    });

    this.appDataShareService.changeContact.pipe(takeUntil(this.destroy$)).subscribe(result => {
      const Index = this.appDataShareService.allInteraction.draft_converse.findIndex(obj => obj.id === result);
      if (Index > -1){
        this.draftEditor = false;
        this.notify = false;
        this.interaction = this.appDataShareService.allInteraction.draft_converse[Index];
        
        if (this.interaction.student_interaction.new_conversation_disabled){
          this.notifyData = {
            notify_context: "UNAVAILABLE",
            title: "UNAVAILABLE",
            body: this.interaction.student_interaction.profile.nickname + " is not accepting any new messages right now. But that might change in future.",
            singleAction: true,
            action: "GOT IT",
            actionLoading: false
          }
          this.notify = true;
        }
        else{
          setTimeout(() => this.draftEditor = true, 1);
        }
      }
    });
  }

  svg(username:string): SafeHtml{
    return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));
  }

  openVue(url: string){
    window.open(url, "_blank");
  }

  notifyResponse(response){
    if (response){
      if (this.notifyData.notify_context === "UNAVAILABLE"){
        this.notify = false;
        this.draftEditor = true;
      }

      else if (this.notifyData.notify_context === "SEND"){
        this.notifyData.actionLoading = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            const startConversation = await this.startConversation();
            await this.notificationService.reconnect();

            if (startConversation){
              this.changeNewConversationCount();

              const Index = this.appDataShareService.allInteraction.draft_converse.findIndex(obj => obj.id === this.interaction.id);
              if (Index > -1) this.appDataShareService.allInteraction.draft_converse.splice(Index, 1);
              this.appDataShareService.changeContactSection.next(1);
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
        })()
        
      }

      else if (this.notifyData.notify_context === "REMOVE"){
        this.notifyData.actionLoading = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            const removeConversation = await this.removeConversation();

            if (removeConversation){
              const Index = this.appDataShareService.allInteraction.draft_converse.findIndex(obj => obj.id === this.interaction.id);
              if (Index > -1) this.appDataShareService.allInteraction.draft_converse.splice(Index, 1);

              this.appDataShareService.vueFeedArray.forEach(vueFeed => {
                vueFeed.author_id === this.interaction.converse_context.vue_context.author_id ? vueFeed.conversation_started = false : null;
              });
    
              this.appDataShareService.vueHistoryArray.forEach(vueHistory => {
                vueHistory.author_id === this.interaction.converse_context.vue_context.author_id ? vueHistory.conversation_started = false : null;
              });
    
              this.appDataShareService.vueSavedArray.forEach(vueSave =>{
                vueSave.author_id === this.interaction.converse_context.vue_context.author_id ? vueSave.conversation_started = false : null;
              });


              this.interaction = null;
              this.notifyData = null;
              this.notify = false;
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
        })()
      }
    }
    else{
      this.notify = false;
      this.draftEditor = true;
    }
  }

  startConversation(): Promise<boolean>{
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

  removeConversation(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      const mutationArrgs = {
        studentInteractionId: this.interaction.user_interaction.id
      }
      this.graphqlService.graphqlMutation(REMOVE_CONVERSATION, mutationArrgs).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data && result.data.removeConversation.result){
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

  draftSend(){
    if (this.checkNewConversationValidity()){
      this.draftEditor = false;
      this.notifyData = {
        notify_context: "SEND",
        title: "CONFIRM",
        body: "Starting a new conversation with " + this.interaction.student_interaction.profile.nickname +"." + " once sent, it can't be taken back.",
        singleAction: false,
        action: "Send",
        actionLoading: false
      }
      this.notify = true;
    }
    else{
      this.snackBar.open(
        `You have exhausted your quota. Wait for ${timeAfterInHours(new Date(this.userObject.newConversationTime))} for it to be renewed`,
        "GOT IT"
      );
    }
  }

  draftRemove(){
    this.draftEditor = false;
    this.notifyData = {
      notify_context: "REMOVE",
      title: "CONFIRM",
      body: this.interaction.student_interaction.profile.nickname + " will be removed from your draft. Do you confirm?",
      singleAction: false,
      action: "Remove",
      actionLoading: false
    }
    this.notify = true;
  }

  checkNewConversationValidity(){
    if (this.interaction.student_interaction.profile.inactive || this.userObject.newConversationTime === null || new Date() > new Date(this.userObject.newConversationTime)){
      return true;
    }
    else{
      if (this.userObject.newConversationCount < 3){
        return true;
      }
      else{
        return false;
      }
    }
  }

  changeNewConversationCount(){
    if (!this.interaction.student_interaction.profile.inactive){
      if (this.userObject.newConversationTime != null){
        if (new Date() > new Date(this.userObject.newConversationTime)){
          this.userObject.newConversationTime = modifyDateByDay(new Date(), 1, true);
          this.userObject.newConversationCount += 1;
        }
        else if (new Date() < new Date(this.userObject.newConversationTime)){
          if (this.userObject.newConversationCount < 3){
            this.userObject.newConversationCount += 1;
          }
        }
      }
      else{
        this.userObject.newConversationTime = modifyDateByDay(new Date(), 1, true);
        this.userObject.newConversationCount += 1;
      }
      this.userDataService.setItem({userObject:this.userObject});
      this.appDataShareService.updateUserData.next(true);
    }
  }

  ngOnDestroy(){
    this.appDataShareService.appActivePath.contact.draft.active = false;
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}