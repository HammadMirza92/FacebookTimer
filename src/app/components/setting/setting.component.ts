// settings-layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
  registrationDate: Date;
  lastLoginDate: Date;
  isActive: boolean;
  currentSubscription?: UserSubscription;
  phoneNumber?: string;
  bio?:string;
  location?:string;
  emailConfirmed?: boolean;
  phoneNumberConfirmed?: boolean;
  twoFactorEnabled?: boolean;
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
}

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
  currentUser:any;
  userStats: UserStats | null = null;
  activeComponent = 'profile-header';
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserStats();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load current user data
   */
  private loadCurrentUser(): void {
    this.loading = true;

    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            this.loading = false;
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.loading = false;
          this.notificationService.showError('Failed to load user data');
        }
      });
  }

  /**
   * Load user statistics
   */
  private loadUserStats(): void {
    if (!this.currentUser) return;

    this.userService.getUserStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.userStats = stats;
        },
        error: (error) => {
          console.error('Error loading user stats:', error);
          // Don't show error notification for stats as it's not critical
        }
      });
  }

  /**
   * Handle route parameters for active component
   */
  private handleRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['tab']) {
          this.activeComponent = params['tab'];
        }
      });
  }

  /**
   * Set active component and update URL
   */
  setActiveComponent(component: string): void {
    this.activeComponent = component;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: component },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Get user initials for avatar
   */
  getInitials(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return 'U';

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Handle profile update events
   */
  onProfileUpdated(updatedUser: User): void {
    this.currentUser = { ...this.currentUser, ...updatedUser };
    this.notificationService.showSuccess('Profile updated successfully');

    // Refresh user data from server
    this.refreshUserData();
  }

  /**
   * Handle account update events
   */
  onAccountUpdated(updatedUser: User): void {
    this.currentUser = { ...this.currentUser, ...updatedUser };
    this.notificationService.showSuccess('Account information updated successfully');

    // Refresh user data from server
    this.refreshUserData();
  }

  /**
   * Handle password change events
   */
  onPasswordChanged(success: boolean): void {
    if (success) {
      this.notificationService.showSuccess('Password changed successfully');
    } else {
      this.notificationService.showError('Failed to change password');
    }
  }

  /**
   * Handle security settings update events
   */
  onSecurityUpdated(success: boolean): void {
    if (success) {
      this.notificationService.showSuccess('Security settings updated successfully');
      this.refreshUserData();
    } else {
      this.notificationService.showError('Failed to update security settings');
    }
  }

  /**
   * Refresh user data from server
   */
  private refreshUserData(): void {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
          console.error('Error refreshing user data:', error);
        }
      });
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.loading = true;

    this.userService.logoutAllSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          this.loading = false;
          // Force navigation to login even if logout fails
          this.router.navigate(['/login']);
        }
      });
  }
}
