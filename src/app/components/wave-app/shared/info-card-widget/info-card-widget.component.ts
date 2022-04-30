import { INTERACTION, STUDENT_INFO_CARD_DATA } from '../../../../_helpers/constents';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { identicon } from 'minidenticons';
import { threeDaysLeft, timeAfter, timeSinceFormat, truncate } from 'src/app/_helpers/functions.utils';
import { Subscription } from 'rxjs';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';

@Component({
  selector: 'app-info-card-widget',
  templateUrl: './info-card-widget.component.html',
  styleUrls: ['./info-card-widget.component.scss']
})
export class InfoCardWidgetComponent implements OnInit, OnDestroy {

  constructor(
    private domSanitizer: DomSanitizer,
    private appDataShareService:AppDataShareService
    ) { }

  @Input() displayContext:{explorers: boolean, converse: boolean, draft_converse: boolean};
  @Input() interaction:INTERACTION;

  infoCardData:STUDENT_INFO_CARD_DATA;

  updateOnChange:Subscription;
  notifyOnChange:Subscription;


  ngOnInit(): void {
    this.onInit();

    this.updateOnChange = this.appDataShareService.updateContactSection
    .subscribe(id => this.interaction.id === id ? this.onInit() : null);

    this.notifyOnChange = this.appDataShareService.notifyUpdates
    .subscribe(id => this.interaction.id === id && !this.interaction.selected ? this.onInit() : null);
  }

  svg(username:string): SafeHtml{
    return this.domSanitizer.bypassSecurityTrustHtml(identicon(username));
  }

  friendlyTimeFormat(time):string{
    return timeSinceFormat(time);
  }


  onInit(){
    if (this.interaction.student_interaction.profile.deleted){
      this.infoCardData = {
        imgUrl: null,
        titleText: this.interaction.student_interaction.profile.nickname,
        contactStatus: {
          text: "Account Deleted",
          symbol: null,
          highPriority: true,
          newMessage: 0
        },
        messageText: "You can remove this user",
        messageStatus: null
      }
    }
    else if (this.interaction.blocked){
      this.infoCardData = {
        imgUrl: null,
        titleText: this.interaction.student_interaction.profile.fullname,
        contactStatus: {
          text: "Account Blocked",
          symbol: null,
          highPriority: true,
          newMessage: 0
        },
        messageText: "Account is blocked",
        messageStatus: null
      }
    }
    else{
      if (this.displayContext.explorers === true){
        this.infoCardData ={
          imgUrl: null,
          titleText: this.interaction.student_interaction.profile.fullname,
        }
  
        if (this.interaction.chat[0]?.created > this.interaction.converse[0]?.created){
  
          if (this.interaction.chat[0].sender_user === true){
  
            this.infoCardData.contactStatus = {
              text: this.interaction.chat[0].created,
              symbol:'chat',
              highPriority: false,
              newMessage: 0
            }
  
            if (this.interaction.chat[0].type != 'TEXT' && this.interaction.chat[0].body === null){
              this.infoCardData.messageText = this.interaction.chat[0].type;
            }
            else{
              this.infoCardData.messageText = this.interaction.chat[0].deleted ? 'message deleted' : truncate(this.interaction.chat[0].body, 29);
            }
  
            if (this.interaction.chat[0].seen){
              this.infoCardData.messageStatus = {
                waiting: false,
                highPriority: true,
                hint: "seen"
              }
            }
            else{
              this.infoCardData.messageStatus = {
                waiting: false,
                highPriority: false,
                hint: "received"
              }
            }
          }
          else if (this.interaction.chat[0].sender_student === true){
            if (this.interaction.chat[0].type != 'TEXT' && this.interaction.chat[0].body === null){
              this.infoCardData.messageText = this.interaction.chat[0].type;
            }
            else{
              this.infoCardData.messageText = this.interaction.chat[0].deleted ? 'message deleted' : truncate(this.interaction.chat[0].body, 29);
            }
  
            this.infoCardData.messageStatus = {
              waiting: null,
              highPriority: false,
              hint: null
            }
  
            if (this.interaction.chat[0].seen){
              this.infoCardData.contactStatus = {
                text: this.interaction.chat[0].created,
                symbol: 'chat',
                highPriority: false,
                newMessage: 0
              }
            }
            else{
              let newMessage = 0;
              for (let message of this.interaction.chat){
                if (!message.seen && !message.sender_user){
                  newMessage++;
                }
                else{
                  break;
                }
              }
              this.infoCardData.contactStatus = {
                text: "new",
                symbol: 'chat',
                highPriority: true,
                newMessage: newMessage
              }
            }
          }
        }
        else{
  
          if (this.interaction.draft_converse.in_transit){
            this.infoCardData.contactStatus = {
              text: this.interaction.draft_converse.updated,
              symbol: null,
              highPriority: false,
              newMessage: 0
            };
            this.infoCardData.messageText = truncate(this.interaction.draft_converse.body, 29);
            this.infoCardData.messageStatus = {
              waiting: true,
              highPriority: false,
              hint: null
            }
          }
  
          else if (this.interaction.converse[0]?.sender_user === true){
  
            this.infoCardData.contactStatus = {
              text: this.interaction.converse[0].created,
              symbol: 'email',
              highPriority: false,
              newMessage: 0
            }
  
            this.infoCardData.messageText = truncate(this.interaction.converse[0].body, 29);
  
            if (this.interaction.converse[0].opened){
              this.infoCardData.messageStatus = {
                waiting: false,
                highPriority: true,
                hint: "opened"
              }
            }
            else{
              this.infoCardData.messageStatus = {
                waiting: false,
                highPriority: false,
                hint: "received"
              }
            }
          }
          else if (this.interaction.converse[0]?.sender_student === true){
  
            this.infoCardData.messageText = truncate(this.interaction.converse[0].body, 29);
            this.infoCardData.messageStatus = {
              waiting: null,
              highPriority: false,
              hint: null
            }
  
            if (this.interaction.converse[0].opened){
              this.infoCardData.contactStatus = {
                text: this.interaction.converse[0].created,
                symbol: 'email',
                highPriority: false,
                newMessage: 0
              }
            }
            else{
              this.infoCardData.contactStatus = {
                text: "new",
                symbol: 'email',
                highPriority: true,
                newMessage: 0
              }
            }
          }
        }
  
      }
  
      else if (this.displayContext.converse === true){
        this.infoCardData ={
          imgUrl: null,
          titleText: this.interaction.student_interaction.profile.nickname,
        }
  
        if (this.interaction.draft_converse.in_transit){
          this.infoCardData.contactStatus = {
            text: this.interaction.draft_converse.updated,
            symbol: null,
            highPriority: false,
            newMessage: 0
          };
          this.infoCardData.messageText = truncate(this.interaction.draft_converse.body, 29);
          this.infoCardData.messageStatus = {
            waiting: true,
            highPriority: false,
            hint: null
          }
        }
        else if (this.interaction.converse.length > 0){
          if (this.interaction.converse[0].sender_user === true){
            this.infoCardData.contactStatus = {
              text: this.interaction.converse[0].created,
              symbol: null,
              highPriority: false,
              newMessage: 0
            };
            this.infoCardData.messageText = truncate(this.interaction.converse[0].body, 29);
            
            if (this.interaction.converse[0].opened){
              this.infoCardData.messageStatus = {
                waiting: false,
                highPriority: true,
                hint: "opened"
              }
            }
            else{
              this.infoCardData.messageStatus = {
                waiting: false,
                highPriority: false,
                hint: "received"
              }
            }
          }
          else if (this.interaction.converse[0].sender_student === true){

            if (this.interaction.expire != null && threeDaysLeft(this.interaction.expire)){
              this.infoCardData.messageText = timeAfter(this.interaction.expire) === false ? 'This contact is expired' : `${timeAfter(this.interaction.expire)} left for you to reply back!`;
            }
            else{
              this.infoCardData.messageText = truncate(this.interaction.converse[0].body, 29);
            }
  
            this.infoCardData.messageStatus = {
              waiting: null,
              highPriority: false,
              hint: null
            };
  
            if (this.interaction.expire != null && threeDaysLeft(this.interaction.expire)){
  
              this.infoCardData.contactStatus = {
                text: timeAfter(this.interaction.expire) === false ? 'Expired' : `Expiring in ${timeAfter(this.interaction.expire)}`,
                symbol: null,
                highPriority: true,
                newMessage: 0
              };
            }
            else if (this.interaction.converse[0].opened){
              this.infoCardData.contactStatus = {
                text: this.interaction.converse[0].created,
                symbol: null,
                highPriority: false,
                newMessage: 0
              };
            }
            else{
              this.infoCardData.contactStatus = {
                text: "new",
                symbol: null,
                highPriority: true,
                newMessage: 0
              };
            }
          }
        }
      }
  
      else{
        this.infoCardData = {
          imgUrl: null,
          titleText: this.interaction.student_interaction.profile.nickname,
          contactStatus: {
            text: this.interaction.draft_converse.updated,
            symbol: null,
            highPriority: false,
            newMessage: 0
          },
          messageText: this.interaction.draft_converse.body === "" ? "Write what's in your mind" : truncate(this.interaction.draft_converse.body, 29),
          messageStatus: null
        }
      }
    }
    
  }

  ngOnDestroy(){
    this.updateOnChange.unsubscribe();
    this.notifyOnChange.unsubscribe();
  }

}
