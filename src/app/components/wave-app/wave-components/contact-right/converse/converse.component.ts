import { Component, OnDestroy, OnInit } from '@angular/core';
import { DRAFT_EDITOR_CONTEXT, INTERACTION, NOTIFY_DATA } from 'src/app/_helpers/constents';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';
import { Subscription } from 'rxjs';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BECOME_EXPLORERS, DECLINE_INTERACTION, SEND_CONVERSATION, TOUCH_CONVERSATION } from 'src/app/_helpers/graphql.query';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-converse',
  templateUrl: './converse.component.html',
  styleUrls: ['./converse.component.scss']
})
export class ConverseComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private graphqlService: GraphqlService,
    private domSanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    ) { }

  bodyContainerWidthNumber:number;
  bodyContainerHeightNumber:number;

  interaction:INTERACTION = null;
  contactChangedUnsub: Subscription;

  extraOptions = false;
  hideConverseMessage = false;
  secondLayer = {
    draftEditor:false,
    notify:false
  }
  notifyData:NOTIFY_DATA;
  become_explorers = false;
  minMessageForExplorers = 2;

  draftEditorContext:DRAFT_EDITOR_CONTEXT = {converseId:null, converseView:false, draftView:false, edit:false, converse:true};

  svg(username:string): SafeHtml{return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));}

  openVue(url: string){
    window.open(url, "_blank");
  }

  reset(){
    this.extraOptions = false;
    this.hideConverseMessage = false;
    this.secondLayer = {draftEditor:false, notify:false}
    this.notifyData = null;
    this.become_explorers = false;
    this.draftEditorContext = {converseId:null, converseView:false, draftView:false, edit:false, converse:true};
  }

  ngOnInit(): void {
    this.bodyContainerWidthNumber = this.appDataShareService.appRightContainerWidth;
    this.bodyContainerHeightNumber = (this.appDataShareService.appContainerHeight - 59);

    this.appDataShareService.appActivePath.contact.converse.active = true;
    this.appDataShareService.appActivePath.contact.converse.notification = false;
    this.appDataShareService.notification.next(true);

    this.contactChangedUnsub = this.appDataShareService.changeContact
    .subscribe(result => {
      const Index = this.appDataShareService.allInteraction.converse.findIndex(obj => obj.id === result);
      if (Index > -1){
        this.interaction = this.appDataShareService.allInteraction.converse[Index];
        this.become_explorers = this.interaction.user_interaction.accepted_connection;
        this.reset();
      }
    });    
  }


  openDraftEditor(message){
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
    this.secondLayerChanged({draftEditor: true});
  }

  closeDraftEditor(){
    this.secondLayerChanged({draftEditor: false});
    this.hideConverseMessage = false;
  }

  draftSend(){
    this.notifyData = {
      notify_context: "SEND",
      title: "CONFIRM",
      body: "Replying to " + this.interaction.student_interaction.profile.nickname +"." + " once send, it can not be taken back.",
      singleAction: false,
      action: "Send",
      actionLoading: false
    }
    this.secondLayerChanged({notify:true});
  }

  stopConversation(){
    this.notifyData = {
      notify_context: "STOP",
      title: "CONFIRM",
      body: "Stop conversing with " + this.interaction.student_interaction.profile.nickname +"." + " once confirmed, it can't be changed.",
      singleAction: false,
      action: "Confirm",
      actionLoading: false
    }
    this.hideConverseMessage = true;
    this.secondLayerChanged({notify:true});
  }

  reportConversation(){
    this.notifyData = {
      notify_context: "REPORT",
      title: "CONFIRM",
      body: "Report and Block, " + this.interaction.student_interaction.profile.nickname +"." + " once reported, user will be removed and blocked permanently.",
      singleAction: false,
      action: "Report & block",
      actionLoading: false
    }
    this.hideConverseMessage = true;
    this.secondLayerChanged({notify:true});
  }

  acceptConnection(){
    if (!this.interaction.user_interaction.accepted_connection){
      this.notifyData = {
        notify_context: "ACCEPT",
        title: "ACCEPT",
        body: "If " + this.interaction.student_interaction.profile.nickname +" also accepts you, then you both will become explorers.\n" + " once accepted, it can't be changed later.",
        singleAction: false,
        action: "Accept",
        actionLoading: false
      }
      this.hideConverseMessage = true;
      this.secondLayerChanged({notify:true});
    }
  }

  secondLayerChanged(parems:{draftEditor?:boolean, notify?:boolean}){
    this.secondLayer = {
      draftEditor: parems.draftEditor ? parems.draftEditor : false,
      notify: parems.notify ? parems.notify : false
    }
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
              const Index = this.appDataShareService.allInteraction.converse.findIndex(obj => obj.id === this.interaction.id);
              if (Index > -1){
                this.appDataShareService.allInteraction.converse[Index].draft_converse.in_transit = true;
                this.appDataShareService.allInteraction.converse[Index].draft_converse.updated = new Date();
                this.appDataShareService.updateContactSection.next(this.interaction.id);
              }

              this.secondLayerChanged({draftEditor:false, notify:false});
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

      else if (this.notifyData.notify_context === "STOP"){
        this.notifyData.actionLoading = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            const declineConversation = await this.declineConversation();

            if (declineConversation){
              const Index = this.appDataShareService.allInteraction.converse.findIndex(obj => obj.id === this.interaction.id);
              if (Index > -1) this.appDataShareService.allInteraction.converse.splice(Index, 1);

              this.appDataShareService.vueFeedArray.forEach(vueFeed => {
                vueFeed.author_id === this.interaction.converse_context.vue_context.author_id ? vueFeed.conversation_started = false : null;
              });
    
              this.appDataShareService.vueHistoryArray.forEach(vueHistory => {
                vueHistory.author_id === this.interaction.converse_context.vue_context.author_id ? vueHistory.conversation_started = false : null;
              });
    
              this.appDataShareService.vueSavedArray.forEach(vueSave =>{
                vueSave.author_id === this.interaction.converse_context.vue_context.author_id ? vueSave.conversation_started = false : null;
              });

              this.appDataShareService.changeContactSection.next(1);
              this.snackBar.open(this.interaction.student_interaction.profile.nickname + " has been removed", "Successfully", {duration:2000});
              this.interaction = null;
              this.reset();
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

      else if (this.notifyData.notify_context === "REPORT"){
        this.notifyData.actionLoading = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            const declineConversation = await this.declineConversation(true);

            if (declineConversation){
              const Index = this.appDataShareService.allInteraction.converse.findIndex(obj => obj.id === this.interaction.id);
              if (Index > -1) this.appDataShareService.allInteraction.converse.splice(Index, 1);
              this.appDataShareService.changeContactSection.next(1);
              this.snackBar.open(this.interaction.student_interaction.profile.nickname + " has been reported", "thank you", {duration:2000});
              this.interaction = null;
              this.reset();
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

      else if (this.notifyData.notify_context === "ACCEPT"){
        this.notifyData.actionLoading = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            const becomeExplorers = await this.becomeExplorers();

            if (becomeExplorers){
              this.interaction.user_interaction.accepted_connection = true;

              if(this.interaction.student_interaction.accepted_connection){
                const Index = this.appDataShareService.allInteraction.converse.findIndex(obj => obj.id === this.interaction.id);
                if (Index > -1) this.appDataShareService.allInteraction.converse.splice(Index, 1);
                this.appDataShareService.changeContactSection.next(0);
              }
              else{
                this.secondLayerChanged({notify:false});
                this.hideConverseMessage = false;
              }
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
        this.secondLayerChanged({draftEditor:true});
      }
      else if (this.notifyData.notify_context === "STOP"){
        this.secondLayerChanged({notify:false});
        this.hideConverseMessage = false;
      }
      else if (this.notifyData.notify_context === "REPORT"){
        this.secondLayerChanged({notify:false});
        this.hideConverseMessage = false;
      }
      else if (this.notifyData.notify_context === "ACCEPT"){
        this.secondLayerChanged({notify:false});
        this.hideConverseMessage = false;
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

  declineConversation(report=false): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      const mutationArrgs = {
        report: report,
        userInteractionId: this.interaction.user_interaction.id
      }
      this.graphqlService.graphqlMutation(DECLINE_INTERACTION, mutationArrgs).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data?.declineInteraction?.result === true){
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

  becomeExplorers(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      const mutationArrgs = {
        userInteractionId: this.interaction.user_interaction.id
      }
      this.graphqlService.graphqlMutation(BECOME_EXPLORERS, mutationArrgs).pipe(take(1))
      .subscribe(
        (result:any) => {
          if (result.data && result.data.becomeExplorers.result){
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

  ngOnDestroy(){
    this.contactChangedUnsub.unsubscribe();
    this.appDataShareService.appActivePath.contact.converse.active = false;
  }

}
