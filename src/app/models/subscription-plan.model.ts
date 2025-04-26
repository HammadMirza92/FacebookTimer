export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  maxPosts: number;
  maxTemplates: number;
  isActive: boolean;
}
