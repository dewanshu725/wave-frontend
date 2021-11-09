import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { dataURLtoFile } from './../../../_helpers/functions.utils';


@Component({
  selector: 'app-image-upload-widget',
  templateUrl: './image-upload-widget.component.html',
  styleUrls: ['./image-upload-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadWidgetComponent implements OnInit {

  constructor(private _cd: ChangeDetectorRef) { }

  @Input() smallWidget = true;
  @Input() imgToCrop = false;
  @Input() borderRadius:string;
  @Input() imgURL:any = null;
  @Output() imgFile = new EventEmitter();

  imgPickOverlay = false;

  ngOnInit(): void {}

  openCropperDialog(event: Event, files) {
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
      this.imgFile.emit(dataURLtoFile(this.imgURL, files[0].name));
    }
  }

}
