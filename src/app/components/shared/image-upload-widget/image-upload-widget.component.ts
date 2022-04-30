import { Component, ChangeDetectionStrategy, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { dataURLtoFile } from './../../../_helpers/functions.utils';


@Component({
  selector: 'app-image-upload-widget',
  templateUrl: './image-upload-widget.component.html',
  styleUrls: ['./image-upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadWidgetComponent implements OnInit {

  constructor() { }

  @Input() smallWidget = true;
  @Input() imgToCrop = false;
  @Input() imgToDelete = false;
  @Input() imgDeleting = false;
  @Input() borderRadius:string;
  @Input() imgURL:any = null;

  @Output() imgFile = new EventEmitter();
  @Output() imgDelete = new EventEmitter();

  imgPickOverlay = false;

  ngOnInit(): void {}

  openCropperDialog(files) {
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
      this.imgFile.emit(dataURLtoFile(this.imgURL, files[0].name));
    }
  }

  deleteImage(){

  }

}
