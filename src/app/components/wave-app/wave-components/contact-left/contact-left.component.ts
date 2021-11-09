import { ALL_INTERACTION, APP_ACTIVE_PATH, INTERACTION, USER_OBJ } from './../../../../_helpers/constents';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { ALL_INTERACTION_CONVERSE, ALL_INTERACTION_DRAFT_CONVERSE, ALL_INTERACTION_EXPLORERS, DELETE_INTERACTION, NEW_CONVERSATION_UPDATE } from 'src/app/_helpers/graphql.query';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { take } from 'rxjs/operators';
import { UserDataService } from 'src/app/_services/user-data.service';
import { timeAfterInHours } from 'src/app/_helpers/functions.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-left',
  templateUrl: './contact-left.component.html',
  styleUrls: ['./contact-left.component.scss']
})
export class ContactLeftComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService, 
    private graphqlService: GraphqlService,
    private userDataService: UserDataService,
    private Ref:ChangeDetectorRef,
    ) { }


  selectedIndex = 0;

  dataNow = new Date();
  newConversationTime:Date;

  loadState = {explorersLoading: true, converseLoading: true, draftLoading: true};
  notification:APP_ACTIVE_PATH;
  allInteraction:ALL_INTERACTION = {explorers: [], converse: [], draft_converse: []};
  currentSelectedInteraction:INTERACTION = null;
  userObject:USER_OBJ;
  userDataUnsub:Subscription;

  contactSectionUnsub:Subscription;
  notificationUnsub:Subscription;

  ngOnInit(): void {

    this.userObject = this.userDataService.getItem({userObject:true}).userObject;
    this.newConversationTime = this.userObject.newConversationTime != null ? new Date(this.userObject.newConversationTime) : null;

    this.userDataUnsub = this.appDataShareService.updateUserData.subscribe(() => {
      this.userObject = this.userDataService.getItem({userObject:true}).userObject;
      this.newConversationTime = this.userObject.newConversationTime != null ? new Date(this.userObject.newConversationTime) : null;
    });

    if (this.dataNow > this.newConversationTime){
      this.userObject.newConversationCount = 0;
      this.userObject.newConversationTime = null;
    }

    this.initialSetup();

    this.contactSectionUnsub = this.appDataShareService.changeContactSection
    .subscribe(value => {
      if (this.selectedIndex === value){
        this.initialSetup();
      }
      else{
        this.selectedIndex = value;
        this.initialSetup(true);
      }
    });

    this.notification = this.appDataShareService.appActivePath;
    this.notificationUnsub = this.appDataShareService.notification
    .subscribe(() => {
      this.notification = this.appDataShareService.appActivePath;
      this.Ref.detectChanges();
    });
  }

  initialSetup(reload=false){
    if (!reload){
      if (this.appDataShareService.allInteraction.draft_converse.length === 0){
        this.loadState.draftLoading = true;
        this.getDraft();
      }
      else{
        this.allInteraction.draft_converse = this.appDataShareService.allInteraction.draft_converse;
        this.loadState.draftLoading = false;
      }
  
      if (this.appDataShareService.allInteraction.converse.length === 0){
        this.loadState.converseLoading = true;
        this.getConverse();
      }
      else{
        this.allInteraction.converse = this.appDataShareService.allInteraction.converse;
        this.loadState.converseLoading = false;
      }

      if (this.appDataShareService.allInteraction.explorers.length === 0){
        this.loadState.explorersLoading = true;
        this.getExplorers();
      }
      else{
        this.allInteraction.explorers = this.appDataShareService.allInteraction.explorers;
        this.loadState.explorersLoading = false;
      }
    }

    else{
      if (this.selectedIndex === 0){
        this.loadState.explorersLoading = true;
        this.appDataShareService.allInteraction.explorers = [];
        this.currentSelectedInteraction = null;
        this.getExplorers();
        this.Ref.detectChanges();
      }
      else if (this.selectedIndex === 1){
        this.loadState.converseLoading = true;
        this.appDataShareService.allInteraction.converse = [];
        this.currentSelectedInteraction = null;
        this.getConverse();
        this.Ref.detectChanges();
      }
      else if (this.selectedIndex === 2){
        this.loadState.draftLoading = true;
        this.appDataShareService.allInteraction.draft_converse = [];
        this.currentSelectedInteraction = null;
        this.getDraft();
        this.Ref.detectChanges();
      }
    }

    this.contactChanged();
  }

  getDraft(){
    (async () =>{
      const draft = await this.graphqlService.getContact(ALL_INTERACTION_DRAFT_CONVERSE);

      if (draft){
        this.allInteraction.draft_converse = this.appDataShareService.allInteraction.draft_converse;
        this.loadState.draftLoading = false;
      }
      else{
        this.loadState.draftLoading = false;
      }
    })();
  }

  getConverse(){
    (async () =>{
      const converse = await this.graphqlService.getContact(ALL_INTERACTION_CONVERSE);

      if (converse){
        this.allInteraction.converse = this.appDataShareService.allInteraction.converse;
        this.loadState.converseLoading = false;
      }
      else{
        this.loadState.converseLoading = false;
      }
    })();
  }

  getExplorers(){
    (async () =>{
      const explorers = await this.graphqlService.getContact(ALL_INTERACTION_EXPLORERS);

      if (explorers){
        this.allInteraction.explorers = this.appDataShareService.allInteraction.explorers;
        this.loadState.explorersLoading = false;
      }
      else{
        this.loadState.explorersLoading = false;
      }
    })();
  }

  contactChanged(){
    if (this.currentSelectedInteraction != null) this.currentSelectedInteraction.selected = false;

    this.appDataShareService.contactOption.next(this.selectedIndex);
  }

  contactClicked(interaction:INTERACTION){
    if (!interaction.student_interaction.profile.deleted){
      if (this.currentSelectedInteraction != null) this.currentSelectedInteraction.selected = false;
      this.currentSelectedInteraction = interaction;
      this.currentSelectedInteraction.selected = true;
      this.appDataShareService.changeContact.next(interaction.id);
    }
    else{
      this.graphqlService.graphqlMutation(DELETE_INTERACTION, {interactionId: interaction.id}).pipe(take(1))
      .subscribe((result:any) => {
        if (this.selectedIndex === 0){
          const explorerIndex = this.allInteraction.explorers.findIndex(explorerInteraction => explorerInteraction.id === interaction.id);
          if (explorerIndex > -1){
            this.allInteraction.explorers.splice(explorerIndex, 1);
          }
        }
        else if (this.selectedIndex === 1){
          const converseIndex = this.allInteraction.converse.findIndex(converseInteraction => converseInteraction.id === interaction.id);
          if (converseIndex > -1){
            this.allInteraction.converse.splice(converseIndex, 1);
          }
        }
        else{
          const draftIndex = this.allInteraction.draft_converse.findIndex(draftInteraction => draftInteraction.id === interaction.id);
          if (draftIndex > -1){
            this.allInteraction.draft_converse.splice(draftIndex, 1);
          }
        }
      });
    }
  }

  updateNewConversation(){
    this.userObject.newConversationDisabled = !this.userObject.newConversationDisabled;
    this.userDataService.setItem({userObject:this.userObject});
    this.appDataShareService.updateUserData.next(true);

    this.graphqlService.graphqlMutation(NEW_CONVERSATION_UPDATE, {value: this.userObject.newConversationDisabled}).pipe(take(1))
    .subscribe((result:any) => {
      if (result.data.newConversationUpdate?.result === false){
        this.userObject.newConversationDisabled = !this.userObject.newConversationDisabled;
        this.userDataService.setItem({userObject:this.userObject});
        this.appDataShareService.updateUserData.next(true);
      }
    });
  }

  timeInHours(data:Date){
    return timeAfterInHours(data);
  }

  ngOnDestroy(){
    if (this.currentSelectedInteraction != null) this.currentSelectedInteraction.selected = false;
    this.contactSectionUnsub.unsubscribe();
    this.notificationUnsub.unsubscribe();
    this.userDataUnsub.unsubscribe();
  }

}
