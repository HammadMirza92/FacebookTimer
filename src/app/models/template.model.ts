export interface Template {
  id: number;
  name: string;
  description: string;
  backgroundImageUrl?: string;
  defaultFontFamily: string;
  primaryColor: string;
  requiresSubscription: boolean;
  minimumSubscriptionPlanId?: number;
  minimumSubscriptionPlanName?: string;
  isActive: boolean;
  createdAt: Date;
}
