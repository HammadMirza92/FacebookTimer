import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { filter, Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../models/user.model';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidenavEvent = new EventEmitter<void>();
  currentUser$: Observable<User | null>;
  // subscriptionAlert$: Observable<boolean>;
  notificationCount = 0;
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
    // this.subscriptionAlert$ = this.notificationService.subscriptionAlert;
  }

  ngOnInit(): void {
   this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap(() => {
        // If we're authenticated according to local storage but don't have a user object
        // fetch the current user from the API
        if (this.authService.isAuthenticated() && !this.authService.currentUserValue) {
          return this.authService.getCurrentUser();
        }
        // Otherwise, just return the current user value
        return of(this.authService.currentUserValue);
      })
    ).subscribe({
      error: (error) => {
        console.error('Error refreshing user state:', error);
        // If there's an error (like an expired token), log the user out
        if (error.status === 401) {
          this.authService.logout();
          this.notificationService.showError('Your session has expired. Please log in again.');
        }
      }
    });
  }

  toggleSidenav(): void {
    this.toggleSidenavEvent.emit();
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.showInfo('You have been logged out');
  }

  navigateToPlans(): void {
    this.router.navigate(['/subscription/plans']);
  }

  getInitials(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return 'U';

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return `${firstInitial}${lastInitial}`;
  }


}
