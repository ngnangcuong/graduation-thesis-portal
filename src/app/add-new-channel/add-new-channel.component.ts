import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild, input, signal } from '@angular/core';
import { EditorComponent } from '@tinymce/tinymce-angular';
import Message from '../../models/message';
import ConversationMessage from '../../models/message/conversationMessage';
import GetUserResponse from '../../models/user/getUserResponse';
import { UserServiceService } from '../user-service.service';
import { GroupServiceService } from '../group-service.service';
import { WebsocketService } from '../websocket.service';
import CreateGroupRequest from '../../models/group/createGroupRequest';
import CreateGroupResponse from '../../models/group/createGroupResponse';
import { Observable, concatMap, forkJoin } from 'rxjs';
import CustomResponse from '../../models/response';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [EditorComponent],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.css'
})
export class AddNewChannelComponent implements AfterViewInit {
  userList = signal<string[]>([]);
  messages = signal<ConversationMessage[]>([]);
  userInfo = input<GetUserResponse>();

  @ViewChild("usernameInputField", {read: ElementRef})
  usernameInputField!:ElementRef;

  @ViewChild("groupnameInputField", {read: ElementRef})
  groupnameInputField!:ElementRef;

  @Output()
  submit = new EventEmitter<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }>();

  init = {}

  constructor(private userService:UserServiceService,
              private groupService:GroupServiceService,
              private websocketService: WebsocketService
  ) {
    this.init = {
      force_br_newlines : true,
        convert_newlines_to_brs : false,
        remove_linebreaks : true,  
        height: '100%',
        plugins: 'lists link image table code emoticons autoresize',
        images_reuse_filename: true,
        automatic_uploads: true,
        images_upload_url: 'http://localhost:8081/v1/',
        file_picker_types: 'file image media',
        file_picker_callback(callback:any, value:any, meta:any) {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
  
          input.addEventListener('change', (e) => {
            let file = (<HTMLInputElement>e.target!).files![0];
  
            const reader = new FileReader();
            reader.addEventListener('load', () => {
              /*
                Note: Now we need to register the blob in TinyMCEs image blob
                registry. In the next release this part hopefully won't be
                necessary, as we are looking to handle it internally.
              */
              // const id = 'blobid' + (new Date()).getTime();
              // const blobCache =  this['editorUpload'].blobCache;
              // const result:string = reader.result as string;
              // const base64 = result.split(',')[1];
              // const blobInfo = blobCache.create(id, file, base64);
              // blobCache.add(blobInfo);
              // console.log(blobCache, blobInfo, file);
  
              // /* call the callback and populate the Title field with the file name */
              // callback(blobInfo.blobUri(), { title: file.name });
            });
            reader.readAsDataURL(file);
          });
  
          input.click();
        },
        menubar: false,
        toolbar_location: 'bottom',
        statusbar: false,
        max_height: 400,
        autoresize_bottom_margin: 0,
        placeholder: 'Enter messages ...',
        toolbar: 'bold italic underline link numlist bullist emoticons blockquote image | mySendButton ',
        setup: function(editor:any) {
          editor.ui.registry.addButton("mySendButton", {
            tooltip: "Send Message",
            icon: "send",
            onAction() { 
              editor.resetContent();
            },
            
          });
          
        },
    }
  }

  ngAfterViewInit(): void {

  }

  addUser(event:any) {
    if (!event.target.value) return;
    this.userList.update(val => [...val, event.target.value]);
    this.usernameInputField.nativeElement.value = "";
  } 

  removeUser(user:string) {
    var currentList = this.userList();
    this.userList.update(val => currentList.filter(u => u != user));
  }

  removeRedudantBr(content:string): string {
    var paragragh = content.split("<br>")
    paragragh = paragragh.filter((value) => value != '');
    const len = paragragh.length;
    if (paragragh[len-1] == "</p>") {
      paragragh[len-2] = paragragh[len-2] + paragragh[len-1];
      paragragh.pop();
    }
    if (paragragh[0] == "<p>") {
      paragragh[1] = paragragh[0] + paragragh[1];
      paragragh.shift();
    }
    return paragragh.join("<br>");
  }
  
  sendMessage(event:any) {
    const content:string = this.removeRedudantBr(
      event.editor.getContent().replaceAll("<p>&nbsp;</p>", "").replaceAll("&nbsp;", "").trim());
    if (event.event.key == "Enter" &&
    content != "<p></p>" && 
    content != "" &&
    !event.event.shiftKey) {
      var group:CreateGroupResponse = {
        conv_id: "",
        group_id: ""
      };
      const requests = this.makeUserInfoRequests();
      forkJoin(
        [...requests]
      ).subscribe((results:CustomResponse[]) => {
        var createGroupRequest:CreateGroupRequest = {
          group_name: this.groupnameInputField.nativeElement.value,
          members: [this.userInfo()?.id!]
        };
        results.forEach((val) => {
          const user:GetUserResponse = val.result as GetUserResponse;
          createGroupRequest.members.push(user.id);
        })

        this.groupService.createGroup(this.userInfo()?.id!, createGroupRequest).subscribe(
          (val) => {
            const result:CreateGroupResponse = val.result as CreateGroupResponse;
            group = result;
            this.submit.emit({
              conversationID: group.conv_id,
              conversationName: this.groupnameInputField.nativeElement.value!,
              conversationAvatar: "#1abc9c"
            });
          },
          (err) => {
            console.log(err);
          }
        );
      })
      const message:Message = {
        conv_id: group.conv_id,
        conv_msg_id: 0,
        content: content,
        sender: this.userInfo()?.id!,
        msg_time: Date.now(),
        receiver: "",
      }
      this.cancelQuote(true);
      this.messages.update((value) => [message, ...value]);
      console.log(content);
      event.editor.resetContent();
      event.event.stopPropagation();
      event.event.preventDefault();
    }

  }

  makeUserInfoRequests(): Observable<CustomResponse>[] {
    var result:Observable<CustomResponse>[] = [];
    this.userList().forEach((username) => {
      result.push(this.userService.getUserByUsername(this.userInfo()?.id!, username))
    });
    return result;
  }

  cancelQuote(val:boolean) {}
}
