import { Component, EventEmitter, OnInit, Output, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ConversationComponent } from '../conversation/conversation.component';
import { Util } from '../../models/util';
import { OptionComponent } from '../option/option.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [ConversationComponent, OptionComponent, FormsModule, ReactiveFormsModule, CanvasComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit{
  searchMode = signal<boolean>(false);
  formControl = new FormControl('')
  @Output()
  isCreateGroup = new EventEmitter<boolean>();

  @Output()
  conversation = new EventEmitter<string>();
  currentConversation = signal<string>("");

  @Output()
  needToConfirmLeaveGroup = new EventEmitter<string>();

  @Output()
  isDirectory = new EventEmitter<boolean>();

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

  @ViewChild('searchIcon', {read:ElementRef})
  searchIcon!:ElementRef;

  @ViewChild('searchMode', {read: ElementRef})
  searchModeDisplay!:ElementRef;

  constructor() {

  }

  ngOnInit(): void {
    this.conversationTypeList.forEach((type) => {
      const conversation = [];
      for (let i = 0; i < 10; i++) {
        // this.conversationListPerType.set(type, ["ngnangcuong"])
        conversation?.push("ngnangcuong" + i);
      }
      this.conversationListPerType.set(type, conversation);
    })
  }

  showOptions(index:number) {
    console.log("Here");
    this.currentShowOption.update(() => index);
  }

  switchAddNewChannel() {
    this.isCreateGroup.emit(true);
  }

  switchSearchMode(event:Event) {
    console.log("Search mode");
    this.searchMode.set(true);
    event.stopPropagation();
  }

  switchDefaultMode(event:Event) {
    this.searchMode.set(false);
    event.stopPropagation();
  }

  showConversation(conversationID:string) {
    console.log("Navigation:", conversationID);
    this.currentConversation.set(conversationID);
    this.conversation.emit(conversationID);
    if (this.searchMode()) {
      this.searchMode.set(false);
    }
  }

  confirmLeaveGroup(conversationID:string) {
    console.log("confirm to Leave Group navigation", conversationID);
    this.needToConfirmLeaveGroup.emit(conversationID);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.searchMode() && !this.searchModeDisplay.nativeElement.contains(event.target as Node)) {
      this.searchMode.update(() => false);
      console.log(this.searchIcon);
    }
  }

  switchToDirectory() {
    this.isDirectory.emit(true);
  }

  // this.searchControl.valueChanges.pipe(
//   debounceTime(300),  // Chờ 300ms sau khi người dùng dừng gõ
//   switchMap(value => this.searchService.search(value))  // Thực hiện tìm kiếm
// ).subscribe(results => {
//   this.results = results;  // Cập nhật kết quả tìm kiếm
// });
}
