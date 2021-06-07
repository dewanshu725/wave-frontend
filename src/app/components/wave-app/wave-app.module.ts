import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';

import { WaveAppRoutingModule } from './wave-app-routing.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { NgxMasonryModule } from 'ngx-masonry';


import { WaveAppComponent } from './wave-app.component';

import { VueComponent } from './shared/vue/vue.component';

import { SettingRightComponent } from './wave-components/setting-right/setting-right.component';
import { SettingLeftComponent } from './wave-components/setting-left/setting-left.component';
import { InterestComponent } from './wave-components/setting-right/interest/interest.component';
import { InterestLeftComponent } from './wave-components/interest-left/interest-left.component';
import { InterestRightComponent } from './wave-components/interest-right/interest-right.component';
import { MyVueComponent } from './wave-components/interest-right/my-vue/my-vue.component';
import { CreateVueComponent } from './wave-components/interest-right/my-vue/create-vue/create-vue.component';
import { CreatedVuesComponent } from './wave-components/interest-right/my-vue/created-vues/created-vues.component';
import { ProfileComponent } from './wave-components/profile/profile.component';
import { VueFeedComponent } from './wave-components/interest-right/vue-feed/vue-feed.component';
import { VueSaveComponent } from './wave-components/interest-right/vue-save/vue-save.component';
import { VueHistoryComponent } from './wave-components/interest-right/vue-history/vue-history.component';
import { ContactLeftComponent } from './wave-components/contact-left/contact-left.component';


@NgModule({
  imports: [
    SharedModule,
    DragScrollModule,
    NgxMasonryModule,
    WaveAppRoutingModule
  ],
  declarations: [
    WaveAppComponent,
    VueComponent,
    SettingRightComponent,
    SettingLeftComponent,
    InterestComponent,
    InterestLeftComponent,
    InterestRightComponent,
    MyVueComponent,
    CreateVueComponent,
    CreatedVuesComponent,
    ProfileComponent,
    VueFeedComponent,
    VueSaveComponent,
    VueHistoryComponent,
    ContactLeftComponent
  ]
})

export class WaveAppModule {}
