import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { DISCOVERY, LINK_PREVIEW } from 'src/app/_helpers/constents';
import { AppDataShareService } from 'src/app/_services/app-data-share.service';

export interface modeType{
  start?:boolean,
  create?:boolean,
  view?:boolean,
  detailedView?:boolean
}

@Component({
  selector: 'app-discovery',
  templateUrl: './discovery.component.html',
  styleUrls: ['./discovery.component.scss']
})
export class DiscoveryComponent implements OnInit {

  constructor(
    private appDataShareService:AppDataShareService
    ) { }

  @ViewChild('carousel', {read: DragScrollComponent}) carousel: DragScrollComponent;
  @Input() editMode = true;
  @Input() studentDiscoveryArray:DISCOVERY[] = [];
  @Output() openDetailedVue = new EventEmitter();

  publicVueArray:LINK_PREVIEW[] = [];
  discoveryArray:DISCOVERY[] = [];

  currentDiscoveryOnDisplay:DISCOVERY = null;

  mode:modeType = {
    start: false,
    create: false,
    view: false,
    detailedView: false
  }

  createDiscoveryInputs = {
    editMode: false,
    discovery: null,
    publicVueArray: null
  }

  expanded = false;

  ngOnInit(): void {
    this.onInit();
  }

  onInit(){
    this.publicVueArray = [];
    this.discoveryArray = [];
    this.expanded = false;

    if (this.editMode){
      this.discoveryArray = this.appDataShareService.myDiscoveryArray;
      const discoveryVueId = [];

      
      this.discoveryArray.forEach(discovery => {
        discovery.vues.forEach(discoveryVues => {
          discoveryVueId.push(discoveryVues.vue_id);
        });
      });

      this.appDataShareService.myVueArray.forEach(element => {
        if (!discoveryVueId.includes(element.id)){
          this.publicVueArray.push(element);
        }
      });


      if (this.discoveryArray.length > 0){
        this.modeChange({view:true});
      }
      else{
        this.modeChange({start:true});
      }
    }
    else{
      this.discoveryArray = this.studentDiscoveryArray;

      if (this.discoveryArray.length > 0){
        this.modeChange({view:true});
      }
    }
  }

  modeChange(parems:modeType){
    if (parems.start){
      this.mode = {
        start: true,
        create: false,
        view: false,
        detailedView: false
      }
    }
    else if (parems.create){
      this.mode = {
        start: false,
        create: true,
        view: false,
        detailedView: false
      }
    }
    else if (parems.view){
      this.mode = {
        start: false,
        create: false,
        view: true,
        detailedView: false
      }
    }
    else if (parems.detailedView){
      this.mode = {
        start: false,
        create: false,
        view: false,
        detailedView: true
      }
    }
  }

  createDiscovery(){
    this.createDiscoveryInputs = {
      editMode: false,
      discovery: null,
      publicVueArray: this.publicVueArray
    }

    this.modeChange({create:true});
  }

  discoveryCreated(discovery:DISCOVERY){
    this.appDataShareService.myDiscoveryArray.unshift(discovery);
    this.onInit();
  }

  createDiscoveryClose(){
    if (this.discoveryArray.length > 0){
      this.modeChange({view:true});
    }
    else{
      this.modeChange({start:true});
    }

    this.expanded = false;
  }

  displayDiscovery(discovery:DISCOVERY){
    this.currentDiscoveryOnDisplay = discovery;
    this.modeChange({detailedView:true});
  }

  displayDiscoveryClose(){
    this.currentDiscoveryOnDisplay = null;
    this.modeChange({view:true});
    this.expanded = false;
  }

  editDisplayDiscovery(){
    if (this.currentDiscoveryOnDisplay != null){
      this.createDiscoveryInputs = {
        editMode: true,
        discovery: this.currentDiscoveryOnDisplay,
        publicVueArray: this.publicVueArray
      }

      this.modeChange({create:true});
      this.expanded = false;
    }
  }

  deleteDiscovery(){
    if (this.currentDiscoveryOnDisplay != null){
      const myDiscoveryIndex = this.appDataShareService.myDiscoveryArray.findIndex(
        discovery => discovery.id === this.currentDiscoveryOnDisplay.id
      );

      if (myDiscoveryIndex > -1){
        this.appDataShareService.myDiscoveryArray.splice(myDiscoveryIndex, 1);
      }

      this.currentDiscoveryOnDisplay = null;
      this.onInit();
    }
  }

}
