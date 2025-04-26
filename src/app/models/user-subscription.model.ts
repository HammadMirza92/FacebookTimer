export interface UserSubscription {
  id: number;
  subscriptionPlanId: number;
  subscriptionPlanName: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  daysRemaining: number;
}
