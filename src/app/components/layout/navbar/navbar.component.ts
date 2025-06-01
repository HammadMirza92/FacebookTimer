import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { User } from '../../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidenavEvent = new EventEmitter<void>();
  currentUser$: Observable<User | null>;
  subscriptionAlert$: Observable<boolean>;
  notificationCount = 0;
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
    this.subscriptionAlert$ = this.notificationService.subscriptionAlert;
  }

  ngOnInit(): void {
    this.notificationService.checkSubscriptionAlert();
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
