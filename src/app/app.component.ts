import { Component, OnDestroy, OnInit, effect, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { LiveChatComponent } from './live-chat/live-chat.component';
import { NavigationComponent } from './navigation/navigation.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { AddNewChannelComponent } from './add-new-channel/add-new-channel.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ToastComponent } from './toast/toast.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectoryComponent } from './directory/directory.component';
import { WebsocketService } from './websocket.service';
import { Subscription } from 'rxjs';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { UserServiceService } from './user-service.service';
import GetUserResponse from '../models/user/getUserResponse';
import Message from '../models/message';
import ConversationMessage from '../models/message/conversationMessage';
import { DatePipe } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { routes } from './app.routes';
import { ErrorInterceptor } from './error.interceptor';
import CustomResponse from '../models/response';
import { EcdhService } from './ecdh.service';
import UpdateUserRequest from '../models/user/updateUserRequest';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';
import { EncryptionService } from './encryption.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    LiveChatComponent, 
    NavigationComponent, 
    EditorModule, 
    AddNewChannelComponent,
    ConfirmDialogComponent,
    ToastComponent,
    DirectoryComponent,
    LoginComponent,
    HttpClientModule,
    DatePipe,
    RouterModule,
    NotificationDialogComponent,
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    HttpClientModule,
    DatePipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private wsSubscription!: Subscription;
  messages: string[] = [];

  title = 'graduation-thesis';
  isCreateNewGroupScreen = signal(false);
  liveChat = signal<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }>({
    conversationID:"",
    conversationName:"",
    conversationAvatar:"",
  });
  directory = signal(false);
  needToConfirm = signal<boolean>(false);
  actionStatus = signal<string>("");
  userInfo = signal<GetUserResponse|null>(JSON.parse(localStorage.getItem("user_info")!));
  needToPrivateKey = signal<boolean>(false);
  privateKeyMode = signal<string>("");
  privateKey = signal<string>(localStorage.getItem(`${this.userInfo()?.id}_private_key`)!);
  authToken:string = this.userInfo()?.id!;
  confirmCallback = signal<(context:any) => boolean>(() => true);
  confirmContext = signal<Object>({});
  actionConfirm = signal<string>("");
  detailConfirm = signal<string>("");
  newConversation = signal<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
    type: string;
  }>({
    conversationID: "",
    conversationName: "",
    conversationAvatar: "",
    type: "",
  });

  userRemove = signal<{
    userID:string;
    username:string;
    email:string;
    avatar:string;
  }>({
    userID: "",
    username: "",
    email: "",
    avatar: "",
  })

  userAdd = signal<GetUserResponse>({
    id: "",
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    avatar: "",
    created_at: new Date(),
    last_updated: new Date(),
    public_key: "",
  });

  removeConversation = signal<{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
    type: string;
  }>({
    conversationID: "",
    conversationName: "",
    conversationAvatar: "",
    type: "",
  });

  url = ``;
  // websocketConnection = this.websocketService.connect(this.url);
  messageSubscription!: Subscription;
  messageToReceive = signal<Message>({
    conv_id: "",
    conv_msg_id: 0,
    msg_time: 0,
    sender: "",
    content: "",
    iv: "",
    receiver: ""
  });

  constructor(private websocketService:WebsocketService,
              private userService:UserServiceService,
              private ecdhService:EcdhService,
              private encryptionService:EncryptionService
  ) {
    if (this.userInfo()) {
      this.authToken = this.userInfo()!.id;
      this.url = localStorage.getItem("access_token")!
      this.websocketService.connect(this.url);
    }
    const keyPair = this.ecdhService.generateKeyPair();
    const encryt = this.encryptionService.encrypt("Nguyễn Năng Cường và Nguyễn Hồng Thắm", keyPair.privateKey);
    console.log("[encrypt]", encryt);
    console.log("[decrypt]", this.encryptionService.decrypt(encryt.encryptMessage, keyPair.privateKey, encryt.iv));
    // effect(() => {
    //   const userInfo:GetUserResponse = this.userInfo();
    //   if (userInfo) {
    //     this.authToken = this.userInfo().id;
    //     this.url = `ws://192.168.77.105:8082/user/ws?user_id=${this.userInfo().id}`
    //     this.websocketService.connect(this.url);
    //   }
    // })
  }

  handleSuccessfulLogin(userID:string) {
    this.url = localStorage.getItem("access_token")!
    this.websocketService.connect(this.url);
    this.userService.getUser(userID, userID).subscribe(
      (val) => {
        const user:GetUserResponse = val.result as GetUserResponse;
        this.userInfo.set(user);
        this.authToken = user.id;
        localStorage.setItem("user_info", JSON.stringify(user));
        if (!user.public_key) {
          const keyPair = this.ecdhService.generateKeyPair();
          const updateUserRequest:UpdateUserRequest = {
            password: "",
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            avatar: "",
            public_key: keyPair.publicKey,
          };
          this.userService.updateUser(localStorage.getItem("access_token")!, userID, updateUserRequest).subscribe(
            (res) => {
              console.log("[UpdateUser] Updating Public key successfully");
              localStorage.setItem(`${userID}_private_key`, keyPair.privateKey);
              this.privateKey.set(keyPair.privateKey);
              this.privateKeyMode.set(keyPair.privateKey);
              this.needToPrivateKey.set(true);

            },
            (err:CustomResponse) => {
              console.log("[UpdateUser]:", err)
            }
          )
        } else {
          // Get Private Key from user
          this.privateKeyMode.set("not_first_time");
          this.needToPrivateKey.set(true);
        }
      },
      (err:CustomResponse) => {
        console.log(err);
      }
    )
  }

  savePrivateKey(privateKey:string) {
    console.log("[privateKey]", privateKey);
    this.privateKey.set(privateKey);
    localStorage.setItem(`${this.userInfo()!.id}_private_key`, privateKey);
    this.needToPrivateKey.set(false);
    this.privateKeyMode.set("");
  }

  sendMessage(message:Message) {
    console.log(message);
    this.websocketService.sendMessage(message);
  }

  ngOnInit(): void {
    // const url = 'wss://example.com/websocket';
    
    // websocketConnection.next(new MessageEvent<string>("test"));

    // this.wsSubscription = websocketConnection.subscribe(
    //   (message: MessageEvent) => {
    //     // this.messages.push(message.data);
    //     console.log(message.data);
    //   },
    //   (err) => {
    //     console.error(err);
    //   },
    //   () => {
    //     console.log('WebSocket connection closed');
    //   }
    // );
    if (!this.userInfo()) {
      return;
    }
    this.messageSubscription = this.websocketService.getMessages().subscribe(
      (message) => {
        // const parseMessage:Message = JSON.parse(message) as Message;
        // this.messages.push(message);
        this.messageToReceive.set(message);
        setTimeout(() => {
          this.messageToReceive.set({
            conv_id: "",
            conv_msg_id: 0,
            msg_time: 0,
            sender: "",
            content: "",
            iv: "",
            receiver: "",
          });
        }, 10);
      },
      (error) => {
        console.error('WebSocket error:', error);
        if (error instanceof CloseEvent) {
          console.log("Reconnect");
        } 
        // setTimeout(() => this.websocketService.connect(this.url), 3000);
        console.log("Reconnect again", this.messageSubscription);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
  switchCreateNewGroupScreen(event:boolean) {
    this.isCreateNewGroupScreen.update(val => !val);
  }

  createNewGroupDone(conversation:{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }) {
    this.isCreateNewGroupScreen.update(val => !val);
    this.liveChat.set(conversation);
    this.directory.set(false);
    const newConversation:{conversationID: string;
      conversationName: string;
      conversationAvatar: string;
      type:string;} = {
        conversationID: conversation.conversationID,
        conversationName: conversation.conversationName,
        conversationAvatar: conversation.conversationAvatar,
        type: "channel"
      }
    this.newConversation.set(newConversation);
  }

  removeExistConversation(removeConversation:{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
    type: string;
  }) {
    this.removeConversation.set(removeConversation);
  }

  addNewUser(userAdd:GetUserResponse) {
    this.userAdd.set(userAdd);
  }

  removeExistedUser(userRemove:{
    userID:string;
    username:string;
    email:string;
    avatar:string;
  }) {
    this.userRemove.set(userRemove);
  }

  switchToConversation(conversation:{
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }) {
    console.log("App: ", conversation);
    this.isCreateNewGroupScreen.update(val => false);
    this.liveChat.set(conversation);
    this.directory.set(false);
  }

  showConfirmDialog(event:{
    action: string;
    detail: string;
  }) {
    console.log(event);
    this.actionConfirm.set(event.action);
    this.detailConfirm.set(event.detail);
    setTimeout(() => {
      this.needToConfirm.set(true);
      
    }, 10);
  }

  cancelConfirmDialog() {
    this.needToConfirm.set(false);
  }

  confirmAction(event:boolean) {
    this.needToConfirm.set(false);
    if (event) {
      this.actionStatus.set('success');

    } else {
      this.actionStatus.set('error');
    }
    setTimeout(() => {
      this.actionStatus.set("");
    }, 2000);
  }

  switchToDirectory(event:boolean) {
    this.isCreateNewGroupScreen.set(false);
    this.liveChat.set({
      conversationID: "",
      conversationName: "",
      conversationAvatar: "",
    });
    this.directory.set(!this.directory());
  }

  test(callback: (arg:Object) => void) {
    console.log(this.context)
    callback(this.context);
  }
  context = {};
  testContext(context:Object) {
    this.context = context
  }

  forwardConfirmCallback(callback:(context:any) => boolean) {
    this.confirmCallback.set(callback);
  }

  forwardConfirmContext(context:Object) {
    this.confirmContext.set(context);
  }

  addNewConversation(conversation: {
    conversationID: string;
    conversationName: string;
    conversationAvatar: string;
  }, type:string) {
    const newConversation = {
      conversationID: conversation.conversationID,
      conversationName: conversation.conversationName,
      conversationAvatar: conversation.conversationName,
      type: type,
    }
    this.newConversation.set(newConversation);
  }

  handleLogoutSuccessfully() {
    // this.userInfo.set({
    //   id: "",
    //   username: "",
    //   first_name: "",
    //   last_name: "",
    //   email: "",
    //   phone_number: "",
    //   avatar: "",
    //   created_at: new Date(),
    //   last_updated: new Date(),
    //   public_key: "",
    // });
    this.userInfo.set(null);
  }
}
