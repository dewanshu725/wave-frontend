import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './_guards/auth.guard';
import { LoginGuard } from './_guards/login.guard';

import { LogoutComponent } from './components/logout/logout.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path:"",
    loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule)
    //component: HomeComponent
  },
  {
    path:"account",
    canActivate: [LoginGuard],
    loadChildren: () => import('./components/account/account.module').then(m => m.AccountModule)
    //component: AccountComponent
  },
  {
    path:"app",
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/wave-app/wave-app.module').then(m => m.WaveAppModule)
    //component: WaveAppComponent
  },
  {
    path:"logout",
    component: LogoutComponent
  },
  {
    path:"**",
    component:PageNotFoundComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
