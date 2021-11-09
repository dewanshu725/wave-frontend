import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxMasonryOptions } from 'ngx-masonry';
import { take } from 'rxjs/operators';
import { DISCOVERY } from 'src/app/_helpers/constents';
import { DISCOVERY_DELETE } from 'src/app/_helpers/graphql.query';
import { GraphqlService } from 'src/app/_services/graphql.service';

@Component({
  selector: 'app-display-discovery',
  templateUrl: './display-discovery.component.html',
  styleUrls: ['./display-discovery.component.scss']
})
export class DisplayDiscoveryComponent implements OnInit {

  constructor(
    private graphqlService:GraphqlService,
    private snackBar: MatSnackBar
    ) { }

  @Input() editMode:boolean;
  @Input() discovery:DISCOVERY;

  @Output() goBack = new EventEmitter();
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() openDetailedVue = new EventEmitter();

  discoveryDeleting = false;

  masonryOption: NgxMasonryOptions = {
    gutter: 30,
    horizontalOrder: true,
    columnWidth: 260,
    fitWidth: true
  };

  ngOnInit(): void {
  }

  deleteDiscovery(){
    this.discoveryDeleting = true;
    this.graphqlService.graphqlMutation(DISCOVERY_DELETE, {discoveryId: this.discovery.id}).pipe(take(1))
    .subscribe(
      (result:any) => {
        if (result.data?.discoveryDelete?.result == true){
          this.delete.emit();
        }
        else{
          this.discoveryDeleting = false;
          this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
        }
      },
      error => {
        this.discoveryDeleting = false;
        this.snackBar.open("something went Wrong!", "Try Again", {duration:2000});
      }
    );
  }

}
