import { Injectable } from '@angular/core';
import { Observable, Observer, Subject, firstValueFrom } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import Message from '../models/message';
import ConversationMessage from '../models/message/conversationMessage';
import { HttpClient } from '@angular/common/http';
import CustomResponse from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private baseURL = "ws://125.212.231.209"
  private websocketForwarderURL = "http://125.212.231.209:8079/ws"
  private ws: WebSocket | null = null;
  private socket$!: WebSocketSubject<Message>;

  constructor(private http:HttpClient) {
    // this.socket$ = webSocket('ws://your-websocket-server-url');
    // const conn = new WebSocket("ws://125.212.231.209:8082/ws?user_id=1e9113a3-5cae-4067-b6a6-530e68bab7e3", )
  }
    

  connect(userID:string) {
    // this.http.post<CustomResponse>(this.websocketForwarderURL, null).subscribe(
    //   (val) => {
    //     const ipAddress = val.result as {
    //       ip_address: string;
    //     };
    //     const port = ipAddress.ip_address.split(":")[1];
    //     const url = `${this.baseURL}:${port}/user/ws?user_id=${userID}`
    //     console.log("[WebsocketForwarder] ", ipAddress);
    //     this.socket$ = webSocket(url);
    //     console.log("[socket]", this.socket$)
    //   },
    //   (err) => {
    //     console.log("[WebsocketForwarder] ", err);
    //     const url = `${this.baseURL}:8081/user/ws?user_id=${userID}`
    //     this.socket$ = webSocket(url);
    //   }
    // )
    const url = `${this.baseURL}:8081/user/ws?user_id=${userID}`
    this.socket$ = webSocket(url);
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
