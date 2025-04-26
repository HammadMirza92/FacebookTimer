import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { SubscriptionPlan } from '../models/subscription-plan.model';
import { UserSubscription } from '../models/user-subscription.model';
import { Subscribe } from '../models/subscribe.model';
import { PaymentResult } from '../models/payment-result.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) { }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.apiUrl}/plans`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getCurrentSubscription(): Observable<UserSubscription | null> {
    return this.http.get<UserSubscription | null>(`${this.apiUrl}/current`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  subscribe(subscribeData: Subscribe): Observable<UserSubscription> {
    return this.http.post<UserSubscription>(`${this.apiUrl}/subscribe`, subscribeData)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  cancelSubscription(): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel`, {})
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  checkRenewalAlert(): Observable<{needsRenewalAlert: boolean}> {
    return this.http.get<{needsRenewalAlert: boolean}>(`${this.apiUrl}/check-renewal-alert`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getPaymentHistory(): Observable<PaymentResult[]> {
    return this.http.get<PaymentResult[]>(`${this.apiUrl}/payments`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
