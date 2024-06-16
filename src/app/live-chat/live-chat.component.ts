import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, computed, effect, signal, Signal, WritableSignal, input, Output, EventEmitter } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { Util } from '../../models/util';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { QuoteComponent } from '../quote/quote.component';
import Message from '../../models/message';
import { MembersComponent } from '../members/members.component';
import { UserServiceService } from '../user-service.service';
import { GroupServiceService } from '../group-service.service';
import { MessageServiceService } from '../message-service.service';
import { WebsocketService } from '../websocket.service';
import ConversationMessage from '../../models/message/conversationMessage';
import GetUserResponse from '../../models/user/getUserResponse';
import GetConversationResponse from '../../models/group/getConversationResponse';
import { CanvasComponent } from '../canvas/canvas.component';
import UpdateReadReceiptRequest from '../../models/message/updateReadReceiptRequest';
import { EcdhService } from '../ecdh.service';
import { EncryptionService } from '../encryption.service';
// import tinymce from 'tinymce';

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [MessageComponent, EditorModule, QuoteComponent, MembersComponent, CanvasComponent],
  templateUrl: './live-chat.component.html',
  styleUrl: './live-chat.component.css'
})
export class LiveChatComponent implements OnInit, AfterViewInit{
  userInfo = signal<GetUserResponse>(JSON.parse(localStorage.getItem("user_info")!));
  authToken = input<string>();
  userRemove = input<{
    userID:string;
    username:string;
    email:string;
    avatar:string;
  }>();
  userAdd = input<GetUserResponse>();
  currrentConversation = input<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }>();
  conversation!:string;
  secretKey!: string;
  isDirect = false;
  currentMessages:ConversationMessage[] = [];
  messageToReceive = input<Message>();
  // conversationMessages = computed(() => {
  //   const messageToReceive = this.messageToReceive();
  //   const currrentConversation = this.currrentConversation();
  //   if (currrentConversation?.conversationID != this.conversation) {
  //     // this.showMembers.set("");
  //     this.conversation = currrentConversation?.conversationID!;
  //     this.messageService.getConversationMessages(this.authToken()!, currrentConversation?.conversationID!).subscribe(
  //       (val) => {
  //         const result:ConversationMessage[] = val.result as ConversationMessage[];
  //         this.currentMessages.update(val => result);
  //         return result;
  //       },
  //       (err) => {
  //         console.log("[getConversationMessage]", err);
  //         return [];
  //       }
  //     )
  //   } else if (messageToReceive?.conv_id != "") {
  //     this.currentMessages.update(val => [messageToReceive!, ...val]);
  //   }
  //   return this.currentMessages;
  // }, {})
  conversationMembers:{
    userID:string;
    username:string;
  }[] = [];
  mapIDToUsername:Map<string, Signal<{
    username:string;
    avatar:string;
  }>> = new Map<string, Signal<{
    username:string;
    avatar:string;
  }>>();

  isQuote = signal<string>("");
  showMembers = signal<string>("");
  conversationOptions:Util[] = [
    {
      name: "Call",
      display: "solar--phone-outline",
    },
    {
      name: "Room information",
      display: "hugeicons--information-circle",
    },
    {
      name: "Threads",
      display: "ph--threads-logo-light",
    },
    {
      name: "Discussion",
      display: "octicon--comment-discussion-24",
    },
    {
      name: "Search Messages",
      display: "carbon--search",
    },
    {
      name: "Mentions",
      display: "fluent--mention-20-regular",
    },
    {
      name: "Members",
      display: "ph--users-light"
    },
    {
      name: "Options",
      display: "pepicons-pencil--dots-y",
    }
  ]

  init = {}
  
  @ViewChild("editor")
  editorComponent!:EditorComponent;

  @ViewChild("bodyLiveChat")
  bodyLiveChat!:ElementRef;

  @Output()
  needToConfirmOutput = new EventEmitter<{
    action:string;
    detail:string;
  }>();

  @Output()
  confirmCallback = new EventEmitter<(context:any) => boolean>();

  @Output()
  confirmContext = new EventEmitter<Object>();

  @Output()
  messageToSend = new EventEmitter<Message>();

  @Output()
  actionSuccessful = new EventEmitter<boolean>();

  constructor(private userService:UserServiceService,
              private groupService:GroupServiceService,
              private messageService:MessageServiceService,
              private websocketService:WebsocketService,
              private ecdhService:EcdhService,
              private encryptionService:EncryptionService,
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
          
          editor.on('keydown', (event:any) => {
            const content = editor.getContent({ format: 'text' });
            console.log(content);
            const lines = content.split(/\r\n|\r|\n/).length;

            if (lines >= 4 && event.key == 'Enter') {
              event.preventDefault();
            }
          })  
          
        },
    }
    // effect(() => {
    //   const messages = this.currentMessages();
    //   this.scrollToBottom();
    // })
    effect(() => {
      const messageToReceive = this.messageToReceive();
      const currrentConversation = this.currrentConversation();
      if (currrentConversation?.conversationID != this.conversation) {
        // this.showMembers.set("");
        this.conversation = currrentConversation?.conversationID!;
        this.secretKey = localStorage.getItem(`${this.conversation}_secret_key`)!;
        this.conversationMembers = [];
        this.groupService.getConversation(this.userInfo()?.id!, this.currrentConversation()?.conversationID!).subscribe(
          (val) => {
            const result:GetConversationResponse = val.result as GetConversationResponse;
            if (result.members.length <= 2) {
              this.isDirect = true;
            } else {
              this.isDirect = false;
            }
            result.members.forEach((member) => {
              this.userService.getUser(this.userInfo()?.id!, member).subscribe(
                (val) => {
                  const user:GetUserResponse = val.result as GetUserResponse;
                  if (this.isDirect && this.secretKey == null && user.id != this.userInfo().id) {
                    console.log("[secretKey]", this.secretKey);
                    const privateKey = localStorage.getItem(`${this.userInfo().id}_private_key`);
                    this.secretKey = this.ecdhService.deriveSharedKey(privateKey!, user.public_key);
                    localStorage.setItem(`${this.conversation}_secret_key`, this.secretKey);
                  }
                  this.conversationMembers.push({
                    userID: member,
                    username: user.username,
                  })
                  this.mapIDToUsername.set(member, signal({
                    username: user.username,
                    avatar: user.avatar
                  }));
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
        console.log("[conversationMembers]", this.conversationMembers)
        this.messageService.getConversationMessages(localStorage.getItem("access_token")!, currrentConversation?.conversationID!).subscribe(
          (val) => {
            const result:ConversationMessage[] = val.result as ConversationMessage[];
            if (this.isDirect) {
              var messages:ConversationMessage[] = [];
              if (result) {

                result.forEach((message) => {
                  var decryptedMessage:ConversationMessage
                  try {
                    decryptedMessage = {
                      conv_id: message.conv_id,
                      conv_msg_id: message.conv_msg_id,
                      msg_time: message.msg_time,
                      sender: message.sender,
                      content: this.encryptionService.decrypt(message.content, this.secretKey, message.iv),
                      iv: message.iv,
                    };

                  } 
                  catch (e) {
                    console.log("[wrong key]", e);
                    decryptedMessage = {
                      conv_id: message.conv_id,
                      conv_msg_id: message.conv_msg_id,
                      msg_time: message.msg_time,
                      sender: message.sender,
                      content: "*******",
                      iv: message.iv,
                    };
                  }
                  messages.push(decryptedMessage);
                })
              } else {
                messages = [];
              }
              this.currentMessages = messages;
            } else {
              this.currentMessages = result;
            }
          },
          (err) => {
            this.currentMessages = [];
            console.log("[getConversationMessage]", err);
          }
        )
      } else if (messageToReceive?.conv_id == currrentConversation.conversationID) {
        var messageToReceiveAfterDecrypt = messageToReceive;
        if (this.isDirect) {
          messageToReceiveAfterDecrypt.content = this.encryptionService.decrypt(messageToReceive.content, this.secretKey, messageToReceive.iv);
        }
        if (this.currentMessages) {
          this.currentMessages =  [messageToReceiveAfterDecrypt, ...this.currentMessages];

        } else {
          this.currentMessages = [messageToReceiveAfterDecrypt];
        }
        
      }
      const updateReadReceipt:UpdateReadReceiptRequest = {
        conv_id: this.currrentConversation()?.conversationID!,
        read_receipt_update: [{
          user_id: this.userInfo().id,
          msg_id: 1000,
        }]
      }
      this.messageService.updateReadReceipt(this.authToken()!, updateReadReceipt).subscribe();
      this.scrollToBottom();
    })

  }

  ngOnInit(): void {
    // this.groupService.getConversation(this.userInfo()?.id!, this.currrentConversation()?.conversationID!).subscribe(
    //   (val) => {
    //     const result:GetConversationResponse = val.result as GetConversationResponse;
    //     result.members.forEach((member) => {
    //       this.userService.getUser(this.userInfo()?.id!, member).subscribe(
    //         (val) => {
    //           const user:GetUserResponse = val.result as GetUserResponse;
    //           this.conversationMembers.push({
    //             userID: member,
    //             username: user.username,
    //           })
    //           this.mapIDToUsername.set(member, signal({
    //             username: user.username,
    //             avatar: user.avatar
    //           }));
    //         },
    //         (err) => {
    //           console.log("[getUser]", err);
    //         }
    //       )
    //     })
    //   },
    //   (err) => {
    //     console.log("[getConversation]", err);
    //   }
    // )
    const updateReadReceipt:UpdateReadReceiptRequest = {
      conv_id: this.currrentConversation()?.conversationID!,
      read_receipt_update: [{
        user_id: this.userInfo().id,
        msg_id: 1000,
      }]
    }
    this.messageService.updateReadReceipt(this.authToken()!, updateReadReceipt).subscribe();
  }

  ngAfterViewInit(): void {
    
    this.editorComponent.init = {
      // force_p_newlines : false,
      force_br_newlines : true,
      convert_newlines_to_brs : false,
      remove_linebreaks : true,  
      height: '100%',
      plugins: 'lists link image table code emoticons autoresize',
      images_reuse_filename: true,
      automatic_uploads: true,
      images_upload_url: 'http://192.168.77.105:8093/v1/',
      file_picker_types: 'file image media',
      file_picker_callback(callback, value, meta) {
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
      setup: function(editor) {
        editor.ui.registry.addButton("mySendButton", {
          tooltip: "Send Message",
          icon: "send",
          onAction() { 
            editor.resetContent();
          },
          
        });
        editor.on('keydown', (event) => {
          const content = editor.getContent({ format: 'text' });
          console.log(content);
          const lines = content.split(/\r\n|\r|\n/).length;

          if (lines >= 4 && event.key == 'Enter') {
            event.preventDefault();
          }
        })
      },
    }
    console.log(this.editorComponent);
  }

  // getUserFromMessage(message:ConversationMessage): {
  //   username:string;
  //   avatar:string;} {
  //     return this.mapIDToUsername.get(message.sender)!;
  // }

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
      var receiver = "";
      var sendContent = content;
      var iv = "";
      if (this.conversationMembers.length <= 2) {
        const encryptionMessage = this.encryptionService.encrypt(content, this.secretKey);
        sendContent = encryptionMessage.encryptMessage;
        iv = encryptionMessage.iv;
        if (this.conversationMembers[0].userID == this.userInfo().id) {
          receiver = this.conversationMembers[1].userID;
        } else {
          receiver = this.conversationMembers[0].userID;
        }
      }
      const message:Message = {
        conv_id: this.conversation,
        conv_msg_id: 0,
        content: sendContent,
        iv: iv,
        sender: this.userInfo().id,
        msg_time: Date.now(),
        receiver: receiver,
      }
      this.cancelQuote(true);
      // this.currentMessages.update((value:Message[]) => [message, ...value]);
      this.messageToSend.emit(message);
      console.log(event.editor.getContent({format: 'text'}));
      event.editor.resetContent();
      event.event.stopPropagation();
      event.event.preventDefault();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.bodyLiveChat.nativeElement.scrollTop = this.bodyLiveChat.nativeElement.scrollHeight;
      const updateReadReceipt:UpdateReadReceiptRequest = {
        conv_id: this.currrentConversation()?.conversationID!,
        read_receipt_update: [{
          user_id: this.userInfo().id,
          msg_id: 100,
        }]
      }
      this.messageService.updateReadReceipt(this.authToken()!, updateReadReceipt).subscribe();
    }, 100);
  }

  addQuote(event:string) {
    this.isQuote.set(event);
  }

  cancelQuote(event:boolean) {
    this.isQuote.set("");
  }

  showOption(option:string) {   
    if (option == 'Members') {
      if (this.showMembers() != "") {
        this.showMembers.set("");
        return
      }
      this.showMembers.set(this.currrentConversation()?.conversationID!);
      return
    }
  }

  cancelOption() {
    this.showMembers.set("");
  }

  needToConfirm(confirm:{
    action:string;
    detail:string;
  }) {
    this.needToConfirmOutput.emit(confirm);
  }

  forwardConfirmCallback(callback:(context:any) => boolean) {
    this.confirmCallback.emit(callback);
  }

  forwardConfirmContext(context:Object) {
    this.confirmContext.emit(context);
  }
}
