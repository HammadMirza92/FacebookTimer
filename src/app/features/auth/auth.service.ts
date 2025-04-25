import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../core/models/auth.model';
import { User } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  login(request: LoginRequest): Observable<User> {
    return this.apiService.post<AuthResponse, LoginRequest>('auth/login', request)
      .pipe(
        map(response => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
        catchError(error => {
          console.error('Login error', error);
          return throwError(() => new Error(error.error || 'Login failed'));
        })
      );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.apiService.post<AuthResponse, RegisterRequest>('auth/register', request)
      .pipe(
        map(response => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
        catchError(error => {
          console.error('Registration error', error);
          return throwError(() => new Error(error.error || 'Registration failed'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getUserInfo(userId: number): Observable<User> {
    return this.apiService.get<User>(`users/${userId}`)
      .pipe(
        tap(user => this.currentUserSubject.next(user)),
        catchError(error => {
          console.error('Get user info error', error);
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error(error.error || 'Failed to get user info'));
        })
      );
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Decode token to get user ID (assuming JWT)
    try {
      const decoded = this.jwtDecode(token);
      this.getUserInfo(decoded.nameid).subscribe();
    } catch (error) {
      this.logout();
    }
  }

  private jwtDecode(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
