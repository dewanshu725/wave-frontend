import { ALL_INTERACTION, APP_ACTIVE_PATH, INTERACTION, USER_OBJ } from './../../../../_helpers/constents';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { ALL_INTERACTION_CONVERSE, ALL_INTERACTION_DRAFT_CONVERSE, ALL_INTERACTION_EXPLORERS, DELETE_INTERACTION, NEW_CONVERSATION_UPDATE } from 'src/app/_helpers/graphql.query';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { take, takeUntil } from 'rxjs/operators';
import { UserDataService } from 'src/app/_services/user-data.service';
import { timeAfterInHours } from 'src/app/_helpers/functions.utils';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';

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
    private matDialog:MatDialog,
    private Ref:ChangeDetectorRef,
  ) {}

  destroy$: Subject<boolean> = new Subject<boolean>();

  selectedIndex = 0;

  dataNow = new Date();
  newConversationTime:Date;

  loadState = {explorersLoading: false, converseLoading: false, draftLoading: false};
  notification:APP_ACTIVE_PATH;
  allInteraction:ALL_INTERACTION = {explorers: [], converse: [], draft_converse: []};
  currentSelectedInteraction:INTERACTION = null;
  userObject:USER_OBJ;

  ngOnInit(): void {

    this.userObject = this.userDataService.getItem({userObject:true}).userObject;
    this.newConversationTime = this.userObject.newConversationTime != null ? new Date(this.userObject.newConversationTime) : null;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.userObject = this.userDataService.getItem({userObject:true}).userObject;
      this.newConversationTime = this.userObject.newConversationTime != null ? new Date(this.userObject.newConversationTime) : null;
    });

    if (this.dataNow > this.newConversationTime){
      this.userObject.newConversationCount = 0;
      this.userObject.newConversationTime = null;
    }

    this.initialSetup();

    this.appDataShareService.changeContactSection.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (this.selectedIndex != value){
        this.selectedIndex = value;
        this.initialSetup(true);
      }
    });

    this.notification = this.appDataShareService.appActivePath;
    this.appDataShareService.notification.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.notification = this.appDataShareService.appActivePath;
      this.Ref.detectChanges();
    });
  }

  initialSetup(reload=false){
    if (!reload){
      this.allInteraction = {
        explorers: this.appDataShareService.allInteraction.explorers,
        converse: this.appDataShareService.allInteraction.converse,
        draft_converse: this.appDataShareService.allInteraction.draft_converse
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

  conversationPointHelp(){
    this.matDialog.open(AlertBoxComponent, {
      width:'50%',
      backdropClass: ['frosted-glass-blur'],
      data: {
        title: 'Converse Rules',
        message: null,
        conversationPointInfo: true,
        conversationPoint: this.userObject.conversationPoints,
        singleAction: true,
        actionName: 'GOT IT',
      }
    });
  }

  ngOnDestroy(){
    if (this.currentSelectedInteraction != null) this.currentSelectedInteraction.selected = false;
    
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
