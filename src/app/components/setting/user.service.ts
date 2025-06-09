// services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/app/environments/environment';

// Interfaces
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  bio?: string;
  website?: string;
  location?: string;
  registrationDate: Date;
  lastLoginDate: Date;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  currentSubscription?: UserSubscription;
}

export interface UserSubscription {
  id: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  daysRemaining: number;
}

export interface UserStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
  successRate: number;
  connectionsCount: number;
  templatesCount: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  lastPostDate?: Date;
  nextScheduledPost?: Date;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  lastPasswordChange: Date | null;
}

export interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  loginTime: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

export interface AccountStats {
  loginCount: number;
  securityScore: number;
  dataUsage: number;
  lastPasswordChange: Date | null;
}

export interface EnableTwoFactorDto {
  method: 'authenticator' | 'sms';
  phoneNumber?: string;
}

export interface TwoFactorResponse {
  qrCode?: string;
  secret?: string;
  backupCodes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get HTTP headers with authorization
   */
  private getHttpHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: UpdateProfileDto): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, profileData, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(response => this.currentUserSubject.next(response.user)),
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(passwordData: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, passwordData, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<{ message: string; photoURL: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<{ message: string; photoURL: string }>(`${this.apiUrl}/avatar`, formData, {
      headers: headers
    }).pipe(
      tap(response => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          this.currentUserSubject.next({ ...currentUser, photoURL: response.photoURL });
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload cover photo
   */
  uploadCoverPhoto(file: File): Observable<{ message: string; coverURL: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<{ message: string; coverURL: string }>(`${this.apiUrl}/cover-photo`, formData, {
      headers: headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get account statistics
   */
  getAccountStats(): Observable<AccountStats> {
    return this.http.get<AccountStats>(`${this.apiUrl}/account-stats`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get security settings
   */
  getSecuritySettings(): Observable<SecuritySettings> {
    return this.http.get<SecuritySettings>(`${this.apiUrl}/security-settings`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): Observable<UserSession[]> {
    return this.http.get<UserSession[]>(`${this.apiUrl}/active-sessions`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor(twoFactorData: EnableTwoFactorDto): Observable<TwoFactorResponse> {
    return this.http.post<TwoFactorResponse>(`${this.apiUrl}/enable-2fa`, twoFactorData, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/disable-2fa`, {}, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verify two-factor setup
   */
  verifyTwoFactorSetup(code: string, method: string): Observable<{ message: string; backupCodes: string[] }> {
    return this.http.post<{ message: string; backupCodes: string[] }>(`${this.apiUrl}/verify-2fa-setup`, {
      code,
      method
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Terminate a specific session
   */
  terminateSession(sessionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/sessions/${sessionId}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logout from all sessions except current
   */
  logoutAllSessions(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout-all-sessions`, {}, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Resend email verification
   */
  resendEmailVerification(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/resend-email-verification`, {}, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Send phone verification
   */
  sendPhoneVerification(phoneNumber: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-phone-verification`, {
      phoneNumber
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verify phone number
   */
  verifyPhoneNumber(phoneNumber: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-phone`, {
      phoneNumber,
      code
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update email address
   */
  updateEmail(updateEmailData: { newEmail: string; password: string }): Observable<{ message: string; token: string }> {
    return this.http.post<{ message: string; token: string }>(`${this.apiUrl}/update-email`, updateEmailData, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Confirm email change
   */
  confirmEmailChange(confirmData: { newEmail: string; token: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/confirm-email-change`, confirmData, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Download account data
   */
  downloadAccountData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/download-data`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete account
   */
  deleteAccount(deleteData: { password: string; confirmationText: string; reason?: string }): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/account`, {
      headers: this.getHttpHeaders(),
      body: deleteData
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get security audit log
   */
  getSecurityAuditLog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/security-audit-log`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update notification preferences
   */
  updateNotificationPreferences(preferences: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/notification-preferences`, preferences, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(privacy: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/privacy-settings`, privacy, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate new backup codes
   */
  generateNewBackupCodes(): Observable<{ backupCodes: string[] }> {
    return this.http.post<{ backupCodes: string[] }>(`${this.apiUrl}/generate-backup-codes`, {}, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check if username is available
   */
  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-username/${username}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update user timezone
   */
  updateTimezone(timezone: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/timezone`, {
      timezone
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user activity log
   */
  getUserActivityLog(page: number = 1, limit: number = 20): Observable<{ activities: any[]; total: number }> {
    return this.http.get<{ activities: any[]; total: number }>(`${this.apiUrl}/activity-log?page=${page}&limit=${limit}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Clear user data (for GDPR compliance)
   */

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
        errorMessage = error.error.errors[0];
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      }
    }

    console.error('UserService Error:', error);
    return throwError(() => ({ error: { message: errorMessage }, status: error.status }));
  }

  /**
   * Set current user (used by auth service)
   */
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Get current user value synchronously
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Clear user data on logout
   */
  clearUserData(): void {
    this.currentUserSubject.next(null);
  }
}
