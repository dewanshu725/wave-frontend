import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { composedPath } from 'src/app/_helpers/functions.utils';

@Component({
  selector: 'app-short-content-widget',
  templateUrl: './short-content-widget.component.html',
  styleUrls: ['./short-content-widget.component.scss']
})
export class ShortContentWidgetComponent implements OnInit {

  constructor() { }

  @Input() content:{id:string, image:string, thumnail:string, title:string, description:string};
  @Input() closeButton = false;
  @Input() noWrap = true;
  @Input() imgSize:string;
  @Output() close = new EventEmitter();

  ngOnInit(): void {
  }

  imgLoaded(event){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = this.content.image;
      path[0].classList.remove('lazy');
      path[0].dataset.thumnailError = false;
    }
  }

  imgError(event){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = this.content.image;
      path[0].dataset.thumnailError = true;
      path[0].classList.remove('lazy');
    }
    else if (!path[0].classList.contains('lazy')){
      if (path[0].dataset?.thumnailError == "true"){
        this.content.image = null;
      }
      else{
        path[0].src = this.content.thumnail;
      }
    }
  }

}
