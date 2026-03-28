import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateCurrentUser(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData);
  }

  updateAvatar(avatarUrl: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/avatar`, { avatarUrl });
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}