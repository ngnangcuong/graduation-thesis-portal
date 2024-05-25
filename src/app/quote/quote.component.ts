import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.css'
})
export class QuoteComponent {
  @Input()
  content!:string;

  @Input()
  displayCancel = true;

  @Output()
  cancel = new EventEmitter<boolean>();

  onCancel() {
    this.cancel.emit(true);
  }
}
