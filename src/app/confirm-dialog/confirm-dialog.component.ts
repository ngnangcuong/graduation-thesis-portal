import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  @Output()
  cancelOutput = new EventEmitter<boolean>();

  @Output()
  confirmOutput = new EventEmitter<boolean>();

  cancel() {
    this.cancelOutput.emit(true);
  } 

  confirm() {
    this.confirmOutput.emit(true);
  }
}
