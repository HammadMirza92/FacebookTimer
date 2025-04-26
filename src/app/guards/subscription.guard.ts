import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { SubscriptionService } from '../services/subscription.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard {
  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if this route requires a specific subscription level
    const requiredPlanId = route.data['requiredPlanId'] as number;

    if (!requiredPlanId) {
      return true;
    }

    return this.subscriptionService.getCurrentSubscription().pipe(
      take(1),
      map(subscription => {
        // Allow if user has required subscription level or higher
        if (subscription && subscription.subscriptionPlanId >= requiredPlanId) {
          return true;
        }

        this.notificationService.showWarning('This feature requires a higher subscription level.');
        this.router.navigate(['/subscription/plans']);
        return false;
      })
    );
  }
}
