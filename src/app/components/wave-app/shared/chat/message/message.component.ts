import { Component, Input, OnInit } from '@angular/core';
import { CHAT } from 'src/app/_helpers/constents';
import { composedPath, placeholderImage } from 'src/app/_helpers/functions.utils';
import { MatDialog } from '@angular/material/dialog';
import { ImageViewerComponent } from 'src/app/components/shared/image-viewer/image-viewer.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  constructor(private matDialog:MatDialog) { }

  @Input() chat:CHAT;
  @Input() showMessage = true;
  @Input() sender_user:boolean;

  ngOnInit(): void {}


  imgLoaded(event, chat:CHAT){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = chat.image?.image;
      path[0].classList.remove('lazy');
      path[0].dataset.thumnailError = false;
    }
  }

  imgError(event, chat:CHAT){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = chat.image?.image;
      path[0].dataset.thumnailError = true;
      path[0].classList.remove('lazy');
    }
    else if (!path[0].classList.contains('lazy')){
      if (path[0].dataset?.thumnailError == "true"){
        path[0].src = placeholderImage(chat.image?.width, chat.image?.height);
      }
      else{
        path[0].src = chat.image?.thumnail;
      }

      path[0].dataset.imgError = true;
    }
  }

  imgReload(img:HTMLImageElement, chat:CHAT){
    delete img.dataset.imgError;
    img.src = chat.image?.image;
  }

  imgLinkLoaded(event, chat:CHAT){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = chat.link.image?.image;
      path[0].classList.remove('lazy');
      path[0].dataset.thumnailError = false;
    }
  }

  imgLinkError(event, chat:CHAT){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = chat.link.image?.image;
      path[0].dataset.thumnailError = true;
      path[0].classList.remove('lazy');
    }
    else if (!path[0].classList.contains('lazy')){
      if (path[0].dataset?.thumnailError == "true"){
        chat.link.image = null;
      }
      else{
        path[0].src = chat.link.image?.thumnail;
      }
    }
  }

  showMoreOrLess(messageText:HTMLParagraphElement){
    if (messageText.dataset?.showMore != undefined){

      if (messageText.dataset.showMore == 'true'){
        messageText.dataset.showMore = 'false';
      }
      else if (messageText.dataset.showMore == 'false'){
        messageText.dataset.showMore = 'true';
      }

    }
    else{
      messageText.dataset.showMore = 'true';
    }
  }

  openLink(url: string){
    window.open(url, "_blank");
  }

  openImageViewer(image:HTMLImageElement){
    this.matDialog.open(ImageViewerComponent, {
      width:'80%',
      height:'80%',
      backdropClass: ['frosted-glass-blur'],
      data: {imageUrl: image.src}
    });
  }

}
