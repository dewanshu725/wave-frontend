import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './../../_material/material.module';
import { CdkModule } from './../../_material/materialCDK.module';
import { LyuiModule } from './../../_material/lyui.module';

import { AlertBoxComponent } from './alert-box/alert-box.component';
import { CropperImgDialogComponent } from './cropper-img-dialog/cropper-img-dialog.component';
import { ImageUploadWidgetComponent } from './image-upload-widget/image-upload-widget.component';
import { InfoCardWidgetComponent } from './info-card-widget/info-card-widget.component';
import { LoadingComponent } from './loading/loading.component';
import { ProfileWidgetComponent } from './profile-widget/profile-widget.component';



@NgModule({
  declarations: [
    AlertBoxComponent,
    CropperImgDialogComponent,
    ImageUploadWidgetComponent,
    InfoCardWidgetComponent,
    LoadingComponent,
    ProfileWidgetComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CdkModule,
    LyuiModule
  ],
  exports: [
    CommonModule,
    MaterialModule,
    CdkModule,
    FormsModule,
    ReactiveFormsModule,

    AlertBoxComponent,
    ImageUploadWidgetComponent,
    LoadingComponent,
    ProfileWidgetComponent,
    InfoCardWidgetComponent
  ]
})
export class SharedModule { }
