import { Component, EventEmitter, OnInit, Output, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.css'
})
export class NotificationDialogComponent implements OnInit{
  mode = input<string>();
  privateKeyFormControl = new FormControl('')

  constructor() {
    
  }
  ngOnInit(): void {
    console.log("[mode]", this.mode());
    if (this.mode() != "not_first_time") {
      this.privateKeyFormControl.setValue(this.mode()!);
    }
  }

  @Output()
  userPrivateKey = new EventEmitter<string>();

  handleOnClick() {
    const privateKey = this.privateKeyFormControl.getRawValue();
    if (privateKey != "") {
      this.userPrivateKey.emit(privateKey!);
    }
  }
}
