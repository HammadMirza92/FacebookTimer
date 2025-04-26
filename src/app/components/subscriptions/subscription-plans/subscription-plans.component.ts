import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../services/subscription.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { SubscriptionPlan } from '../../../models/subscription-plan.model';
import { UserSubscription } from '../../../models/user-subscription.model';
import { User } from '../../../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  currentSubscription: UserSubscription | null = null;
  currentUser$: Observable<User | null>;
  loading = true;
  subscribing = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;

    // Load subscription plans and current subscription
    this.subscriptionService.getSubscriptionPlans().subscribe({
      next: plans => {
        this.plans = plans;

        this.subscriptionService.getCurrentSubscription().subscribe({
          next: subscription => {
            this.currentSubscription = subscription;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.notificationService.showError('Failed to load subscription plans');
        this.loading = false;
      }
    });
  }

  subscribeOrUpgrade(plan: SubscriptionPlan): void {
    if (this.isCurrentPlan(plan)) {
      this.notificationService.showInfo('You are already subscribed to this plan');
      return;
    }

    const dialogTitle = this.currentSubscription
      ? 'Upgrade Subscription'
      : 'Subscribe to Plan';

    const dialogMessage = this.currentSubscription
      ? `Are you sure you want to upgrade to the ${plan.name} plan? You will be charged $${plan.price} immediately.`
      : `Are you sure you want to subscribe to the ${plan.name} plan? You will be charged $${plan.price}.`;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: dialogTitle,
        message: dialogMessage,
        confirmText: this.currentSubscription ? 'Upgrade' : 'Subscribe',
        cancelText: 'Cancel',
        color: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processSubscription(plan);
      }
    });
  }

  processSubscription(plan: SubscriptionPlan): void {
    this.subscribing = true;

    const subscribeData = {
      subscriptionPlanId: plan.id,
      autoRenew: true,
      paymentMethodId: 'simulated-payment-method'
    };

    this.subscriptionService.subscribe(subscribeData).subscribe({
      next: subscription => {
        this.currentSubscription = subscription;
        this.notificationService.showSuccess(`Successfully subscribed to ${plan.name} plan!`);
        this.subscribing = false;

        // Update current user (to refresh subscription info in the UI)
        this.authService.getCurrentUser().subscribe();
      },
      error: error => {
        this.notificationService.showError(error.error || 'Failed to process subscription');
        this.subscribing = false;
      }
    });
  }

  cancelSubscription(): void {
    if (!this.currentSubscription) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Subscription Auto-Renewal',
        message: 'Are you sure you want to cancel your subscription auto-renewal? Your subscription will remain active until the end date, but will not renew automatically.',
        confirmText: 'Cancel Auto-Renewal',
        cancelText: 'Keep Auto-Renewal',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subscriptionService.cancelSubscription().subscribe({
          next: () => {
            this.notificationService.showSuccess('Subscription auto-renewal has been canceled');

            // Update current subscription
            this.subscriptionService.getCurrentSubscription().subscribe(subscription => {
              this.currentSubscription = subscription;

              // Update current user (to refresh subscription info in the UI)
              this.authService.getCurrentUser().subscribe();
            });
          },
          error: error => {
            this.notificationService.showError(error.error || 'Failed to cancel subscription auto-renewal');
          }
        });
      }
    });
  }

  isCurrentPlan(plan: SubscriptionPlan): boolean {
    return this.currentSubscription !== null &&
           this.currentSubscription.subscriptionPlanId === plan.id;
  }

  getFreeFeatures(): string[] {
    return [
      'Access to basic countdown templates',
      'Publish 1 post per week',
      'Manual posting to Facebook'
    ];
  }

  getProFeatures(): string[] {
    return [
      'Access to 20 premium templates',
      'Publish up to 10 posts per day',
      'Schedule posts in advance',
      'Custom fonts and colors',
      'Background images',
      'Automatic posting to Facebook'
    ];
  }

  getPremiumFeatures(): string[] {
    return [
      'Access to all templates',
      'Publish up to 20 posts per day',
      'All Pro features',
      'Priority support',
      'No Facebook branding',
      'Customizable refresh rates'
    ];
  }

  getFeaturesByPlanId(planId: number): string[] {
    switch (planId) {
      case 1:
        return this.getFreeFeatures();
      case 2:
        return this.getProFeatures();
      case 3:
        return this.getPremiumFeatures();
      default:
        return [];
    }
  }
}
