import { Component, OnInit, signal } from '@angular/core';
import { ConversationComponent } from '../conversation/conversation.component';
import { Util } from '../../models/util';
import { OptionComponent } from '../option/option.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [ConversationComponent, OptionComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit{

  utils:Util[] = [
    {
      name: "Home",
      display: "carbon--home",
    }, {
      name: "Search",
      display: "carbon--search",
    }, {
      name: "Directory",
      display: "ph--notebook-light",
    }, {
      name: "Display",
      display: "octicon--sort-desc-24",
    }, {
      name: "Adminstration",
      display: "pepicons-pencil--dots-y",
    }
  ];
  conversationTypeList:string[] = ["Channels", "Conversations"];
  conversationListPerType:Map<string, string[]> = new Map<string, string[]>()

  currentShowOption = signal(-1);

  constructor() {

  }

  ngOnInit(): void {
    this.conversationTypeList.forEach((type) => {
      const conversation = [];
      for (let i = 0; i < 10; i++) {
        // this.conversationListPerType.set(type, ["ngnangcuong"])
        conversation?.push("ngnangcuong");
      }
      this.conversationListPerType.set(type, conversation);
    })
  }

  showOptions(index:number) {
    console.log("Here");
    this.currentShowOption.update(() => index);
  }
}
