import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { take, switchMap, filter } from 'rxjs/operators';

import { SubscriptionService } from './subscription.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private subscriptionAlertSubject = new BehaviorSubject<boolean>(false);
  public subscriptionAlert: Observable<boolean> = this.subscriptionAlertSubject.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) {
    // Check for subscription renewal alerts every hour when logged in
    interval(3600000) // 1 hour
      .pipe(
        filter(() => this.authService.isAuthenticated()),
        switchMap(() => this.subscriptionService.checkRenewalAlert())
      )
      .subscribe(result => {
        this.subscriptionAlertSubject.next(result.needsRenewalAlert);
      });
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['error-snackbar']
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['warning-snackbar']
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['info-snackbar']
    });
  }

  checkSubscriptionAlert(): void {
    if (this.authService.isAuthenticated()) {
      this.subscriptionService.checkRenewalAlert()
        .pipe(take(1))
        .subscribe(result => {
          this.subscriptionAlertSubject.next(result.needsRenewalAlert);

          if (result.needsRenewalAlert) {
            this.showWarning('Your subscription is expiring soon. Please renew to avoid service interruption.', 8000);
          }
        });
    }
  }
}
