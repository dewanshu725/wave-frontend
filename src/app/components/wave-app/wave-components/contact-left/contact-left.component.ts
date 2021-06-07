import { STUDENT_INFO_CARD_DATA } from './../../../../_helpers/constents';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact-left',
  templateUrl: './contact-left.component.html',
  styleUrls: ['./contact-left.component.scss']
})
export class ContactLeftComponent implements OnInit {

  constructor() { }

  navCircleState = false;
  navConversationState = false;
  navDraftState = false;

  data:STUDENT_INFO_CARD_DATA = {
    imgUrl:"https://worldscinema.org/wp-content/uploads/2021/05/Ai-to-shi-o-mitsumete-1964-e1621089416592.jpg",
    titleText:"Dewanshu Gautam",
    messageText:"New message is received",
    contactStatus:{
      text:"27/05/2021",
      highPriority:false
    },
    messageStatus:{
      text:"visibility",
      highPriority:true
    }
  }

  ngOnInit(): void {
  }

}
