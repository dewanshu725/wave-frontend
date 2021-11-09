import { Injectable} from '@angular/core';
import { Subscription } from 'rxjs';
import { CHAT, CONVERSE, INTERACTION } from '../_helpers/constents';
import { createChatMessage, createConverseMessage } from '../_helpers/functions.utils';
import { CHAT_MESSAGE_UPDATED, CHAT_MESSAGE_CREATED, TYPING_STATUS_UPDATED, CONVERSE_MESSAGE_UPDATED, ONLINE_STATUS_UPDATED } from '../_helpers/graphql.query';
import { AppDataShareService } from './app-data-share.service';
import { GraphqlService } from './graphql.service';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService{

  onlineStatus: Subscription;
  chatMessageCreated: Subscription;
  chatMessageUpdated: Subscription;
  converseMessageUpdated: Subscription;
  typingStatusUpdated: Subscription;

  token:string;

  constructor(
    private appDataShareService:AppDataShareService,
    private userDataService: UserDataService,
    private graphqlService: GraphqlService
  ) {}

  onInit(){
    this.token = this.userDataService.getItem({accessToken:true}).accessToken;

    this.onlineStatus = this.graphqlService.subscription(ONLINE_STATUS_UPDATED, {token:this.token})
    .subscribe((result:any) => {
      if (result.data){
        if (this.appDataShareService.allInteraction.explorers.length > 0){
          this.appDataShareService.allInteraction.explorers.forEach(interaction => {
            if (interaction.student_interaction.profile.id === result.data.onlineStatus.id){
              interaction.student_interaction.profile.last_seen = result.data.onlineStatus.lastSeen;
              interaction.student_interaction.profile.online = result.data.onlineStatus.online;
            }
          });
        }
      }
    });

    this.chatMessageCreated = this.graphqlService.subscription(CHAT_MESSAGE_CREATED, {token:this.token})
    .subscribe((result:any) => {
      if (result.data?.chatMessageCreated){
        const chatMessageCreated = result.data.chatMessageCreated;

        if (this.appDataShareService.allInteraction.explorers.length > 0){

          const interactionIndex = this.appDataShareService.allInteraction.explorers.findIndex(interaction => interaction.student_interaction.id === chatMessageCreated.sender.id && interaction.chat[0]?.id != chatMessageCreated.id);

          if (interactionIndex > -1){
            const interaction = this.appDataShareService.allInteraction.explorers[interactionIndex];
            const chat_obj:CHAT = createChatMessage(chatMessageCreated, interaction);

            const currentChatDate = chat_obj.created.getDate();
            const previousChat = interaction.chat[0];
            const previousChatDate = previousChat != undefined ? previousChat?.created.getDate() : null;

            let newDate = false;
            if (previousChatDate === null || currentChatDate != previousChatDate){
              newDate = true;
            }

            chat_obj.newDate = newDate;
            interaction.chat.unshift(chat_obj);

            this.appDataShareService.notifyUpdates.next(interaction.id);
            this.appDataShareService.appNotification({contact_explorers_chat: true});
          }
        }
      }
    });

    this.chatMessageUpdated = this.graphqlService.subscription(CHAT_MESSAGE_UPDATED, {token:this.token})
    .subscribe((result:any) => {
      if (result.data?.chatMessageUpdated){
        const chatMessage = result.data.chatMessageUpdated;

        if (this.appDataShareService.allInteraction.explorers.length > 0){

          const interactionIndex = this.appDataShareService.allInteraction.explorers.findIndex(interaction => interaction.id === chatMessage.interaction.id);

          if (interactionIndex > -1){
            const interaction = this.appDataShareService.allInteraction.explorers[interactionIndex];
            const chatMessageIndex = interaction.chat.findIndex(chat => chat.id === chatMessage.id);

            if (chatMessageIndex > -1){
              interaction.chat[chatMessageIndex].seen = chatMessage.seen;
              interaction.chat[chatMessageIndex].deleted = chatMessage.deleted;
              this.appDataShareService.updateContactSection.next(interaction.id);
            }
          }
        }
      }
    });

    this.converseMessageUpdated = this.graphqlService.subscription(CONVERSE_MESSAGE_UPDATED, {token:this.token})
    .subscribe((result:any) => {
      if (result.data?.converseMessageUpdated){
        const converseMessageUpdated = result.data.converseMessageUpdated;
        let interaction:INTERACTION = null;

        if (converseMessageUpdated.interaction.explorers === true && this.appDataShareService.allInteraction.explorers.length > 0){
          const interactionIndex = this.appDataShareService.allInteraction.explorers.findIndex(interaction => interaction.id === converseMessageUpdated.interaction.id);
          if (interactionIndex > -1){
            interaction = this.appDataShareService.allInteraction.explorers[interactionIndex];

            const converseMessageIndex = interaction.converse.findIndex(converse => converse.id === converseMessageUpdated.id);
            if (converseMessageIndex > -1){
              interaction.converse[converseMessageIndex].seen = converseMessageUpdated.seen;

              if (interaction.converse[converseMessageIndex].opened != converseMessageUpdated.opened){
                interaction.converse[converseMessageIndex].opened = converseMessageUpdated.opened;
                this.appDataShareService.updateContactSection.next(interaction.id);
              }
            }
            else{
              if (interaction.draft_converse.in_transit){
                interaction.draft_converse.in_transit = false;
                interaction.draft_converse.body = null;
                interaction.draft_converse.updated = new Date();
              }
              const converseMessageObj:CONVERSE = createConverseMessage(converseMessageUpdated, interaction);
              interaction.converse.unshift(converseMessageObj);
              this.appDataShareService.updateContactSection.next(interaction.id);
              this.appDataShareService.appNotification({contact_explorers_converse: true});
            }
          }
        }
        else if (converseMessageUpdated.interaction.converse === true && this.appDataShareService.allInteraction.converse.length > 0){
          const interactionIndex = this.appDataShareService.allInteraction.converse.findIndex(interaction => interaction.id === converseMessageUpdated.interaction.id);
          if (interactionIndex > -1){
            interaction = this.appDataShareService.allInteraction.converse[interactionIndex];

            const converseMessageIndex = interaction.converse.findIndex(converse => converse.id === converseMessageUpdated.id);
            if (converseMessageIndex > -1){
              interaction.converse[converseMessageIndex].seen = converseMessageUpdated.seen;

              if (interaction.converse[converseMessageIndex].opened != converseMessageUpdated.opened){
                interaction.converse[converseMessageIndex].opened = converseMessageUpdated.opened;
                this.appDataShareService.updateContactSection.next(interaction.id);
              }
            }
            else{
              console.log(converseMessageUpdated);
              if (interaction.draft_converse.in_transit){
                interaction.draft_converse.in_transit = false;
                interaction.draft_converse.body = null;
                interaction.draft_converse.updated = new Date();
              }
              const converseMessageObj:CONVERSE = createConverseMessage(converseMessageUpdated, interaction);
              interaction.converse.unshift(converseMessageObj);
              this.appDataShareService.updateContactSection.next(interaction.id);
              this.appDataShareService.appNotification({contact_converse: true});
            }
          }
        }
      }
    });

    this.typingStatusUpdated = this.graphqlService.subscription(TYPING_STATUS_UPDATED, {token:this.token})
    .subscribe((result:any) => {
      if (result.data?.typingStatusUpdated){
        const studentInteraction = result.data.typingStatusUpdated;

        if (this.appDataShareService.allInteraction.explorers.length > 0){
          const interactionIndex = this.appDataShareService.allInteraction.explorers.findIndex(interaction => interaction.student_interaction.id === studentInteraction.id);

          if (interactionIndex > -1){
            const interaction = this.appDataShareService.allInteraction.explorers[interactionIndex];

            interaction.student_interaction.typing = studentInteraction.typing;
          }
        }
      }
    });
  }

  closeConnection(){
    this.onlineStatus.unsubscribe();
    this.chatMessageUpdated.unsubscribe();
    this.chatMessageUpdated.unsubscribe();
    this.converseMessageUpdated.unsubscribe();
    this.typingStatusUpdated.unsubscribe();
  }
}
