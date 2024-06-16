import { Component, ElementRef, EventEmitter, Output, signal, HostListener, ViewChild, input, OnInit, effect } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { UserServiceService } from '../user-service.service';
import { GroupServiceService } from '../group-service.service';
import GetUserResponse from '../../models/user/getUserResponse';
import GetConversationResponse from '../../models/group/getConversationResponse';
import GetGroupResponse from '../../models/group/getGroupResponse';
import UpdateGroupRequest from '../../models/group/updateGroupRequest';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CanvasComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent implements OnInit{
  searchUserFormControl = new FormControl('');
  userAdd = input<GetUserResponse>();
  userRemove = input<{
    userID:string;
    username:string;
    email:string;
    avatar:string;
  }>();
  result = signal<GetUserResponse[]>([]);
  conversationID = input<string>();
  groupID = "";
  isAdmin = false;
  userInfo = signal<GetUserResponse>(JSON.parse(localStorage.getItem("user_info")!));
  conversationMembers = signal<{
    userID:string;
    username:string;
    email:string;
    avatar:string;
  }[]>([]);
  isShowOptions = signal<boolean>(false);
  display = signal<string>("MembersInfo")

  @Output()
  cancel = new EventEmitter<boolean>();

  @Output()
  needToConfirm = new EventEmitter<{
    action: string;
    detail: string;
  }>();

  @Output()
  confirmCallback = new EventEmitter<(context:any) => boolean>();

  @Output()
  confirmContext = new EventEmitter<Object>();

  @ViewChild("membersInfo", {read:ElementRef})
  membersInfoComponent!:ElementRef;

  @ViewChild("addUser", {read: ElementRef})
  addUserComponent!:ElementRef;

  constructor(public userService:UserServiceService,
              public groupService:GroupServiceService
  ) {
    effect(() => {
      const userAdd = this.userAdd();
      const userRemove = this.userRemove();
      if (userAdd?.id != "") {
        this.conversationMembers.update(val => [...val, {
          userID: userAdd?.id!,
          username: userAdd?.username!,
          email: userAdd?.email!,
          avatar: userAdd?.avatar!,
        }])
      }
      if (userRemove?.userID != "") {
        this.conversationMembers.update(val => val.filter(member => member.userID != userRemove?.userID))
      }
    }, {allowSignalWrites: true});
    this.userService.getAllUser(this.userInfo().id, "", 100, 0).subscribe(
      (val) => {
        const result:GetUserResponse[] = val.result as GetUserResponse[];
        this.result.set(result);
      }
    )
    this.searchUserFormControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.userService.getAllUser(this.userInfo().id, value!, 100, 0))
    ).subscribe(
      (val) => {
        const result:GetUserResponse[] = val.result as GetUserResponse[];
        this.result.set(result);
      }
    )
  }

  ngOnInit(): void {
    this.groupService.getConversation(this.userInfo()?.id!, this.conversationID()!).subscribe(
      (val) => {
        const result:GetConversationResponse = val.result as GetConversationResponse;
        result.members.forEach((member) => {
          this.userService.getUser(this.userInfo()?.id!, member).subscribe(
            (val) => {
              const user:GetUserResponse = val.result as GetUserResponse;
              this.conversationMembers.update((val) => [...val, {
                userID: member,
                username: user.username,
                email: user.email,
                avatar: user.avatar
              }])
            },
            (err) => {
              console.log("[getUser]", err);
            }
          )
        })
      },
      (err) => {
        console.log("[getConversation]", err);
      }
    )
    this.groupService.getGroup(localStorage.getItem("access_token")!, "", "", this.conversationID()!).subscribe(
      val => {
        const result:GetGroupResponse = val.result as GetGroupResponse;
        this.groupID = result.id;
        result.admins.forEach((admin) => {
          if (admin == this.userInfo()?.id!) {
            this.isAdmin = true;
          }
        })
      }
    )
  }

  onCancel() {
    this.cancel.emit(true);
  }

  removeUser(userID:string) {
    this.conversationMembers().forEach(user => {
      if (user.userID == userID) {
        this.confirmContext.emit({
          groupService: this.groupService,
          groupID: this.groupID, 
          userID: userID, 
          authToken: localStorage.getItem("access_token"),
          userRemove: user});
      }
    });
    this.confirmCallback.emit((context:any) => {
      var isSuccess = true;
      const updateGroupRequest:UpdateGroupRequest = {
        group_name: "",
        members: [{
          action: "remove",
          users: [context.userID],
        }]
      }
      context.groupService.updateGroup(context.authToken, context.groupID, updateGroupRequest).subscribe(
        () => {
          console.log("Success");
        },
        (err:any) => {
          console.log("[updateGroup]", err);
          isSuccess = false
        }
      )
      return isSuccess;
    });
    this.needToConfirm.emit({
      action: "Remove",
      detail: "remove this user"
    });
  } 
  addNewUser(userID:string) {
    this.result().forEach(user => {
      if (user.id == userID) {
         
        this.confirmContext.emit({
          groupService: this.groupService,
          groupID: this.groupID, 
          userID: userID, 
          authToken: localStorage.getItem("access_token"),
          userAdd: user});
      }
    })
    this.confirmCallback.emit((context:any) => {
      var isSuccess = true;
      const updateGroupRequest:UpdateGroupRequest = {
        group_name: "",
        members: [{
          action: "add",
          users: [context.userID],
        }]
      }
      context.groupService.updateGroup(context.authToken, context.groupID, updateGroupRequest).subscribe(
        () => {
          console.log("Success");
        },
        (err:any) => {
          console.log("[updateGroup]", err);
          isSuccess = false;
        }
      )
      return isSuccess;
    });

    this.needToConfirm.emit({
      action: "Add",
      detail: "add this user"
    });
  }

  confirmRemoveUser(userID:string) {
    this.conversationMembers.update(val => val.filter(m => m.userID != userID));
  }

  switchToAddUser() {
    this.display.set("AddUser");
  }

  backToMembersInfo() {
    this.display.set("MembersInfo");
  }
}
