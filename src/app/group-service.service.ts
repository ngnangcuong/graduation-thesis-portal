import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import CustomResponse from '../models/response';
import CreateGroupRequest from '../models/group/createGroupRequest';
import UpdateGroupRequest from '../models/group/updateGroupRequest';
import CreateConversationRequest from '../models/group/createConversationRequest';
import { UserServiceService } from './user-service.service';
import RefreshRequest from '../models/user/refreshRequest';
import LoginResponse from '../models/user/loginResponse';

@Injectable({
  providedIn: 'root'
})
export class GroupServiceService {
  private baseUrl = "http://192.168.77.105:8099/v1";
  constructor(private http:HttpClient,
              private userService:UserServiceService
  ) { }

  private handleError(error: HttpErrorResponse) {
    const response:CustomResponse = error.error as CustomResponse;
    return throwError(response);
  }

  getGroup(authToken:string, groupId:string, groupName:string, conversationID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    const httpParams:HttpParams = new HttpParams()
      .set("group_id", groupId)
      .set("group_name", groupName)
      .set("conv_id", conversationID);
    return this.http.get<CustomResponse>(`${this.baseUrl}/group`, {params: httpParams, headers: httpHeaders})
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
                  switchMap(() => this.getGroup(tokenDetails.access_token, groupId, groupName, conversationID))
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

  createGroup(authToken:string, createGroupRequest:CreateGroupRequest): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    return this.http.post<CustomResponse>(`${this.baseUrl}/group`, createGroupRequest, {headers: httpHeaders})
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
                switchMap(() => this.createGroup(tokenDetails.access_token, createGroupRequest))
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

  updateGroup(authToken:string, groupID:string, updateGroupRequest:UpdateGroupRequest): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    return this.http.put<CustomResponse>(`${this.baseUrl}/group/${groupID}`, updateGroupRequest, {headers: httpHeaders})
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
                switchMap(() => this.updateGroup(tokenDetails.access_token, groupID, updateGroupRequest))
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

  leaveGroup(authToken:string, groupID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    return this.http.put<CustomResponse>(`${this.baseUrl}/group/${groupID}/leave`, null, {headers: httpHeaders})
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
                switchMap(() => this.leaveGroup(tokenDetails.access_token, groupID))
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

  getConversationContainUser(authToken:string, userID:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    return this.http.get<CustomResponse>(`${this.baseUrl}/conversation/user/${userID}`, {headers: httpHeaders})
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
                switchMap(() => this.getConversationContainUser(tokenDetails.access_token, userID))
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

  getDirectedConversation(authToken:string, withUser:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    const httpParams:HttpParams = new HttpParams().set("with", withUser);
    return this.http.get<CustomResponse>(`${this.baseUrl}/conversation/user`, {params: httpParams, headers: httpHeaders})
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
                switchMap(() => this.getDirectedConversation(tokenDetails.access_token, withUser))
              );
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
}
