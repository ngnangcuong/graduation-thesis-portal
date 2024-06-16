import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import LoginRequest from '../models/user/loginRequest';
import CustomResponse from '../models/response';
import CreateUserRequest from '../models/user/registerRequest';
import UpdateUserRequest from '../models/user/updateUserRequest';
import RefreshRequest from '../models/user/refreshRequest';
import LoginResponse from '../models/user/loginResponse';

@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  private baseUrl = 'http://125.212.231.209:8098/v1';

  constructor(private http:HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    const response:CustomResponse = error.error as CustomResponse;
    return throwError(response);
  }

  login(loginRequest:LoginRequest): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.baseUrl}/auth/login`, loginRequest)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  refresh(refreshRequest:RefreshRequest): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.baseUrl}/auth/refresh`, refreshRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(authToken:string): Observable<CustomResponse> {
    const httpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`); 
    return this.http.get<CustomResponse>(`${this.baseUrl}/auth/logout`, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getUser(userID:string, id:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID);
    return this.http.get<CustomResponse>(`${this.baseUrl}/user/${id}`, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }

  getUserByUsername(authToken:string, username:string): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", authToken);
    const httpParams:HttpParams = new HttpParams().set("username", username);
    return this.http.get<CustomResponse>(`${this.baseUrl}/user`, {headers: httpHeaders, params: httpParams})
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllUser(authToken:string, contain:string, limit:number, offset:number): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", authToken);
    const httpParams:HttpParams = new HttpParams()
      .set("contain", contain)
      .set("limit", limit)
      .set("offset", offset);
    return this.http.get<CustomResponse>(`${this.baseUrl}/user/all`, {headers: httpHeaders, params: httpParams})
      .pipe(
        catchError(this.handleError)
      );
  }

  register(createUserRequest:CreateUserRequest): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.baseUrl}/user`, createUserRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUser(authToken:string, id: string, updateUserRequest:UpdateUserRequest): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("Authorization", `Bearer ${authToken}`);
    return this.http.put<CustomResponse>(`${this.baseUrl}/user/${id}`, updateUserRequest, {headers: httpHeaders})
    .pipe(
      catchError((error: HttpErrorResponse) => {
        const response:CustomResponse = error.error as CustomResponse;
        if (response.status == 401) {
          const refreshRequest:RefreshRequest = {
            refresh_token: localStorage.getItem("refresh_token")!,
          }
          this.refresh(refreshRequest).subscribe(
            (result) => {
              const tokenDetails:LoginResponse = result.result as LoginResponse;
              if (tokenDetails) {
                localStorage.setItem("access_token", tokenDetails.access_token);
                localStorage.setItem("refresh_token", tokenDetails.refresh_token);
              }
              return of(null).pipe(
                switchMap(() => this.updateUser(tokenDetails.access_token, id, updateUserRequest))
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
}
