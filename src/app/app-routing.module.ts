import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './components/account/account.component';
import { WaveAppComponent } from './components/wave-app/wave-app.component';

import { AuthGuard } from './_guards/auth.guard';
import { LoginGuard } from './_guards/login.guard';

const routes: Routes = [
  {
    path:"",
    canActivate: [AuthGuard],
    component: WaveAppComponent
  },
  {
    path:"login",
    canActivate: [LoginGuard],
    component: AccountComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
