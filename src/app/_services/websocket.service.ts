import { Injectable, isDevMode} from '@angular/core';
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


  RETRY_SECONDS = 1000;

  getWsUrl(path:string){
    return `${isDevMode() ? dev_prod.wsServerUrl_dev : dev_prod.wsServerUrl_prod}${path}/${this.userDataService.getItem({accessToken:true}).accessToken}`;
  }


  online(): Observable<any> {
    return of(this.getWsUrl('online')).pipe(
      switchMap(() => {
        if (this.online$) {
          return this.online$;
        } 
        else {
          this.online$ = webSocket({
            url: this.getWsUrl('online'),
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
          else{
            this.online$ = webSocket({
              url: this.getWsUrl('online')
            });
          }
        })
      ))
    );
  }

  typingStatus(interactionId:string): Observable<any> {
    return of(`${this.getWsUrl('usertyping')}/${interactionId}`).pipe(
      switchMap(() => {
        if (this.typingStatus$) {
          return this.typingStatus$;
        } 
        else {
          this.typingStatus$ = webSocket({
            url: `${this.getWsUrl('usertyping')}/${interactionId}`,
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
          else{
            this.typingStatus$ = webSocket({
              url: `${this.getWsUrl('usertyping')}/${interactionId}`,
              closeObserver: {next: () => this.closeTypingStatusConnection()}
            });
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
