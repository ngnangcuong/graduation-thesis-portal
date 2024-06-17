import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import CustomResponse from '../models/response';
import GetReadReceiptRequest from '../models/message/getReadReceiptRequest';
import UpdateReadReceiptRequest from '../models/message/updateReadReceiptRequest';
import { UserServiceService } from './user-service.service';
import RefreshRequest from '../models/user/refreshRequest';
import LoginResponse from '../models/user/loginResponse';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {
  private baseUrl = 'https://125.212.231.209:8090/v1';

  constructor(private http:HttpClient,
              private userService:UserServiceService
  ) { }
  private handleError(error: HttpErrorResponse) {
    const response:CustomResponse = error.error as CustomResponse;
    return throwError(response);
  }

  getUserInboxes(authToken:string, userID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    return this.http.get<CustomResponse>(`${this.baseUrl}/message/inbox/${userID}`, {headers: httpHeaders})
    .pipe(
      catchError((error: HttpErrorResponse) => {
        const response:CustomResponse = error.error as CustomResponse;
        if (response.status == 401) {
          const refreshRequest:RefreshRequest = {
            refresh_token: localStorage.getItem("refresh_token")!,
          }
          this.userService.refresh(refreshRequest).subscribe(
            (result) => {
              const tokenDetails:LoginResponse = result.result as LoginResponse;
              if (tokenDetails) {
                localStorage.setItem("access_token", tokenDetails.access_token);
                localStorage.setItem("refresh_token", tokenDetails.refresh_token);
              }
              return of(null).pipe(
                switchMap(() => this.getUserInboxes(tokenDetails.access_token, userID))
              )
            },
            (err:CustomResponse) => {
              return throwError(err)
            }
          )
        }
        return throwError(response);
      })
    );
  }

  getConversationMessages(authToken:string, conversationID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    const httpParams = new HttpParams().set("limit", 1000);
    return this.http.get<CustomResponse>(`${this.baseUrl}/message/conversation/${conversationID}`, {headers: httpHeaders, params: httpParams})
    .pipe(
      catchError((error: HttpErrorResponse) => {
        const response:CustomResponse = error.error as CustomResponse;
        if (response.status == 401) {
          const refreshRequest:RefreshRequest = {
            refresh_token: localStorage.getItem("refresh_token")!,
          }
          this.userService.refresh(refreshRequest).subscribe(
            (result) => {
              const tokenDetails:LoginResponse = result.result as LoginResponse;
              if (tokenDetails) {
                localStorage.setItem("access_token", tokenDetails.access_token);
                localStorage.setItem("refresh_token", tokenDetails.refresh_token);
              }
              return of(null).pipe(
                switchMap(() => this.getConversationMessages(tokenDetails.access_token, conversationID))
              )
            },
            (err:CustomResponse) => {
              return throwError(err)
            }
          )
        }
        return throwError(response);
      })
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
