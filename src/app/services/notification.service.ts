import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
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

    // Apply global styles when service is initialized
    this.applyGlobalStyles();
  }

  /**
   * Apply global styles to fix Angular Material SnackBar container issues
   * This is a fallback in case the CSS in styles.scss doesn't fully apply
   */
  private applyGlobalStyles(): void {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    const css = `
      .mat-snack-bar-container, .mat-mdc-snack-bar-container, .mdc-snackbar__surface {
        padding: 0 !important;
        margin: 0 !important;
        background-color: transparent !important;
        box-shadow: none !important;
      }

      simple-snack-bar {
        display: flex !important;
        align-items: center !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
        padding: 14px 16px !important;
        margin: 8px !important;
        border-left-width: 5px !important;
        border-left-style: solid !important;
      }
    `;

    styleElement.appendChild(document.createTextNode(css));
    document.head.appendChild(styleElement);
  }

  /**
   * Show a success notification
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification(message, 'Close', 'success-snackbar', duration);
  }

  /**
   * Show an error notification
   */
  showError(message: string, duration: number = 5000): void {
    this.showNotification(message, 'CLOSE', 'error-snackbar', duration);
  }

  /**
   * Show a warning notification
   */
  showWarning(message: string, duration: number = 4000): void {
    this.showNotification(message, 'Close', 'warning-snackbar', duration);
  }

  /**
   * Show an info notification
   */
  showInfo(message: string, duration: number = 3000): void {
    this.showNotification(message, 'Close', 'info-snackbar', duration);
  }

  /**
   * Common method to show a notification
   */
  private showNotification(message: string, action: string, panelClass: string, duration: number): void {
    const config: MatSnackBarConfig = {
      duration: duration,
      panelClass: panelClass,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    };

    // Use Angular Material's built-in simple snackbar
    const snackBarRef = this.snackBar.open(message, action, config);

    // Optional: Directly fix styling after snackbar is shown (fallback method)
    setTimeout(() => {
      const containers = document.querySelectorAll('.mat-snack-bar-container, .mat-mdc-snack-bar-container');
      containers.forEach(container => {
        (container as HTMLElement).style.backgroundColor = 'transparent';
        (container as HTMLElement).style.boxShadow = 'none';
        (container as HTMLElement).style.padding = '0';
        (container as HTMLElement).style.margin = '0';
      });
    }, 0);
  }

  /**
   * Check for subscription alerts
   */
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
