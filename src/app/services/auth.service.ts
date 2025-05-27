// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, map, tap, retry, retryWhen, delayWhen } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';
import { User } from '../models/user.model';
import { Login } from '../models/login.model';
import { Register } from '../models/register.model';
import { AuthResponse } from '../models/auth-response.model';

export interface GoogleAuthRequest {
  credential: string;
  provider: string;
  action: 'login' | 'register';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;
  private refreshTokenTimer: any;
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'currentUser';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly tokenExpirationKey = 'tokenExpiration';

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();

    // Auto-login if valid token exists
    this.autoLogin();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginData: Login): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        retry(2),
        map(response => this.handleAuthSuccess(response)),
        catchError(this.handleAuthError.bind(this))
      );
  }

  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData)
      .pipe(
        retry(2),
        catchError(this.handleAuthError.bind(this))
      );
  }

  googleLogin(credential: string): Observable<AuthResponse> {
    const googleAuthData: GoogleAuthRequest = {
      credential: credential,
      provider: 'Google',
      action: 'login'
    };
    debugger;
   return this.http.post<AuthResponse>(`${this.apiUrl}/external-login`, googleAuthData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleAuthError.bind(this))
    );

  }

  googleRegister(credential: string): Observable<AuthResponse> {
    const googleAuthData: GoogleAuthRequest = {
      credential: credential,
      provider: 'Google',
      action: 'register'
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/external-login`, googleAuthData)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            delayWhen(() => timer(1000)),
            retry(2)
          )
        ),
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleAuthError.bind(this))
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {
      refreshToken: refreshToken
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Clear all authentication data
    this.clearAuthData();

    // Clear timers
    this.clearTimers();

    // Update current user
    this.currentUserSubject.next(null);

    // Navigate to login
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        retry(2),
        catchError(this.handleAuthError.bind(this))
      );
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token: token,
      password: password
    }).pipe(
      retry(2),
      catchError(this.handleAuthError.bind(this))
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token: token })
      .pipe(
        retry(2),
        catchError(this.handleAuthError.bind(this))
      );
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email: email })
      .pipe(
        retry(2),
        catchError(this.handleAuthError.bind(this))
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          this.setUserData(user);
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, profileData)
      .pipe(
        tap(user => {
          this.setUserData(user);
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleAuthError.bind(this))
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword: currentPassword,
      newPassword: newPassword
    }).pipe(
      retry(2),
      catchError(this.handleAuthError.bind(this))
    );
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/account`)
      .pipe(
        tap(() => this.logout()),
        catchError(this.handleAuthError.bind(this))
      );
  }

  // Token and Authentication State Management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expirationDate = this.getTokenExpiration();
    if (expirationDate && new Date() >= expirationDate) {
      this.logout();
      return false;
    }

    return true;
  }

  isTokenExpired(): boolean {
    const expirationDate = this.getTokenExpiration();
    return expirationDate ? new Date() >= expirationDate : true;
  }

  getTokenExpiration(): Date | null {
    const expiration = localStorage.getItem(this.tokenExpirationKey);
    return expiration ? new Date(expiration) : null;
  }

  autoLogin(): void {
    const user = this.getUserFromStorage();
    if (!user || !this.isAuthenticated()) {
      this.logout();
      return;
    }

    this.currentUserSubject.next(user);
    this.setupTokenRefresh();
  }

  // Private Methods
  private handleAuthSuccess(authResponse: AuthResponse): User {
    this.setAuthData(authResponse);
    this.setupTokenRefresh();
    this.currentUserSubject.next(authResponse.user);
    return authResponse.user;
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
          break;
        case 403:
          errorMessage = error.error?.message || 'Access denied.';
          break;
        case 404:
          errorMessage = error.error?.message || 'Service not found.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflict. This email may already be registered.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || 'Something went wrong. Please try again.';
      }
    }

    console.error('Auth Error:', error);
    return throwError(() => ({ error: { message: errorMessage }, status: error.status }));
  }

  private setAuthData(authResponse: AuthResponse): void {
    const expiresIn = authResponse.expiresIn || 86400; // Default 24 hours
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);

    localStorage.setItem(this.tokenKey, authResponse.token);
    localStorage.setItem(this.userKey, JSON.stringify(authResponse.user));
    localStorage.setItem(this.tokenExpirationKey, expirationDate.toISOString());

    if (authResponse.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);
    }
  }

  private setUserData(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpirationKey);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem(this.userKey);
    if (user) {
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearAuthData();
        return null;
      }
    }
    return null;
  }

  private setupTokenRefresh(): void {
    this.clearTimers();

    const expirationDate = this.getTokenExpiration();
    if (!expirationDate) return;

    const expiresIn = expirationDate.getTime() - new Date().getTime();
    const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000); // Refresh 5 minutes before expiry, minimum 1 minute

    this.refreshTokenTimer = setTimeout(() => {
      if (this.isAuthenticated()) {
        this.refreshToken().subscribe({
          next: () => {
            console.log('Token refreshed successfully');
          },
          error: (error) => {
            console.error('Token refresh failed:', error);
            this.logout();
          }
        });
      }
    }, refreshTime);
  }

  private clearTimers(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
      this.refreshTokenTimer = null;
    }
  }
}
