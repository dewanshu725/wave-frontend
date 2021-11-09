import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NOTIFY_DATA } from 'src/app/_helpers/constents';

@Component({
  selector: 'app-notify-box',
  templateUrl: './notify-box.component.html',
  styleUrls: ['./notify-box.component.scss']
})
export class NotifyBoxComponent implements OnInit {

  constructor() { }
  @Input() notifyData:NOTIFY_DATA;

  @Output() response = new EventEmitter();


  ngOnInit(): void {
  }

  
}
