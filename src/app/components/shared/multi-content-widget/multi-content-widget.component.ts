import { Component, Input, OnInit } from '@angular/core';
import { composedPath } from 'src/app/_helpers/functions.utils';

@Component({
  selector: 'app-multi-content-widget',
  templateUrl: './multi-content-widget.component.html',
  styleUrls: ['./multi-content-widget.component.scss']
})
export class MultiContentWidgetComponent implements OnInit {

  constructor() { }

  @Input() title:string;
  @Input() contentSymbol:boolean = false;
  @Input() contentSymbolName:string;
  @Input() centerSymbolName:string;
  @Input() content:number|string;
  @Input() images:{image:string, thumnail:string}[] = [];

  imageError = false;

  ngOnInit(): void {

  }

  imgLoaded(event, image){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy')){
      path[0].src = image.image;
      path[0].classList.remove('lazy');
    }
  }

  imgError(event, image){
    const path = event.path || (event.composedPath && event.composedPath()) || composedPath(event.target);

    if (path[0].classList.contains('lazy') && image.image != null){
      path[0].src = image.image;
      path[0].classList.remove('lazy');
    }
    else if (!path[0].classList.contains('lazy')){
      this.imageError = true;
    }
  }

}
