import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../services/subscription.service';
import { NotificationService } from '../../../services/notification.service';
import { PaymentResult, PaymentStatus } from '../../../models/payment-result.model';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  payments: PaymentResult[] = [];
  loading = true;
  displayedColumns: string[] = ['date', 'amount', 'provider', 'transactionId', 'status'];

  constructor(
    private subscriptionService: SubscriptionService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;

    this.subscriptionService.getPaymentHistory().subscribe({
      next: payments => {
        this.payments = payments;
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Failed to load payment history');
        this.loading = false;
      }
    });
  }

  getStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'status-completed';
      case PaymentStatus.Pending:
        return 'status-pending';
      case PaymentStatus.Failed:
        return 'status-failed';
      case PaymentStatus.Refunded:
        return 'status-refunded';
      case PaymentStatus.Disputed:
        return 'status-disputed';
      default:
        return '';
    }
  }
}
