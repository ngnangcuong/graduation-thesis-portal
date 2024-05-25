import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Signal, ViewChild, computed, effect, input, signal } from '@angular/core';
import { Util } from '../../models/util';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css'
})
export class ConversationComponent implements OnInit, AfterViewInit{
  @Input()
  name!:string;

  @Input()
  index!:number;

  isShowOptions = signal(false);
  

  @Output()
  needToShowOptions = new EventEmitter<number>();

  options:Util[] = [
    {
      name: "Hide",
      display: "clarity--eye-hide-line",
    }, 
    {
      name: "Mark Unread",
      display: "carbon--flag",
    }, 
    {
      name: "Favorite",
      display: "material-symbols-light--star-outline"
    }, 
    {
      name: "Leave",
      display: "pepicons-pencil--leave",
    }
  ];

  @ViewChild("conversationOptions", {read: ElementRef})
  conversationOptions!:ElementRef;

  @ViewChild("conversationOptionIcon", {read: ElementRef})
  conversationOptionIcon!:ElementRef;

  @ViewChild("conversationOption", {read: ElementRef})
  conversationOption!:ElementRef;

  constructor() {
    
  }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
  }

  showOptions() {
      this.isShowOptions.update(val => !val);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.isShowOptions() && !this.conversationOptions.nativeElement.contains(event.target as Node)) {
      this.isShowOptions.update(() => false);
    }
  }
}
