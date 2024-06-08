import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import Message from '../models/message';
import ConversationMessage from '../models/message/conversationMessage';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws: WebSocket | null = null;
  private socket$!: WebSocketSubject<Message>;

  constructor() {
    // this.socket$ = webSocket('ws://your-websocket-server-url');
    // const conn = new WebSocket("ws://192.168.77.105:8082/ws?user_id=1e9113a3-5cae-4067-b6a6-530e68bab7e3", )
  }

  connect(url:string) {
    console.log("connect")
    // this.ws = new WebSocket(url);
    this.socket$ = webSocket(url);
    // this.ws.onerror = (event) => {
    //   console.error('WebSocket error', event);
    // };

    // this.ws.onclose = () => {
    //   console.log('WebSocket closed, attempting to reconnect...');
    //   this.reconnect(url);
    // };
  }

  private reconnect(url: string): void {
    setTimeout(() => this.connect(url), 3000);
  }

  sendMessage(message: Message): void {
    this.socket$.next(message);
    
  }

  getMessages(): Observable<Message> {
    return this.socket$.asObservable();
  }

  closeConnection(): void {
    this.socket$.complete();
  }

  // private subject!: Subject<MessageEvent>;

  // constructor() {}

  // public connect(url: string): Subject<MessageEvent<Message>> {
  //   if (!this.subject) {
  //     this.subject = this.create(url);
  //     console.log('Successfully connected: ' + url);
  //   }
  //   return this.subject;
  // }

  // private create(url: string): Subject<MessageEvent<string>> {
  //   const ws = new WebSocket(url);

  //   const observable = new Observable(
  //     (obs: Observer<MessageEvent>) => {
  //       ws.onmessage = obs.next.bind(obs);
  //       ws.onerror = obs.error.bind(obs);
  //       ws.onclose = obs.complete.bind(obs);
  //       return ws.close.bind(ws);
  //     }
  //   );

  //   const observer = {
  //     next: (data: Object) => {
  //       if (ws.readyState === WebSocket.OPEN) {
  //         ws.send(JSON.stringify(data));
  //       }
  //     }
  //   };

  //   return Subject.create(observer, observable);
  // }
}
