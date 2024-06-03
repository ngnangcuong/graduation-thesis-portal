import { Component, EventEmitter, Input, Output } from '@angular/core';
import GetUserResponse from '../../models/user/getUserResponse';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @Input()
  detail!:string;

  @Input()
  action!:string;

  @Input()
  confirmCallback!:(context:any) => boolean;

  @Input()
  confirmContext!:any;

  @Output()
  cancelOutput = new EventEmitter<boolean>();

  @Output()
  confirmOutput = new EventEmitter<boolean>();

  @Output()
  removeConversation = new EventEmitter<{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
    type:string;
  }>();

  @Output()
  userAdd = new EventEmitter<GetUserResponse>();

  @Output()
  userRemove = new EventEmitter<{
    userID:string;
    username:string;
    email:string;
    avatar:string;}>()

  cancel() {
    this.cancelOutput.emit(true);
  } 

  confirm() {
    console.log(this.confirmContext);
    const result = this.confirmCallback(this.confirmContext);
    this.confirmOutput.emit(result);
    if (result) {
      if (this.confirmContext.removeConversation) {
        this.removeConversation.emit(this.confirmContext.removeConversation);
      }
      if (this.confirmContext.userAdd) {
        this.userAdd.emit(this.confirmContext.userAdd);
      }
      if (this.confirmContext.userRemove) {
        this.userRemove.emit(this.confirmContext.userRemove)
      }
    }
  }
}
