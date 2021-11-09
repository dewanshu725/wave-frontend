import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';

import { WaveAppRoutingModule } from './wave-app-routing.module';
import { DragScrollModule } from 'ngx-drag-scroll';
import { NgxMasonryModule } from 'ngx-masonry';


import { WaveAppComponent } from './wave-app.component';

import { VueComponent } from './shared/vue/vue.component';
import { InfoCardWidgetComponent } from './shared/info-card-widget/info-card-widget.component';

import { SettingRightComponent } from './wave-components/setting-right/setting-right.component';
import { SettingLeftComponent } from './wave-components/setting-left/setting-left.component';
import { InterestComponent } from './wave-components/setting-right/interest/interest.component';
import { InterestLeftComponent } from './wave-components/interest-left/interest-left.component';
import { InterestRightComponent } from './wave-components/interest-right/interest-right.component';
import { MyVueComponent } from './wave-components/interest-right/my-vue/my-vue.component';
import { CreateVueComponent } from './wave-components/interest-right/my-vue/create-vue/create-vue.component';
import { CreatedVuesComponent } from './wave-components/interest-right/my-vue/created-vues/created-vues.component';
import { ProfileLeftComponent } from './wave-components/profile-left/profile-left.component';
import { VueFeedComponent } from './wave-components/interest-right/vue-feed/vue-feed.component';
import { VueSaveComponent } from './wave-components/interest-right/vue-save/vue-save.component';
import { VueHistoryComponent } from './wave-components/interest-right/vue-history/vue-history.component';
import { ContactLeftComponent } from './wave-components/contact-left/contact-left.component';
import { ContactRightComponent } from './wave-components/contact-right/contact-right.component';
import { ExplorersComponent } from './wave-components/contact-right/explorers/explorers.component';
import { ConverseComponent } from './wave-components/contact-right/converse/converse.component';
import { DraftComponent } from './wave-components/contact-right/draft/draft.component';
import { DraftEditorComponent } from './shared/draft-editor/draft-editor.component';
import { NotifyBoxComponent } from './shared/notify-box/notify-box.component';
import { ConverseMessageComponent } from './shared/converse-message/converse-message.component';
import { ChatComponent } from './shared/chat/chat.component';
import { DisplayVueComponent } from './shared/display-vue/display-vue.component';
import { MessageComponent } from './shared/chat/message/message.component';
import { ProfileRightComponent } from './wave-components/profile-right/profile-right.component';
import { DiscoveryComponent } from './shared/discovery/discovery.component';
import { CreateDiscoveryComponent } from './shared/discovery/create-discovery/create-discovery.component';
import { DisplayDiscoveryComponent } from './shared/discovery/display-discovery/display-discovery.component';
import { PreferenceComponent } from './wave-components/setting-right/preference/preference.component';


@NgModule({
  imports: [
    SharedModule,
    DragScrollModule,
    NgxMasonryModule,
    WaveAppRoutingModule,
  ],
  declarations: [
    WaveAppComponent,
    VueComponent,
    InfoCardWidgetComponent,
    SettingRightComponent,
    SettingLeftComponent,
    InterestComponent,
    InterestLeftComponent,
    InterestRightComponent,
    MyVueComponent,
    CreateVueComponent,
    CreatedVuesComponent,
    ProfileLeftComponent,
    VueFeedComponent,
    VueSaveComponent,
    VueHistoryComponent,
    ContactLeftComponent,
    ContactRightComponent,
    ExplorersComponent,
    ConverseComponent,
    DraftComponent,
    DraftEditorComponent,
    NotifyBoxComponent,
    ConverseMessageComponent,
    ChatComponent,
    DisplayVueComponent,
    MessageComponent,
    ProfileRightComponent,
    DiscoveryComponent,
    CreateDiscoveryComponent,
    DisplayDiscoveryComponent,
    PreferenceComponent
  ]
})

export class WaveAppModule {}
