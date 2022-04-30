import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AfterViewInit, Component, Input, NgZone, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, of, Subscription } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { AlertBoxComponent } from 'src/app/components/shared/alert-box/alert-box.component';
import { CHAT, INTERACTION, LINK } from 'src/app/_helpers/constents';
import { composedPath, createChatMessage, dataURLtoFile, getDomain, placeholderImage, } from 'src/app/_helpers/functions.utils';
import { ALL_CHAT, CHAT_MESSAGE_CURSOR, DELETE_CHAT_MESSAGE, GENERATE_LINK_PREVIEW, MARK_CHAT_MESSAGE_SEEN, SEND_CHAT_MESSAGE } from 'src/app/_helpers/graphql.query';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';
import { GraphqlService } from 'src/app/_services/graphql.service';
import { WebsocketService } from 'src/app/_services/websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService, 
    private graphqlService: GraphqlService,
    private websocketService:WebsocketService,
    private _ngZone: NgZone,
    private snackBar: MatSnackBar,
    private matDialog:MatDialog
  ) { }

  @Input() containerHeight:string;
  @Input() interactionId:string;

  @ViewChild('chatTextarea') chatTextArea: CdkTextareaAutosize;
  @ViewChild('messageInput') messageInput;

  interaction:INTERACTION;
  fetchMore:boolean;
  minMessageFeedLength = 5;
  loading = false;
  messageSending = false;
  messageDeleting = false;
  checkScrollTop = true;
  currentSelectedChat:CHAT = null;
  currentMessageRef:HTMLDivElement = null;

  chatTextarea = false;
  attachementOption = {
    active: false,
    option:{
      link: false,
      image: false
    }
  }

  attachement: {
    active: boolean,
    type: {
      message: boolean,
      link: boolean,
      image: boolean
    },
    body: {
      message: CHAT,
      link: LINK,
      image: {
        imgUrl:string | ArrayBuffer,
        file:File,
        size?:string
      }
    }
  } = {
    active: false,
    type: {
      message: false,
      link: false,
      image: false
    },
    body: {
      message: null,
      link: null,
      image: null
    }
  }

  chatForm:FormGroup;
  messageValueUnsub:Subscription;
  messageSendDisabled = true;
  linkValue:string;
  linkInputValid = false;
  linkPreviewLoading = false;
  linkPreviewData:LINK;

  typingRequestSend = false;

  newChatMessageUnsub: Subscription;
  messageTypingUnsub: Subscription;

  ngOnChanges(){
    const Index = this.appDataShareService.allInteraction.explorers.findIndex(obj => obj.id === this.interactionId);
    if (Index > -1){
      this.interaction = this.appDataShareService.allInteraction.explorers[Index];
      this.markChatMessageSeen();
    }

    this.fetchMore = this.interaction.chat_page_info?.hasNextPage;

    if (this.interaction.chat?.length < this.minMessageFeedLength){
      this.fetchMore ? this.getChat() : null;
    }
  }
  
  ngOnInit(): void {
    this.chatForm = new FormGroup({
      'body': new FormControl(null)
    });

    this.messageValueUnsub = this.chatForm.get('body').valueChanges.subscribe(() => this.checkMessageDisabled());

    this.chatTextarea = true;

    this.newChatMessageUnsub = this.appDataShareService.notifyUpdates
    .subscribe(id => {
      if (this.interaction.id === id){
        this.markChatMessageSeen();
      }
    });

    this.websocketService.typingStatus(this.interaction.id).subscribe();

    this.appDataShareService.appActivePath.contact.explorers.chat.active = true;
    this.appDataShareService.appActivePath.contact.explorers.chat.notification = false;
    this.appDataShareService.notification.next(true);
  }


  ngAfterViewInit(){
    this.messageTypingUnsub = fromEvent(this.messageInput.nativeElement, 'keyup')
    .pipe(
      map((event:any) => {
        if (!this.typingRequestSend){
          this.typingRequestSend = true;

          if (this.websocketService.typingStatus$ != null){
            this.websocketService.typingStatus$.next({'start_typing': true});
          }
          else{
            this.websocketService.typingStatus(this.interaction.id).subscribe();
            this.websocketService.typingStatus$.next({'start_typing': true});
          }
        }
        return event;
      }),
      debounceTime(2000),
      switchMap(():any =>{
        if (this.typingRequestSend){
          this.typingRequestSend = false;

          if (this.websocketService.typingStatus$ != null){
            this.websocketService.typingStatus$.next({'start_typing': false});
          }
          else{
            this.websocketService.typingStatus(this.interaction.id).subscribe();
            this.websocketService.typingStatus$.next({'start_typing': false});
          }
        }
        return of({result: null});
      })
    )
    .subscribe();
  }


  deleteMessage(message:HTMLDivElement, chat:CHAT){
    const dialogRef = this.matDialog.open(AlertBoxComponent, {
      width:'30%',
      backdropClass: ['frosted-glass-blur'],
      data: {
        title: 'Confirm',
        message: 'Once deleted, you won’t be able to recover it later',
        singleAction: false,
        actionName: 'Delete',
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response){
        this.messageDeleting = true;

        (async () => {
          const tokenStatus = await this.graphqlService.isTokenValid();

          if (tokenStatus){
            this.graphqlService.graphqlMutation(DELETE_CHAT_MESSAGE, {'chatMessageId': chat.id}).pipe(take(1))
            .subscribe(
              (result:any) => {
                if (result.data?.deleteChatMessage?.result === true){
                  this.selectChat(chat, message);
                  chat.deleted = true;
                  chat.body = null;
                  chat.image = null;
                  chat.link = null;
                  chat.vue = null;
                }
                else{
                  this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
                }

                this.messageDeleting = false;
              },
              error => {
                this.messageDeleting = false;
                this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              }
            );
          }
          else{
            this.messageDeleting = false;
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
          }
        })();
      }
    });
  }

  deleteMessageDataset(message:HTMLDivElement){
    delete message.dataset.promtDelete;
    delete message.dataset.messageDeleting;
  }

  checkMessageDisabled(){
    if (this.chatForm.get('body').value?.length > 0 || this.attachement.type.link || this.attachement.type.image){
      this.messageSendDisabled = false;
    }
    else{
      this.messageSendDisabled = true;
    }
  }

  resetMessageBox(chatContainer:HTMLDivElement){
    this.chatForm.get('body').setValue(null);
    this.attachement = {
      active: false,
      type: {
        message: false,
        link: false,
        image: false
      },
      body: {
        message: null,
        link: null,
        image: null
      }
    }

    this.checkMessageDisabled();
    chatContainer.scrollTop = 0;
  }

  markChatMessageSeen(){
    if (!this.interaction?.chat[0]?.seen){
      this.graphqlService.graphqlMutation(MARK_CHAT_MESSAGE_SEEN, {'interactionId': this.interaction.id}).pipe(take(1))
      .subscribe((result:any) =>{
        if (result.data?.markChatMessageSeen?.result === true){
          for (let message of this.interaction.chat){
            if (!message.seen && !message.sender_user){
              message.seen = true;
            }
            else{
              break;
            }
          }
          this.appDataShareService.updateContactSection.next(this.interaction.id);
        }
      });
    }
  }

  getEndCursor(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.interaction.chat.length != 0){
        const endChatId = this.interaction.chat[this.interaction.chat.length - 1].id;
        this.graphqlService.graphqlMutation(CHAT_MESSAGE_CURSOR, {chatMessageId: endChatId}).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data && result.data.chatMessageCursor?.cursor){
              this.interaction.chat_page_info.endCursor = result.data.chatMessageCursor.cursor;
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

  getChat(){
    this.loading = true;

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){
        const getUpdatedCursor = await this.getEndCursor();
        if (getUpdatedCursor){
          const mutationArrgs = {
            'interactionId': this.interaction.id,
            'first': this.minMessageFeedLength,
            'after': this.interaction.chat_page_info ? this.interaction.chat_page_info.endCursor : ""
          }
  
          this.graphqlService.graphqlQuery({query:ALL_CHAT, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges
          .pipe(take(1)).subscribe(
            (result:any) => {
              if (result.data && result.data.interaction.chatmessageSet){
                const pageInfo = result.data.interaction.chatmessageSet.pageInfo;
                const chatSet = result.data.interaction.chatmessageSet.edges;
  
                this.interaction.chat_page_info = {
                  hasNextPage: pageInfo.hasNextPage,
                  startCursor: pageInfo.startCursor,
                  endCursor: pageInfo.endCursor
                }
  
                this.fetchMore = pageInfo.hasNextPage;
  
                chatSet.forEach((element, index) => {
                  const chat_obj:CHAT = createChatMessage(element.node, this.interaction);
    
                  const currentChatDate = chat_obj.created.getDate();
                  const previousChat = this.interaction.chat[this.interaction.chat.length - 1];
                  const previousChatDate = previousChat.created.getDate();
                  let newDate = false;
                  if (currentChatDate != previousChatDate){
                    previousChat.newDate = true;
                  }
                  else{
                    previousChat.newDate = false;
                  }

                  if (chatSet.length - 1 === index){
                    newDate = true;
                  }

                  chat_obj.newDate = newDate;
  
                  this.interaction.chat.push(chat_obj);                
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
        this.fetchMore ? this.getChat() : null;
      }
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
      .subscribe(() => {
        this.chatTextArea.resizeToFitContent(true)
      });
  }

  imageAttagementError(event){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    path[0].src = placeholderImage(path[0].clientWidth, path[0].clientHeight);
  }

  imgLinkLoad(event){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    this.attachement.body.link.image.width = path[0].naturalWidth,
    this.attachement.body.link.image.height = path[0].naturalHeight
  }

  attachementState(){
    if (this.chatTextarea){
      this.attachementOption.active = false;
      this.chatTextarea = false;
    }
    else{
      this.attachementOption = {active: false, option:{link: false, image: false}};
      this.chatTextarea = true;
    }
  }

  activateAttachement(link=false){
    if (link){
      this.attachementOption = {active: true, option:{link: true, image: false}};
      this.linkInputValid = false;
      this.linkValue = null;
    }
  }

  linkInputChange(linkInput:HTMLInputElement){
    this.linkValue = linkInput.value;

    const linkValid = this.linkValue.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)+[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}(:[0-9]{1,10})?(\/.*)?$/g);
    if (linkValid){
      this.linkInputValid = true;
    }
    else{
      this.linkInputValid = false;
    }
  }

  linkSubmit(){

    (async () =>{
      const tokenStatus = await this.graphqlService.isTokenValid();
      if (tokenStatus){

        this.linkPreviewLoading = true;

        const mutationArrgs = {
          'link': this.linkValue
        }

        this.graphqlService.graphqlMutation(GENERATE_LINK_PREVIEW, mutationArrgs).pipe(take(1))
        .subscribe((result:any) => {
          if (result.data && result.data.generateLinkPreview){
            const linkPreview = result.data.generateLinkPreview;
            this.linkPreviewLoading = false;

            if (linkPreview.error){
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            }
            else{
              this.linkPreviewData = {
                image: {
                  image: linkPreview.image,
                  width: null,
                  height: null
                },
                title: linkPreview.title,
                site_name: linkPreview.siteName,
                domain_name: getDomain(linkPreview.url).split('.')[0],
                url: linkPreview.url
              }

              this.attachementState();
              this.attachLink(this.linkPreviewData);
            }
          }
        });
      }
    })();
  }

  selectChat(chat:CHAT, message?:HTMLDivElement){
    if (!chat.selected){
      chat.selected = true;

      if (this.currentSelectedChat){
        this.currentSelectedChat.selected = false;
        this.deleteMessageDataset(this.currentMessageRef);
      }

      this.currentSelectedChat = chat;
      this.currentMessageRef = message;
    }
    else{
      chat.selected = false;
      this.currentSelectedChat = null;

      if (chat.sender_user && message){
        this.deleteMessageDataset(message);
      }
    }
  }

  attachMessage(chat?:CHAT, message?:HTMLDivElement){
    if (!this.attachement.type.message){
      this.attachement.active = true;
      this.attachement.type.message = true;
      this.attachement.body.message = chat;
      this.selectChat(chat, message);
    }
    else{
      this.attachement.type.message = false;
      this.attachement.body.message = null;

      if (!this.attachement.type.link && !this.attachement.type.image) this.attachement.active = false;
    }
  }

  attachLink(linePreviewData?:LINK){
    if (!this.attachement.type.link){
      this.attachement.active = true;
      this.attachement.type.link = true;
      this.attachement.body.link = linePreviewData;
      this.checkMessageDisabled();
    }
    else{
      this.attachement.active && !this.attachement.type.message ? this.attachement.active = false : null;
      this.attachement.type.link = false;
      this.attachement.body.link = null;
      this.checkMessageDisabled();
    }
  }

  attachImage(files?){
    if (!this.attachement.type.image){
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
        this.attachement.body.image = {
          imgUrl: reader.result,
          file: dataURLtoFile(reader.result, files[0].name)
        }

        if (this.attachement.body.image.file.size/(1024*1024) >= 1){
          this.attachement.body.image.size = Math.round(this.attachement.body.image.file.size/(1024*1024)) + ' MB'; 
        }
        else{
          this.attachement.body.image.size = Math.round(this.attachement.body.image.file.size/1024) + ' KB';
        }

        this.attachement.active = true;
        this.attachement.type.image = true;
        this.attachementState();
        this.checkMessageDisabled();
      }
    }
    else{
      this.attachement.active && !this.attachement.type.message ? this.attachement.active = false : null;
      this.attachement.type.image = false;
      this.attachement.body.image = null;
      this.checkMessageDisabled();
    }
  }

  showMessageOrContext(message:HTMLDivElement){
    if (message.dataset?.showMessage != undefined){
      if (message.dataset.showMessage == 'true'){
        message.dataset.showMessage = 'false';
      }
      else{
        message.dataset.showMessage = 'true';
      }
    }
    else{
      message.dataset.showMessage = 'false';
    }
  }

  sendMessage(chatContainer:HTMLDivElement){
    const chatMessagePayload = {
      interactionId: this.interaction.id,

      message: null,
      messageContextId: null,

      linkImageUrl: null,
      linkImageWidth: null,
      linkImageHeight: null,
      linkTitle: null,
      linkUrl: null,
      linkDomainName: null,
      linkSiteName: null,

      imageFile: null,
    }

    if (this.chatForm.get('body').value != null && this.chatForm.get('body').value?.trim().length > 0){
      chatMessagePayload.message = this.chatForm.get('body').value.trim();
    }
    if (this.attachement.type.message){
      chatMessagePayload.messageContextId = this.attachement.body.message.id;
    }
    if (this.attachement.type.link){
      chatMessagePayload.linkImageUrl = this.attachement.body.link.image.image;
      chatMessagePayload.linkImageWidth = this.attachement.body.link.image.width;
      chatMessagePayload.linkImageHeight = this.attachement.body.link.image.height;
      chatMessagePayload.linkTitle = this.attachement.body.link.title;
      chatMessagePayload.linkUrl = this.attachement.body.link.url;
      chatMessagePayload.linkDomainName = this.attachement.body.link.domain_name;
      chatMessagePayload.linkSiteName = this.attachement.body.link.site_name;
    }
    if (this.attachement.type.image){
      chatMessagePayload.imageFile = this.attachement.body.image.file;
    }

    (async () =>{
      this.messageSending = true;
      const tokenStatus = await this.graphqlService.isTokenValid();

      if (tokenStatus){
        this.graphqlService.graphqlMutation(SEND_CHAT_MESSAGE, chatMessagePayload).pipe(take(1))
        .subscribe(
          (result:any) =>{
            if (result.data?.sendChatMessage?.chatMessage){
              const chatMessage = result.data.sendChatMessage.chatMessage;
              const chat_obj:CHAT = createChatMessage(chatMessage, this.interaction);

              const currentChatDate = chat_obj.created.getDate();
              const previousChat = this.interaction.chat[0];
              const previousChatDate = previousChat != undefined ? previousChat?.created.getDate() : null;
              let newDate = false;
              if (previousChatDate === null || currentChatDate != previousChatDate){
                newDate = true;
              }

              chat_obj.newDate = newDate;

              this.interaction.chat.unshift(chat_obj);

              this.messageSending = false;
              this.resetMessageBox(chatContainer);

            }
            else{
              this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
              this.messageSending = false;
            }
          },
          error => {
            this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
            this.messageSending = false;
          }
        );
      }
    })();

  }

  ngOnDestroy(){
    if (this.currentSelectedChat){
      this.currentSelectedChat.selected = false;
      this.currentSelectedChat = null;
    }

    this.messageValueUnsub.unsubscribe();
    this.newChatMessageUnsub.unsubscribe();
    this.messageTypingUnsub.unsubscribe();
    this.websocketService.closeTypingStatusConnection();

    this.appDataShareService.appActivePath.contact.explorers.chat.active = false;
  }

}
