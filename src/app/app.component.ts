import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LiveChatComponent } from './live-chat/live-chat.component';
import { NavigationComponent } from './navigation/navigation.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { AddNewChannelComponent } from './add-new-channel/add-new-channel.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ToastComponent } from './toast/toast.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectoryComponent } from './directory/directory.component';

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
    DirectoryComponent],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'graduation-thesis';
  isCreateNewGroupScreen = signal(false);
  liveChat = signal("")
  directory = signal(false);
  needToConfirm = signal<boolean>(false);
  actionStatus = signal<string>("");
  switchCreateNewGroupScreen(event:boolean) {
    this.isCreateNewGroupScreen.update(val => !val);
  }

  createNewGroupDone(groupID:string) {
    this.isCreateNewGroupScreen.update(val => !val);
    this.liveChat.set(groupID);
    this.directory.set(false);
  }

  switchToConversation(conversationID:string) {
    console.log("App: ", conversationID);
    this.isCreateNewGroupScreen.update(val => false);
    this.liveChat.set(conversationID);
    this.directory.set(false);
  }

  showConfirmDialog(event:string) {
    console.log(event);
    this.needToConfirm.set(true);
  }

  cancelConfirmDialog() {
    this.needToConfirm.set(false);
  }

  confirmAction(event:boolean) {
    this.needToConfirm.set(false);
    this.actionStatus.set('success');
    setTimeout(() => {
      this.actionStatus.set("");
    }, 2000);
  }

  switchToDirectory(event:boolean) {
    this.isCreateNewGroupScreen.set(false);
    this.liveChat.set("");
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
}
