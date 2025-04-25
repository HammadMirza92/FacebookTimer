import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  SubscriptionType,
  SubscriptionUpdateRequest,
  SUBSCRIPTION_PLANS
} from '../../core/models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private apiService: ApiService) { }

  updateSubscription(subscriptionType: SubscriptionType, months: number): Observable<void> {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const request: SubscriptionUpdateRequest = {
      subscriptionType,
      endDate
    };

    return this.apiService.put<void, SubscriptionUpdateRequest>('users/subscription', request);
  }

  getSubscriptionPlans() {
    return SUBSCRIPTION_PLANS;
  }

  getDailyPostLimit(subscriptionType: string): number {
    const plan = SUBSCRIPTION_PLANS.find(p => p.type === subscriptionType as SubscriptionType);
    return plan ? plan.dailyPostLimit : 0;
  }
}
