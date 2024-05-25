import { AfterViewInit, Component, ElementRef, OnInit, Signal, ViewChild, effect, signal } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { Util } from '../../models/util';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { QuoteComponent } from '../quote/quote.component';
import Message from '../../models/message';

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [MessageComponent, EditorModule, QuoteComponent],
  templateUrl: './live-chat.component.html',
  styleUrl: './live-chat.component.css'
})
export class LiveChatComponent implements OnInit, AfterViewInit{
  currrentConversation!:string;
  messages = signal<Message[]>([]);
  isQuote = signal<string>("");
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
  
  @ViewChild("editor")
  editorComponent!:EditorComponent;

  @ViewChild("bodyLiveChat")
  bodyLiveChat!:ElementRef;

  constructor() {
    effect(() => {
      const messages = this.messages();
      this.scrollToBottom();
    })

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    
    this.editorComponent.init = {
      force_p_newlines : false,
      force_br_newlines : true,
      convert_newlines_to_brs : false,
      remove_linebreaks : true,  
      height: '100%',
      plugins: 'lists link image table code emoticons autoresize',
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
      },
    }
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
      const message:Message = {
        message: content,
        quote: this.isQuote(),
      }
      this.cancelQuote(true);
      this.messages.update((value) => [message, ...value]);
      console.log(content);
      event.editor.resetContent();
      event.event.stopPropagation();
      event.event.preventDefault();
    }
  }

  scrollToBottom() {
    this.bodyLiveChat.nativeElement.scrollTop = this.bodyLiveChat.nativeElement.scrollHeight;
  }

  addQuote(event:string) {
    this.isQuote.set(event);
  }

  cancelQuote(event:boolean) {
    this.isQuote.set("");
  }
}
