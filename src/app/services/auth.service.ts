import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest } from '../interfaces/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl + '/v1/api';
  private readonly API_KEY = environment.key;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-API-Key': this.API_KEY,
      'Content-Type': 'application/json'
    });
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/login`, credentials, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => {
        this.setCurrentUser(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getToken(): string | null {
    return this.currentUser?.token || null;
  }
}