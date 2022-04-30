import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { DRAFT_EDITOR_CONTEXT, INTERACTION } from 'src/app/_helpers/constents';
import { timeSince } from 'src/app/_helpers/functions.utils';
import { SAVE_DRAFT_MESSAGE } from 'src/app/_helpers/graphql.query';
import { GraphqlService } from 'src/app/_services/graphql.service';

@Component({
  selector: 'app-draft-editor',
  templateUrl: './draft-editor.component.html',
  styleUrls: ['./draft-editor.component.scss']
})
export class DraftEditorComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private _ngZone: NgZone,
    private Ref:ChangeDetectorRef,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar,
  ) { }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('draftBody') draftBody;

  @Input() parentContainerWidth:number;
  @Input() parentContainerHeight:number;
  @Input() interaction:INTERACTION;
  @Input() context:DRAFT_EDITOR_CONTEXT;
  @Input() converseContext = true;

  @Output() send = new EventEmitter();
  @Output() close = new EventEmitter();

  halfContainerWidth:string;
  halfContainerHeight:string;
  pinedConverseContainerHeight:string;
  formContainerHeight:string;

  draftForm:FormGroup;
  bodyCountValue = 0;
  maximized:boolean;
  draftBodyUnsub:Subscription;
  currentDraftBodyValue:string;
  draftBodySaving = false;
  draftSendDisable = false;
  friendlyDraftUpdate:string;
  converseIndex:number = null;
  conversePined = false;

  ngOnInit(): void {
    this.draftForm = new FormGroup({
      'body': new FormControl(this.interaction.draft_converse.body, Validators.required)
    });

    this.onModeChange();
    this.maxDraftBody();
  }

  ngAfterViewInit(){

    this.draftBodyUnsub = fromEvent(this.draftBody.nativeElement, 'keyup')
    .pipe(
      map((event:any) => {
        this.bodyCountValue = event.target.value.length;
        this.draftSendDisable = true;
        return event.target.value
      }), 
      debounceTime(2000),
      distinctUntilChanged(),
      switchMap((value:string):any => {
        this.draftBodySaving = true;
        this.currentDraftBodyValue = value.trim();
        
        const mutationArrgs = {
          draftId: this.interaction.draft_converse.id,
          message: value.trim()
        };

        return this.graphqlService.graphqlMutation(SAVE_DRAFT_MESSAGE, mutationArrgs)
        .pipe(
          take(1),
          catchError(error => {
            this.draftBodySaving = false;
            this.draftSendDisable = false;
            return of({result: null});
          })
        )
      })
    )
    .subscribe(
      (result:any) =>{
        if (result.data && result.data.saveDraftConversation.result){
          this.interaction.draft_converse.body = this.currentDraftBodyValue;
          this.interaction.draft_converse.updated = new Date();
          this.friendlyDraftUpdate = timeSince(new Date());
          this.draftBodySaving = false;
          this.draftSendDisable = false;
        }
      },
      error => {this.draftBodySaving = false; this.draftSendDisable = false;}
      
    );

    this.Ref.detectChanges();
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  openVue(url: string){
    window.open(url, "_blank");
  }

  friendlyTime(time:Date):string{
    return timeSince(time);
  }

  startEditMode(){
    this.context.converseView = false;
    this.context.draftView = false;
    this.context.edit = true;
    this.onModeChange();
  }


  onModeChange(){
    if (this.context.converseView === true){
      const Index = this.interaction.converse.findIndex(obj => obj.id === this.context.converseId);
      if (Index > -1){
        this.converseIndex = Index;
      }
    }
  }

  conversePinChanged(){
    if (!this.conversePined){
      this.converseIndex === null ? this.converseIndex = 0 : null;
      this.conversePined = true;
    }
    else{
      this.conversePined = false;
    }
  }

  maxDraftBody(max=false){
    if (max === false){
      this.halfContainerWidth = (0.6 * this.parentContainerWidth) + 'px';
      this.halfContainerHeight = (0.6 * this.parentContainerHeight) + 'px';
      this.pinedConverseContainerHeight = (0.2 * this.parentContainerHeight) + 'px';
      this.formContainerHeight = (0.4 * this.parentContainerHeight) + 'px';
      this.maximized = false;
    }
    else{
      this.halfContainerWidth = (0.9 * this.parentContainerWidth) + 'px';
      this.halfContainerHeight = (0.9 * this.parentContainerHeight) + 'px';
      this.pinedConverseContainerHeight = (0.3 * this.parentContainerHeight) + 'px';
      this.formContainerHeight = (0.6 * this.parentContainerHeight) + 'px';
      this.maximized = true;
    }    
  }

  sendConverse(){
    if (this.interaction.draft_converse.body.length >= 130){
      this.send.emit();
    }
    else{
      this.snackBar.open("Let’s not have small talks, Please", "Write More", {duration:3000});
    }
  }

  ngOnDestroy(){
    if (this.draftBodyUnsub) this.draftBodyUnsub.unsubscribe();
  }

}
