import { Injectable} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CHAT, CONVERSE, INTERACTION, USER_OBJ } from '../_helpers/constents';
import { createChatMessage, createConverseMessage, createInteraction } from '../_helpers/functions.utils';
import { CHAT_MESSAGE_UPDATED, CHAT_MESSAGE_CREATED, TYPING_STATUS_UPDATED, CONVERSE_MESSAGE_UPDATED, ONLINE_STATUS_UPDATED, PROFILE_STATUS, GET_INTERACTION } from '../_helpers/graphql.query';
import { AppDataShareService } from './app-data-share.service';
import { GraphqlService } from './graphql.service';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService{

  destroy$: Subject<boolean>;
  graphqlSubscription$:Subscription;

  constructor(
    private appDataShareService:AppDataShareService,
    private userDataService: UserDataService,
    private graphqlService: GraphqlService
  ) {}

  onInit(){
    this.destroy$ = new Subject<boolean>();
    this.connectionInit();

    this.graphqlService.webSocketClient.onReconnecting(() => {
      this.reconnect();
    });
  }

  reconnect(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.closeConnection();
      this.graphqlService.resetApolloClient();
      this.destroy$ = new Subject<boolean>();
      setTimeout(() => {
        this.connectionInit();
        resolve(true);
      }, 1000);
    });
  }

  
  onlineStatus(){
    this.graphqlService.subscription(ONLINE_STATUS_UPDATED)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result:any) => {
      if (result.data){
        if (this.appDataShareService.allInteraction.explorers.length > 0){
          this.appDataShareService.allInteraction.explorers.forEach(interaction => {
            if (interaction.student_interaction.profile.id === result.data.onlineStatus.studentProfile.id){
              interaction.student_interaction.profile.last_seen = result.data.onlineStatus.studentProfile.lastSeen;
              interaction.student_interaction.profile.online = result.data.onlineStatus.studentProfile.online;
            }
          });
        }
      }
    });
  }

  profileStatus(){
    this.graphqlService.subscription(PROFILE_STATUS)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result:any) => {
      if (result.data){
        const studentProfile = result.data.profileStatus.studentProfile;
        const user_obj:USER_OBJ = this.userDataService.getItem({userObject:true}).userObject;
        user_obj.newConversationDisabled = studentProfile.newConversationDisabled;
        user_obj.conversationPoints = studentProfile.conversationPoints;
        this.userDataService.setItem({userObject:user_obj});

        if (studentProfile.refreshConnection === true){
          return this.reconnect();
        }
      }
    });
  }

  chatMessageCreated(){
    this.graphqlService.subscription(CHAT_MESSAGE_CREATED)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result:any) => {
      if (result.data?.chatMessageCreated){
        const chatMessageCreated = result.data.chatMessageCreated.chatMessage;

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
  }

  chatMessageUpdated(){
    this.graphqlService.subscription(CHAT_MESSAGE_UPDATED)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result:any) => {
      if (result.data?.chatMessageUpdated){
        const chatMessage = result.data.chatMessageUpdated.chatMessage;

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
  }

  converseMessageUpdated(){
    this.graphqlService.subscription(CONVERSE_MESSAGE_UPDATED)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result:any) => {
      if (result.data?.converseMessageUpdated){
        const converseMessageUpdated = result.data.converseMessageUpdated.converseMessage;
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
        else if (converseMessageUpdated.interaction.converse === true){
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
          else{
            let interaction_obj:INTERACTION;

            (async () =>{
              const fetched = await new Promise<boolean>((resolve, reject) => {
                this.graphqlService.graphqlQuery({
                  query:GET_INTERACTION, 
                  variable:{interactionId: converseMessageUpdated.interaction.id},
                  fetchPolicy:'network-only'
                }).valueChanges.pipe(take(1)).subscribe(
                  (result:any) => {
                    if (result.data?.interaction != null){
                      interaction_obj = createInteraction(
                        result.data.interaction, 
                        this.userDataService.getItem({userObject:true}).userObject.student_profile_id, 
                        'allInteractionConverse'
                      );

                      interaction_obj.converse.push(createConverseMessage(result.data.interaction.conversemessageSet.edges[0].node, interaction_obj));

                      interaction_obj.converse_page_info = {
                        hasNextPage: result.data.interaction.conversemessageSet.pageInfo.hasNextPage,
                        startCursor: result.data.interaction.conversemessageSet.pageInfo.startCursor,
                        endCursor: result.data.interaction.conversemessageSet.pageInfo.endCursor
                      };

                      resolve(true);
                    }
                    else{
                      resolve(false);
                    }
                  },
                  error => resolve(false)
                );
              });

              if (fetched){
                this.appDataShareService.allInteraction.converse.unshift(interaction_obj);
                this.appDataShareService.appNotification({contact_converse: true});
              }
            })();
          }
        }
      }
    });
  }

  typingStatusUpdated(){
    this.graphqlService.subscription(TYPING_STATUS_UPDATED)
    .pipe(takeUntil(this.destroy$))
    .subscribe((result:any) => {
      if (result.data?.typingStatus){
        const studentInteraction = result.data.typingStatus.studentInteraction;

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

  connectionInit(){
    this.onlineStatus();
    this.profileStatus();
    this.chatMessageCreated();
    this.chatMessageUpdated();
    this.converseMessageUpdated();
    this.typingStatusUpdated();
  }

  closeConnection(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
