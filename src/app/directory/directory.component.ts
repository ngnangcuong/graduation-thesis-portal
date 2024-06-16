import { Component, EventEmitter, Output, computed, effect, input, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasComponent } from '../canvas/canvas.component';
import { UserServiceService } from '../user-service.service';
import { debounceTime, switchMap } from 'rxjs';
import GetUserResponse from '../../models/user/getUserResponse';
import { GroupServiceService } from '../group-service.service';
import GetConversationResponse from '../../models/group/getConversationResponse';
import CreateConversationRequest from '../../models/group/createConversationRequest';
import CreateConversationResponse from '../../models/group/createConversationResponse';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CanvasComponent],
  templateUrl: './directory.component.html',
  styleUrl: './directory.component.css'
})
export class DirectoryComponent {
  userInfo = signal<GetUserResponse>(JSON.parse(localStorage.getItem("user_info")!));
  searchFormControl = new FormControl('');
  result:GetUserResponse[] = [];
  page = signal(1);
  limit = signal(25);
  maxPage = signal(100);
  searchMode = signal("user");
  offset = computed(() => {
    const page = this.page();
    const limit = this.limit();
    return (page - 1) * limit;
  })

  @Output()
  liveChat = new EventEmitter<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }>();

  @Output()
  addNewConversation = new EventEmitter<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }>()

  constructor(public userService:UserServiceService,
              public groupService:GroupServiceService,
  ) {
    this.searchFormControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.userService.getAllUser(this.userInfo()?.id!, value!, this.limit(), this.offset()))
    ).subscribe(
      (val) => {
        const result:GetUserResponse[] = val.result as GetUserResponse[];
        this.result = result;
      }
    )

    effect(() => {
      const page = this.page();
      const limit = this.limit();
      this.userService.getAllUser(this.userInfo()?.id!, this.searchFormControl.value!, limit, this.offset()).subscribe(
        (val) => {
          const result:GetUserResponse[] = val.result as GetUserResponse[];
          this.result = result;
        },
        (err) => {
          console.log("[getAllUser]", err);
        }
      )
    })
  }
  searchChannels() {
    this.searchMode.set("channel");
  }

  searchUsers() {
    this.searchMode.set("user");
  }

  changeLimit(limit:number) {
    this.limit.set(limit);
  }

  changePage(page:number) {
    if (page <= 0 || page > this.maxPage()) return;
    this.page.set(page);
  }

  switchToLiveChat(user:GetUserResponse) {
    var conversationID = "";
    this.groupService.getDirectedConversation(localStorage.getItem("access_token")!, user.id).subscribe(
      (val) => {
        const result:string = val.result as string;
        if (result) {
          conversationID = result;
          this.liveChat.emit({
            conversationID: conversationID,
            conversationName: user.username,
            conversationAvatar: user.avatar
          });
        }
      },
      (err) => {
        console.log("[getDirectedConversation]", err);
        const createConversationRequest:CreateConversationRequest = {
          members: [this.userInfo().id, user.id],
        }
        this.groupService.createConversation(this.userInfo().id, createConversationRequest).subscribe(
          (val) => {
            const result:CreateConversationResponse = val.result as CreateConversationResponse;
            conversationID = result.id;
            this.liveChat.emit({
              conversationID: conversationID,
              conversationName: user.username,
              conversationAvatar: user.avatar
            });
            this.addNewConversation.emit({
              conversationID: conversationID,
              conversationName: user.username,
              conversationAvatar: user.avatar
            });
          }
        )
      }
    )    
  }
}
