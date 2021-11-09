import { Injectable} from '@angular/core';
import { Observable, of} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { delay, retryWhen, switchMap, tap } from 'rxjs/operators';
import { dev_prod } from '../_helpers/constents';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService{

  constructor(private userDataService: UserDataService) { }

  private online$: WebSocketSubject<any>;
  public typingStatus$: WebSocketSubject<any>;

  private interactionId:string;
  
  RETRY_SECONDS = 1000;


  online(): Observable<any> {
    const wsUrl = `${dev_prod.wsServerUrl_dev}online/${this.userDataService.getItem({accessToken:true}).accessToken}`;

    return of(wsUrl).pipe(
      switchMap((wsUrl:string):any => {
        if (this.online$) {
          return this.online$;
        } 
        else {
          this.online$ = webSocket({
            url: wsUrl
          });
          return this.online$;
        }
      }),
      retryWhen((errors) => errors.pipe(
        delay(this.RETRY_SECONDS),
        tap(error => {
          if (this.online$ === null){
            throw error;
          }
        })
      ))
    );
  }

  typingStatus(interactionId:string): Observable<any> {
    const wsUrl = `${dev_prod.wsServerUrl_dev}usertyping/${this.userDataService.getItem({accessToken:true}).accessToken}/${interactionId}`;
    this.interactionId = interactionId;

    return of(wsUrl).pipe(
      switchMap((wsUrl:string):any => {
        if (this.typingStatus$) {
          return this.typingStatus$;
        } 
        else {
          this.typingStatus$ = webSocket({
            url: wsUrl,
            closeObserver: {next: () => this.closeTypingStatusConnection()}
          });
          return this.typingStatus$;
        }
      }),
      retryWhen((errors) => errors.pipe(
        delay(this.RETRY_SECONDS),
        tap(error => {
          if (this.typingStatus$ === null){
            throw error;
          }
        })
      ))
    );
  }

  closeTypingStatusConnection(){
    if (this.typingStatus$){
      this.typingStatus$.complete();
      this.typingStatus$ = null;
    }
  }

  closeConnection() {
    if (this.online$) {
      this.online$.complete();
      this.online$ = null;
    }

    this.closeTypingStatusConnection();
  }
}
