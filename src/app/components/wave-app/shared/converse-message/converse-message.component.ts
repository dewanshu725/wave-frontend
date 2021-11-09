import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CONVERSE, INTERACTION } from 'src/app/_helpers/constents';
import { createConverseMessage, timeSinceFormat, truncate } from 'src/app/_helpers/functions.utils';
import { ALL_CONVERSE, CONVERSE_MESSAGE_CURSOR, TOUCH_CONVERSATION } from 'src/app/_helpers/graphql.query';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { GraphqlService } from 'src/app/_services/graphql.service';

@Component({
  selector: 'app-converse-message',
  templateUrl: './converse-message.component.html',
  styleUrls: ['./converse-message.component.scss']
})
export class ConverseMessageComponent implements OnInit, OnChanges, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService, 
    private graphqlService: GraphqlService
    ) { }

  @Input() containerHeight:string;
  @Input() interactionId:string;
  @Input() converseContext = true;

  @Output() openMessage = new EventEmitter();

  interaction:INTERACTION;
  fetchMore:boolean;
  minMessageFeedLength = 2;
  loading = false;
  checkScrollTop = true;

  notifyConverseMessage: Subscription;

  ngOnInit(): void {
    this.markSeen(this.interaction);

    if (!this.converseContext){
      this.appDataShareService.appActivePath.contact.explorers.converse.active = true;
      this.appDataShareService.appActivePath.contact.explorers.converse.notification = false;
      this.appDataShareService.notification.next(true);
    }
    else{
      this.appDataShareService.appActivePath.contact.converse.active = true;
      this.appDataShareService.appActivePath.contact.converse.notification = false;
      this.appDataShareService.notification.next(true);
    }

    this.notifyConverseMessage = this.appDataShareService.notifyUpdates
    .subscribe(id => {
      if (this.interaction.id === id){
        this.markSeen(this.interaction);
      }
    });
  }

  ngOnChanges(){
    if (this.converseContext){
      const Index = this.appDataShareService.allInteraction.converse.findIndex(obj => obj.id === this.interactionId);
      if (Index > -1){
        this.interaction = this.appDataShareService.allInteraction.converse[Index];
      }
    }
    else{
      const Index = this.appDataShareService.allInteraction.explorers.findIndex(obj => obj.id === this.interactionId);
      if (Index > -1){
        this.interaction = this.appDataShareService.allInteraction.explorers[Index];
      }
    }

    this.fetchMore = this.interaction.converse_page_info?.hasNextPage;

    if (this.interaction.converse?.length < this.minMessageFeedLength){
      this.fetchMore ? this.getConverse() : null;
    }
  }

  getEndCursor(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.interaction.converse.length != 0){
        const endConverseId = this.interaction.converse[this.interaction.converse.length - 1].id;
        this.graphqlService.graphqlMutation(CONVERSE_MESSAGE_CURSOR, {converseMessageId: endConverseId}).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data?.converseMessageCursor?.cursor){
              this.interaction.converse_page_info.endCursor = result.data.converseMessageCursor.cursor;
              resolve(true);
            }
            else{
              resolve(false);
            }
          },
          error =>{
            resolve(false);
          } 
        );
      }
      else{
        resolve(true);
      }
    });
  }

  getConverse(){
    this.loading = true;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const getUpdatedCursor = await this.getEndCursor();
        if (getUpdatedCursor){
          const mutationArrgs = {
            'interactionId': this.interaction.id,
            'first': this.minMessageFeedLength,
            'after': this.interaction.converse_page_info ? this.interaction.converse_page_info.endCursor : ""
          }
  
          this.graphqlService.graphqlQuery({query:ALL_CONVERSE, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges
          .pipe(take(1)).subscribe(
            (result:any) => {
              if (result.data && result.data.interaction.conversemessageSet){
                const pageInfo = result.data.interaction.conversemessageSet.pageInfo;
                const converseSet = result.data.interaction.conversemessageSet.edges;
  
                this.interaction.converse_page_info = {
                  hasNextPage: pageInfo.hasNextPage,
                  startCursor: pageInfo.startCursor,
                  endCursor: pageInfo.endCursor
                }
  
                this.fetchMore = pageInfo.hasNextPage;
  
                converseSet.forEach(element => {
                  const converse_obj:CONVERSE = createConverseMessage(element.node, this.interaction);
                  this.interaction.converse.push(converse_obj);                
                });
                this.loading = false;
              }
              this.checkScrollTop = true;
            },
            error => {
              this.loading = false;
              this.checkScrollTop = true;
            }
          );
        }
        else{
          this.loading = false;
          this.checkScrollTop = true;
        }
      }
    })();
  }

  onScroll(scrollEvent){
    const element = scrollEvent.target;
    if (this.checkScrollTop){
      if ((element.scrollHeight + element.scrollTop) - element.offsetHeight < 10){
        this.checkScrollTop = false;
        this.fetchMore ? this.getConverse() : null;
      }
    }
  }

  markSeen(interaction:INTERACTION){
    if (interaction.converse[0]?.seen === false){
      const mutationArrgs = {
        converseMessageId: interaction.converse[0].id,
        converseSeen: true
      }

      this.graphqlService.graphqlMutation(TOUCH_CONVERSATION, mutationArrgs).pipe(take(1))
      .subscribe((result:any) => {
        if (result.data && result.data.touchConversation.result){
          interaction.converse[0].seen = true;

          if (this.converseContext){
            const date = new Date();
            date.setDate(date.getDate() + 10);
            interaction.expire = date;
          }
        }
      });
    }
  }


  friendlyTimeFormat(time:Date):string{
    return timeSinceFormat(time);
  }

  truncateBody(body):string{
    return truncate(body, 90)
  }

  ngOnDestroy(){
    this.notifyConverseMessage.unsubscribe();

    if (!this.converseContext){
      this.appDataShareService.appActivePath.contact.explorers.converse.active = false;
    }
    else{
      this.appDataShareService.appActivePath.contact.converse.active = false;
    }
  }

}
