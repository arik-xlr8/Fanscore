import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5153/api/Auth';

  private currentUserSubject = new BehaviorSubject<MeResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  isLoggedIn$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor() {
    console.log('AUTH BASE URL:', this.baseUrl);
    console.log('REGISTER URL:', `${this.baseUrl}/register`);
    console.log('LOGIN URL:', `${this.baseUrl}/login`);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((response) => {
        this.saveAuth(response);
      })
    );
  }

  saveAuth(response: AuthResponse): void {
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }

    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getTokenRole(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role
        ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        ?? null;
    } catch {
      return null;
    }
  }

  isCurrentTokenAdmin(): boolean {
    return this.getTokenRole() === 'admin';
  }

  logout(): Observable<any> {
    const token = this.getToken();

    return this.http.post(`${this.baseUrl}/logout`, {}, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    }).pipe(
      tap(() => {
        this.clearAuth();
      })
    );
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
  }

  getMe(): Observable<MeResponse> {
    const token = this.getToken();
    console.log('TOKEN IN GETME:', token);
    return this.http.get<MeResponse>(`${this.baseUrl}/me`, {

      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  getCurrentUserSnapshot(): MeResponse | null {
    return this.currentUserSubject.value;
  }
}
