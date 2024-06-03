import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Signal, ViewChild, computed, effect, input, signal } from '@angular/core';
import { Util } from '../../models/util';
import { CanvasComponent } from '../canvas/canvas.component';
import { UserServiceService } from '../user-service.service';
import { GroupServiceService } from '../group-service.service';
import GetConversationResponse from '../../models/group/getConversationResponse';
import GetUserResponse from '../../models/user/getUserResponse';
import GetGroupResponse from '../../models/group/getGroupResponse';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CanvasComponent],
  providers: [],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css'
})
export class ConversationComponent implements OnInit, AfterViewInit{
  userInfo = signal<GetUserResponse>(JSON.parse(localStorage.getItem("user_info")!));;
  name = input<string>("");
  conversationID = input<string>();
  conversationName = signal<string>("");
  conversationAvatar = signal<string>("");
  groupID = signal<string>("");

  @Input()
  isDirected!:boolean;
  currentConversation = input<string>();

  @Output()
  notifyConversationName = new EventEmitter<{
    conversationID:string;
    conversationName:string;
    conversationAvatar:string;
  }>();

  @Output()
  needToShow = new EventEmitter<string>();

  isShowOptions = signal(false);
  
  @Output()
  confirmLeaveGroup = new EventEmitter<{
    action: string;
    detail: string;
  }>();

  @Output()
  needToShowOptions = new EventEmitter<number>();

  @Output()
  confirmCallback = new EventEmitter<(context:any) => boolean>();

  @Output()
  confirmContext = new EventEmitter<Object>();

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

  constructor(public userService:UserServiceService,
              public groupService:GroupServiceService
  ) {
    effect(() => {
      
    
    })
  }

  ngOnInit(): void {
    setTimeout(() => {
      
      const isDirected:boolean = this.isDirected!;
        if (this.name() != "") {
          this.conversationName.set(this.name()!);
          this.notifyConversationName.emit({
            conversationID: this.conversationID()!,
            conversationName: this.conversationName(),
            conversationAvatar: this.conversationAvatar()
          });
        } 
        if(isDirected && this.name() == "") {
          console.log("Here");
          this.groupService.getConversation(this.userInfo().id, this.conversationID()!).subscribe(
            (val) => {
              const result:GetConversationResponse = val.result as GetConversationResponse;
              result.members.forEach((member) => {
                if (member != this.userInfo()?.id!) {
                  this.userService.getUser(this.userInfo().id, member).subscribe(
                    (val) => {
                      const userInfo:GetUserResponse = val.result as GetUserResponse;
                      this.conversationName.set(userInfo.username);
                      this.conversationAvatar.set(userInfo.avatar);
                      this.notifyConversationName.emit({
                        conversationID: this.conversationID()!,
                        conversationName: this.conversationName(),
                        conversationAvatar: this.conversationAvatar()
                      });
                    },
                    (err) => {
                      console.log("[getUser]", err);
                    }
                  )
                }
              }) 
            },
            (err) => {
              console.log("[getConversation]", err);
            }
          );
        } 
        if(!isDirected && this.name() == "") {
          this.groupService.getGroup(this.userInfo().id, "", "", this.conversationID()!).subscribe(
            (val) => {
              const result:GetGroupResponse = val.result as GetGroupResponse;
              console.log(result);
              this.conversationName.set(result.group_name);
              this.conversationAvatar.set("#1abc9c");
              this.groupID.set(result.id);
              this.notifyConversationName.emit({
                conversationID: this.conversationID()!,
                conversationName: this.conversationName(),
                conversationAvatar: this.conversationAvatar()
              });
            },
            (err) => {
              console.log("[getGroup]", err);
            }
          )
        }
    }, 1);
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

  showConversation() {
    this.needToShow.emit(this.conversationID());
  }

  toConfirmLeaveGroup(option:string) {
    if (option == 'Leave') {
      this.confirmLeaveGroup.emit({
        action: "Leave",
        detail: "leave this group",
      });
      this.confirmContext.emit({
        groupService: this.groupService,
        userID: this.userInfo().id,
        groupID: this.groupID(),
        removeConversation: {
          conversationID: this.conversationID(),
          conversationName: this.conversationName(),
          conversationAvatar: this.conversationAvatar(),
          type: "channel",
        }
      })
      this.confirmCallback.emit((context:any) => {
        console.log("Leave group here");
        var isSuccess = true;
        context.groupService.leaveGroup(context.userID, context.groupID).subscribe(
          () => {

          },
          (err:any) => {
            console.log("[leaveGroup]", err);
            isSuccess = false;
          }
        );
        return isSuccess;
      })
    }
  }
}
