import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import LoginRequest from '../models/user/loginRequest';
import CustomResponse from '../models/response';
import CreateUserRequest from '../models/user/registerRequest';
import UpdateUserRequest from '../models/user/updateUserRequest';
import RefreshRequest from '../models/user/refreshRequest';

@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  private baseUrl = 'http://192.168.77.112:8098/v1';

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

  logout(): Observable<CustomResponse> {
    return this.http.get<CustomResponse>(`${this.baseUrl}/auth/logout`)
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
    return this.http.get<CustomResponse>(`${this.baseUrl}/user/`, {headers: httpHeaders, params: httpParams})
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

  updateUser(userID:string, id: string, updateUserRequest:UpdateUserRequest): Observable<CustomResponse> {
    const httpHeaders:HttpHeaders = new HttpHeaders().set("X-User-ID", userID)
    return this.http.put<CustomResponse>(`${this.baseUrl}/user/${id}`, updateUserRequest, {headers: httpHeaders})
      .pipe(
        catchError(this.handleError)
      );
  }
}
