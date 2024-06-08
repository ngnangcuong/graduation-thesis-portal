import { Component, EventEmitter, OnInit, Output, signal, HostListener, ViewChild, ElementRef, input, effect, ChangeDetectorRef } from '@angular/core';
import { ConversationComponent } from '../conversation/conversation.component';
import { Util } from '../../models/util';
import { OptionComponent } from '../option/option.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasComponent } from '../canvas/canvas.component';
import { UserServiceService } from '../user-service.service';
import { GroupServiceService } from '../group-service.service';
import GetUserResponse from '../../models/user/getUserResponse';
import GetConversationContainUserResponse from '../../models/group/getConversationContainUserResponse';
import GetConversationResponse from '../../models/group/getConversationResponse';
import GetGroupResponse from '../../models/group/getGroupResponse';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import Message from '../../models/message';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [ConversationComponent, OptionComponent, FormsModule, ReactiveFormsModule, CanvasComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit{
  newConversation = input<{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
    type: string;
  }>();
  removeConversation = input<{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
    type: string;
  }>();
  searchMode = signal<boolean>(false);
  searchConversationFormControl = new FormControl('');
  searchConversationTerms$ = new Subject<string>();
  userInfo = signal<GetUserResponse>(JSON.parse(localStorage.getItem("user_info")!));
  authToken = input<string>();
  messageToReceive = input<Message>();
  @Output()
  isCreateGroup = new EventEmitter<boolean>();

  @Output()
  conversation = new EventEmitter<{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
  }>();
  currentConversation = signal<string>("");

  @Output()
  needToConfirmLeaveGroup = new EventEmitter<{
    action: string;
    detail: string;
  }>();

  @Output()
  confirmCallback = new EventEmitter<(context:any) => boolean>();

  @Output()
  confirmContext = new EventEmitter<Object>();

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
  directedConversationList = signal<string[]>([]);
  channelList = signal<string[]>([]);
  conversationList:{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
  }[] = [];
  conversationListAfterSearch:{
    conversationID:string;
    conversationName:string;
  }[] = this.conversationList;

  currentShowOption = signal(-1);

  @ViewChild('searchIcon', {read:ElementRef})
  searchIcon!:ElementRef;

  @ViewChild('searchMode', {read: ElementRef})
  searchModeDisplay!:ElementRef;

  constructor(public userService:UserServiceService,
              public groupService:GroupServiceService,
              private cdr:ChangeDetectorRef
  ) {
    effect(() => {
      const newConversation = this.newConversation();
      const removeConversation = this.removeConversation();
      console.log("New Conversation arrived:", newConversation);
      console.log("Remove Existed Conversation", removeConversation);
      if (newConversation?.conversationID != "") {
        this.addNewConversation(newConversation!);
      }
      if (removeConversation?.conversationID != "") {
        this.removeExistedConversation(removeConversation!);
      }
    }, {allowSignalWrites: true})
    
    effect(() => {
      const newMessage:Message = this.messageToReceive()!;
      const existedConversation = this.conversationList.filter(value => value.conversationID == newMessage.conv_id);
      if (existedConversation.length == 0) {
        if (newMessage.receiver != "") {
          this.directedConversationList.update(val => [...val, newMessage.conv_id]);
        } else {
          this.channelList.update(val => [...val, newMessage.conv_id]);
        }
      }
    })
  }

  addNewConversation(newConversation:{conversationID:string;
    conversationName:string;
    conversationAvatar:string;
    type: string;}) {
      this.conversationList.push(newConversation as {conversationID:string;
        conversationName:string;
        conversationAvatar:string;});
      if (newConversation?.type == "conversation") {
        this.directedConversationList.update(val => [...val, newConversation.conversationID]);
      } else if (newConversation?.type == "channel") {
        this.channelList.update(val => [...val, newConversation.conversationID]);
      }
    }
  
  removeExistedConversation(removeConversation:{conversationID:string;
    conversationName:string;
    conversationAvatar:string;
    type: string;}) {
      this.conversationList = this.conversationList.filter(conversation => conversation.conversationID != removeConversation.conversationID);
      if (removeConversation?.type == "conversation") {
        this.directedConversationList.update(val => val.filter(conversationID => conversationID != removeConversation.conversationID));
      } else if (removeConversation?.type == "channel") {
        this.channelList.update(val => val.filter(conversationID => conversationID != removeConversation.conversationID));
      }
    }

  ngOnInit(): void {
    var conversations!:GetConversationContainUserResponse[];
    
    this.groupService.getConversationContainUser(this.userInfo()?.id!).subscribe(
      (val) => {
        conversations = val.result as GetConversationContainUserResponse[];
        this.classifyConversation(conversations);
      },
      (err) => {
        console.log(err)
      }
    );
    console.log(this.directedConversationList, this.channelList);

    this.searchConversationTerms$.pipe(
      debounceTime(300), // Chờ 300ms sau khi người dùng dừng gõ
      distinctUntilChanged(),
      map(term => term?.toLowerCase()),  
    ).subscribe(terms => {
      console.log(this.conversationList);
      this.conversationListAfterSearch = this.conversationList.filter(item => 
        item.conversationName.toLowerCase().includes(terms)
      );
    });

    this.searchConversationFormControl.valueChanges.subscribe(value => {
      this.searchConversationTerms$.next(value!);
    });
  }

  classifyConversation(conversations:GetConversationContainUserResponse[]) {
    // console.log(conversations);
    var directedConversationList:string[] = [];
    var channelList:string[] = [];
    conversations.forEach((conversation) => {
      if (conversation.member_count <= 2) {
        directedConversationList.push(conversation.conv_id);
      } else {
        channelList.push(conversation.conv_id);
      }
    });
    this.directedConversationList.set(directedConversationList);
    this.channelList.set(channelList)
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
    this.searchConversationFormControl.setValue('');
    this.conversationListAfterSearch = this.conversationList;
    this.searchMode.set(false);
    event.stopPropagation();
  }

  showConversation(conversationID:string) {
    console.log("Navigation:", conversationID);
    this.currentConversation.set(conversationID);
    this.conversationList.forEach((conversation) => {
      if (conversation.conversationID == conversationID) {
        this.conversation.emit({
          conversationID: conversationID,
          conversationName: conversation.conversationName,
          conversationAvatar: conversation.conversationAvatar,
        });
      }
    })
    if (this.searchMode()) {
      this.searchMode.set(false);
      this.searchConversationFormControl.setValue('');
      this.conversationListAfterSearch = this.conversationList;
    }
  }

  getConversationNameFrom(info:{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
  }) {
    console.log(info);
    var isExisted = false;
    this.conversationList.forEach((conversation) => {
      if (conversation.conversationID == info.conversationID) {
        isExisted = true;
      }
    })
    if (isExisted) {
      return;
    }
    this.conversationList.push({
      conversationID: info.conversationID,
      conversationName: info.conversationName,
      conversationAvatar: info.conversationAvatar,
    })
  }

  confirmLeaveGroup(confirm:{
    action: string;
    detail: string;
  }) {
    console.log("confirm to Leave Group navigation", confirm);
    this.needToConfirmLeaveGroup.emit(confirm);
  }

  forwardConfirmCallback(callback:(context:any) => boolean) {
    this.confirmCallback.emit(callback);
  }

  forwardConfirmContext(context:any) {
    console.log(context);
    this.confirmContext.emit(context);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.searchMode() && !this.searchModeDisplay.nativeElement.contains(event.target as Node)) {
      this.searchMode.update(() => false);
      this.searchConversationFormControl.reset();
      this.conversationListAfterSearch = this.conversationList;
    }
  }

  switchToDirectory() {
    this.isDirectory.emit(true);
  }
}
