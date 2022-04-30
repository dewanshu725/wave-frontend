import { NgModule, APP_INITIALIZER } from '@angular/core';
//import { LocationStrategy, HashLocationStrategy} from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { WaveAppModule } from './components/wave-app/wave-app.module';
import { AccountModule } from './components/account/account.module';

import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { HttpClientModule } from '@angular/common/http';


import {appInitializer} from './_helpers/app.initializer';

import { GraphqlService } from './_services/graphql.service';
import { AuthenticationService } from './_services/authentication.service';
import { ResponsiveService } from './_services/responsive.service';
import { LocationService } from './_services/location.service';
import { AppDataShareService } from './_services/app-data-share.service';
import { UserDataService } from './_services/user-data.service';
import { WebsocketService } from './_services/websocket.service';
import { NotificationService } from './_services/notification.service';
import { RequestService } from './_services/request.service';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ApolloModule,
    HttpClientModule,
    HttpLinkModule,
    BrowserAnimationsModule,
    AccountModule,
    WaveAppModule,
  ],
  providers: [
    GraphqlService,
    AuthenticationService,
    ResponsiveService,
    LocationService,
    AppDataShareService,
    UserDataService,
    WebsocketService,
    NotificationService,
    RequestService,
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [GraphqlService] },
    //{ provide: LocationStrategy, useClass: HashLocationStrategy }

  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
