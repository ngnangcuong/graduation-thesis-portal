import { Component, Input, OnInit, signal, effect, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { OptionComponent } from '../option/option.component';
import { QuoteComponent } from '../quote/quote.component';
import Reaction from '../../models/reaction';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [PickerComponent, OptionComponent, QuoteComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
  @Input()
  message: string = "";

  @Input()
  quoteContent: string = "";

  @Input()
  reactionList = signal<Reaction[]>([]);

  isShowReaction = signal<boolean>(false)

  @ViewChild("emoji", {read: ElementRef})
  emojiMartComponent!:ElementRef;

  @ViewChild("add_reaction", {read: ElementRef})
  addReactionElement!:ElementRef;

  @Output()
  quote = new EventEmitter<string>();
  
  constructor() {
  }

  ngOnInit(): void {
  }

  showReactionOptions() {
    this.isShowReaction.update((val) => !val);
  }

  addEmoji(event:any) {
    // event {emoji, event}
    this.isShowReaction.update(() => false);
    console.log(event);
    const display = event.emoji.native;
    this.reactionList.update((list) => {
      for (let i in list) {
        if (list[i].display == display) {
          list[i].users.push("ngnangcuong");
          return list
        }
      }
      list.push({
        display: display,
        users: ["ngnangcuong"]
      })
      return list
    })
  }

  addQuote() {
    this.quote.emit(this.message);
  }

  showReactionDetail(reaction:Reaction): string {
    const postfix = `reacted`;
    if (reaction.users.length == 1) {
      return `${reaction.users[0]} ${postfix}`
    }
    if (reaction.users.length <= 3) {
      var users = reaction.users.join(", ");
      return `${users}${postfix}`
    }
    const representation = reaction.users.filter((value, index, users) => index < 3).join(", ");
    return `${representation}and another ${reaction.users.length - 3} users ${postfix}`
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.isShowReaction() && 
      !this.addReactionElement.nativeElement.contains(event.target as Node) &&
      !this.emojiMartComponent.nativeElement.contains(event.target as Node)) {
      console.log(this.emojiMartComponent);
      this.isShowReaction.update(() => false);
    }
  }
}
