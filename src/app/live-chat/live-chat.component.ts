import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, computed, effect, signal, Signal, WritableSignal, input, Output, EventEmitter } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { Util } from '../../models/util';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { QuoteComponent } from '../quote/quote.component';
import Message from '../../models/message';
import { MembersComponent } from '../members/members.component';
// import tinymce from 'tinymce';

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [MessageComponent, EditorModule, QuoteComponent, MembersComponent],
  templateUrl: './live-chat.component.html',
  styleUrl: './live-chat.component.css'
})
export class LiveChatComponent implements OnInit, AfterViewInit{
  currrentConversation = input<string>();
  conversation!:string;
  currentMessages = signal<Message[]>([]);
  conversationMessages = computed(() => {
    const currentMessages = this.currentMessages();
    const currrentConversation = this.currrentConversation();
    if (currrentConversation != this.conversation) {
      this.conversation = currrentConversation!;
      const newMessage:Message = {
        message: currrentConversation!,
        quote: "",
      }
      return [newMessage];
    }
    return currentMessages;
  })

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
  needToConfirmOutput = new EventEmitter<string>();

  @Output()
  testCallbackOutput = new EventEmitter<(context:any) => void>();

  @Output()
  testContext = new EventEmitter<Object>();

  constructor() {
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
    effect(() => {
      const messages = this.currentMessages();
      this.scrollToBottom();
    })

  }

  ngOnInit(): void {

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
      images_upload_url: 'http://localhost:8081/v1/',
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
      this.currentMessages.update((value:Message[]) => [message, ...value]);
      console.log(event.editor.getContent({format: 'text'}));
      event.editor.resetContent();
      event.event.stopPropagation();
      event.event.preventDefault();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.bodyLiveChat.nativeElement.scrollTop = this.bodyLiveChat.nativeElement.scrollHeight;
      
    }, 10);
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
      this.showMembers.set(this.currrentConversation()!);
      return
    }
  }

  cancelOption() {
    this.showMembers.set("");
  }

  needToConfirm(event:string) {
    this.needToConfirmOutput.emit(event);
    this.testContext.emit({conversationMessages: this.conversationMessages()})
    this.testCallbackOutput.emit((context:any) => {
      console.log(context.conversationMessages);
    })
  }
}
