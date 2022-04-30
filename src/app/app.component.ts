import { GraphqlService } from './_services/graphql.service';
import { ResponsiveService } from './_services/responsive.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ConnectionService } from 'ng-connection-service';
import { takeUntil } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(
    private graphqlService: GraphqlService,
    private responsiveService: ResponsiveService,
    private snackBar: MatSnackBar,
    private connectionService:ConnectionService,
  ){}

  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit(){
    this.connectionService.monitor().pipe(takeUntil(this.destroy$)).subscribe(status =>{
      this.graphqlService.onInternetStatusChange(status);
      if (status){
        this.snackBar.open('Back Online',':)', {duration:2000});
        if (this.graphqlService.tokenRefreshFailed){
          this.graphqlService.getNewToken();
        }
      }
      else{
        this.snackBar.open('You are Offline',':(');
      }
    });
  }

  onResize(){
    this.responsiveService.checkWidth();
  }

  ngOnDestroy(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
