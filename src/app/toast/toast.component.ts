import { Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  status = input<string>();
  currentStatus = signal<string>("");
  constructor() {
  }
  off() {
  }
}
