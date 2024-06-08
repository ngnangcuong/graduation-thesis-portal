import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import CustomResponse from '../models/response';
import GetReadReceiptRequest from '../models/message/getReadReceiptRequest';
import UpdateReadReceiptRequest from '../models/message/updateReadReceiptRequest';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {
  private baseUrl = 'http://192.168.77.105:8090/v1';

  constructor(private http:HttpClient) { }
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Lỗi client-side hoặc network
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Lỗi server-side
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  getUserInboxes(authToken:string, userID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("X-User-ID", authToken);
    return this.http.get<CustomResponse>(`${this.baseUrl}/message/inbox/${userID}`, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getConversationMessages(authToken:string, conversationID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("X-User-ID", authToken);
    return this.http.get<CustomResponse>(`${this.baseUrl}/message/conversation/${conversationID}`, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getReadReceipt(authToken:string, getReadReceipt:GetReadReceiptRequest): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("X-User-ID", authToken);
    return this.http.post<CustomResponse>(`${this.baseUrl}/message/read_receipt`, getReadReceipt, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  updateReadReceipt(authToken:string, updateReadReceipt:UpdateReadReceiptRequest): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("X-User-ID", authToken);
    return this.http.put<CustomResponse>(`${this.baseUrl}/message/read_receipt`, updateReadReceipt, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }
}
