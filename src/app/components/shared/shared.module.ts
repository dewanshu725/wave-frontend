import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './../../_material/material.module';
import { CdkModule } from './../../_material/materialCDK.module';

import { AlertBoxComponent } from './alert-box/alert-box.component';
import { ImageUploadWidgetComponent } from './image-upload-widget/image-upload-widget.component';
import { LoadingComponent } from './loading/loading.component';
import { ProfileWidgetComponent } from './profile-widget/profile-widget.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ShortContentWidgetComponent } from './short-content-widget/short-content-widget.component';
import { MultiContentWidgetComponent } from './multi-content-widget/multi-content-widget.component';



@NgModule({
  declarations: [
    AlertBoxComponent,
    ImageUploadWidgetComponent,
    LoadingComponent,
    ProfileWidgetComponent,
    ImageViewerComponent,
    ShortContentWidgetComponent,
    MultiContentWidgetComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CdkModule,
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
    ImageViewerComponent,
    ShortContentWidgetComponent,
    MultiContentWidgetComponent
  ]
})
export class SharedModule { }
