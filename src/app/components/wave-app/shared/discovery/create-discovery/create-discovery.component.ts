import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CONTENT, DISCOVERY, LINK_PREVIEW, VUE_DISCOVERY } from 'src/app/_helpers/constents';
import { createMyDiscoveryObj } from 'src/app/_helpers/functions.utils';
import { DISCOVERY_EDIT, DISCOVERY_PUBLISH } from 'src/app/_helpers/graphql.query';
import { GraphqlService } from 'src/app/_services/graphql.service';

@Component({
  selector: 'app-create-discovery',
  templateUrl: './create-discovery.component.html',
  styleUrls: ['./create-discovery.component.scss']
})
export class CreateDiscoveryComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private graphqlService:GraphqlService,
    private snackBar: MatSnackBar
    ) { }

  @ViewChild('searchInput') searchInput;

  @Input() editMode = false;
  @Input() publicVue:LINK_PREVIEW[] = [];
  @Input() discovery:DISCOVERY;
  @Output() discoveryCreated = new EventEmitter();
  @Output() discoveryEdited = new EventEmitter();
  @Output() goBack = new EventEmitter();

  availableVueArray:LINK_PREVIEW[] = [];
  searchArray:CONTENT[] = [];
  vueAddedArray:CONTENT[] = [];

  discoveryCreateForm:FormGroup;
  discoverySubmiting = false;

  search$:Subscription;

  ngOnInit(): void {
    this.discoveryCreateForm = new FormGroup({
      'title': new FormControl(null, Validators.required)
    });

    this.publicVue.forEach(vue => {
      this.availableVueArray.push(vue);
    });

    this.availableVueArray.forEach(vue => {
      this.searchArray.push({
        id: vue.id,
        image: vue.image != null ? vue.image.image : null,
        thumnail: vue.image != null ? vue.image.thumnail : null,
        title: vue.title,
        description: vue.description
      });
    });

    if (this.editMode){
      this.discoveryCreateForm.get('title').setValue(this.discovery.title);
      this.discovery.vues.forEach(discoveryVue => {
        this.availableVueArray.push(discoveryVue.vue_obj);
        this.vueAddedArray.push({
          id: discoveryVue.vue_obj.id,
          image: discoveryVue.vue_obj.image != null ? discoveryVue.vue_obj.image.image : null,
          thumnail: discoveryVue.vue_obj.image != null ? discoveryVue.vue_obj.image.thumnail : null,
          title: discoveryVue.vue_obj.title,
          description: discoveryVue.vue_obj.description
        });
      });
    }
  }

  ngAfterViewInit(){
    this.search$ = fromEvent(this.searchInput.nativeElement, 'keyup')
    .pipe(
      map((event:any) => {
        return event.target.value
      })
    )
    .subscribe( (value:string) => {
      this.search(value);
    });
  }

  search(searchValue){
    this.searchArray = [];
    this.availableVueArray.filter(vue => vue.title.toLowerCase().startsWith(searchValue.toLowerCase())).forEach(vue => {
      const vueAddedIndex = this.vueAddedArray.findIndex(vueAdd => vueAdd.id === vue.id);
      if (vueAddedIndex === -1){
        this.searchArray.push({
          id: vue.id,
          image: vue.image != null ? vue.image.image : null,
          thumnail: vue.image != null ? vue.image.thumnail : null,
          title: vue.title,
          description: vue.description
        });
      }
    });
  }

  addVue(searchVueId){
    const searchVueIndex = this.searchArray.findIndex(searchVue => searchVue.id === searchVueId);
    if (searchVueIndex > -1){
      this.vueAddedArray.push(this.searchArray[searchVueIndex]);
      this.searchArray.splice(searchVueIndex, 1);
    }
  }

  removeVue(vueAddedId:string){
    const vueAddedIndex = this.vueAddedArray.findIndex(vueAdded => vueAdded.id === vueAddedId);
    if (vueAddedIndex > -1){
      this.vueAddedArray.splice(vueAddedIndex, 1);
      this.search(this.searchInput.nativeElement.value);
    }
  }

  submitDiscovery(){
    this.discoverySubmiting = true;
    const vueDiscovery:string[] = [];

    this.vueAddedArray.forEach(addedVue => vueDiscovery.push(addedVue.id));

    if (!this.editMode){
      const mutationArrgs = {
        title: this.discoveryCreateForm.get('title').value.trim(),
        vueIds: vueDiscovery
      }

      this.createNewDiscovery(mutationArrgs);
    }
    else{
      const mutationArrgs = {
        discoveryId: this.discovery.id,
        title: this.discoveryCreateForm.get('title').value.trim(),
        vueIds: vueDiscovery
      }

      this.editDiscovery(mutationArrgs);
    }

  }

  createNewDiscovery(mutationArrgs){
    this.graphqlService.graphqlMutation(DISCOVERY_PUBLISH, mutationArrgs).pipe(take(1))
    .subscribe(
      (result:any) => {
        if (result.data?.discoveryPublish?.discovery != null){
          const discovery_obj:DISCOVERY = createMyDiscoveryObj(result.data.discoveryPublish.discovery, this.availableVueArray);
          this.discoveryCreated.emit(discovery_obj);
        }
        else{
          this.discoverySubmiting = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
      },
      error => {
        this.discoverySubmiting = false;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    );
  }

  editDiscovery(mutationArrgs){
    this.graphqlService.graphqlMutation(DISCOVERY_EDIT, mutationArrgs).pipe(take(1))
    .subscribe(
      (result:any) => {
        if (result.data?.discoveryEdit?.discovery != null){
          const discovery_obj:DISCOVERY = createMyDiscoveryObj(result.data.discoveryEdit.discovery, this.availableVueArray);

          this.discovery.id = discovery_obj.id;
          this.discovery.title = discovery_obj.title;
          this.discovery.vue_images = discovery_obj.vue_images;
          this.discovery.vues = discovery_obj.vues;
          this.discovery.last_updated = discovery_obj.last_updated;

          this.discoveryEdited.emit();
        }
        else{
          this.discoverySubmiting = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
      },
      error => {
        this.discoverySubmiting = false;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    );
  }

  ngOnDestroy(){
    if (this.search$) this.search$.unsubscribe();
  }

}
