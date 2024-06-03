import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import CustomResponse from '../models/response';
import CreateGroupRequest from '../models/group/createGroupRequest';
import UpdateGroupRequest from '../models/group/updateGroupRequest';
import CreateConversationRequest from '../models/group/createConversationRequest';

@Injectable({
  providedIn: 'root'
})
export class GroupServiceService {
  private baseUrl = "http://192.168.77.112:8099/v1";
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

  getGroup(userID:string, groupId:string, groupName:string, conversationID:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    const httpParams:HttpParams = new HttpParams()
      .set("group_id", groupId)
      .set("group_name", groupName)
      .set("conv_id", conversationID);
    return this.http.get<CustomResponse>(`${this.baseUrl}/group`, {params: httpParams, headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  createGroup(userID:string, createGroupRequest:CreateGroupRequest): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders()
      .set("X-User-ID", userID);
    return this.http.post<CustomResponse>(`${this.baseUrl}/group`, createGroupRequest, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  updateGroup(userID:string, groupID:string, updateGroupRequest:UpdateGroupRequest): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    return this.http.put<CustomResponse>(`${this.baseUrl}/group/${groupID}`, updateGroupRequest, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  leaveGroup(authInfo:string, groupID:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", authInfo)
    return this.http.put<CustomResponse>(`${this.baseUrl}/group/${groupID}/leave`, null, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getConversation(userID:string, conversationID:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    return this.http.get<CustomResponse>(`${this.baseUrl}/conversation/${conversationID}`, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  createConversation(userID:string, createConversationRequest:CreateConversationRequest): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    return this.http.post<CustomResponse>(`${this.baseUrl}/conversation`, createConversationRequest, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getConversationContainUser(userID:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    return this.http.get<CustomResponse>(`${this.baseUrl}/conversation/user/${userID}`, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getDirectedConversation(userID:string, withUser:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    const httpParams:HttpParams = new HttpParams().set("with", withUser);
    return this.http.get<CustomResponse>(`${this.baseUrl}/conversation/user`, {params: httpParams, headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }
}
