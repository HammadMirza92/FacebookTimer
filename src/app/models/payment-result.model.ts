export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
  Disputed = 'Disputed'
}

export interface PaymentResult {
  id: number;
  userSubscriptionId?: number;
  paymentProvider: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  errorMessage?: string;
  createdAt: Date;
}
