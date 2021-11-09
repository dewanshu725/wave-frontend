import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  constructor(
    public matDialogRef: MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {imageUrl:string}
    ) { }

  scale:number = 1;
  rotate:number = 0;
  transformValue:string;
  scaleFunction:string;
  rotateFunction:string;

  imagevisible = true;

  ngOnInit(): void {}

  transform(imageRef:HTMLImageElement){
    if (imageRef.style.transform != ''){
      const transformArray = imageRef.style.transform.split(')');
      this.scaleFunction = `scale(${this.scale})`;
      this.rotateFunction = `rotate(${this.rotate}deg)`;

      if (transformArray[0].startsWith('translate3d')){
        this.transformValue = `${transformArray[0]}) ${this.scaleFunction} ${this.rotateFunction}`;
      }
      else{
        this.transformValue = `${this.scaleFunction} ${this.rotateFunction}`;
      }
    }
    else{
      this.scaleFunction = `scale(${this.scale})`;
      this.rotateFunction = `rotate(${this.rotate}deg)`;
      this.transformValue = `${this.scaleFunction} ${this.rotateFunction}`;
    }

    imageRef.style.transform = this.transformValue;
  }

  dragMoving(imageRef:HTMLImageElement){
    const transformArray = imageRef.style.transform.split(')');
    imageRef.style.transform = `${transformArray[0]}) ${this.scaleFunction} ${this.rotateFunction}`;
  }

  zoom(imageRef:HTMLImageElement, zoomIn:boolean){
    if (zoomIn){
      if (this.scale < 3.1){
        this.scale += 0.1;
      }
    }
    else{
      if (this.scale > 1){
        this.scale -= 0.1;
      }
    }

    this.transform(imageRef);
  }

  Rotate(imageRef:HTMLImageElement){
    if (this.rotate === -270){
      this.rotate = 0;
    }
    else{
      this.rotate += -90;
    }

    this.transform(imageRef);
  }

  reset(){
    this.imagevisible = false;
    this.rotate = 0;
    this.scale = 1;
    this.scaleFunction = `scale(${this.scale})`;
    this.rotateFunction = `rotate(${this.rotate}deg)`;

    setTimeout(() => this.imagevisible = true, 0);
  }

  close(){
    this.matDialogRef.close();
  }  

}
