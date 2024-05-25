import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-option',
  standalone: true,
  imports: [],
  templateUrl: './option.component.html',
  styleUrl: './option.component.css'
})
export class OptionComponent {
  @Input()
  display!:string;

  @Input()
  name!:string;

  @Input()
  direction!:string;
}
