export enum SubscriptionType {
  Free = 'Free',
  Standard = 'Standard',
  Premium = 'Premium'
}

export interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  price: number;
  dailyPostLimit: number;
  templateCount: number;
  description: string;
  features: string[];
}

export interface SubscriptionUpdateRequest {
  subscriptionType: SubscriptionType;
  endDate: Date;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    type: SubscriptionType.Free,
    name: 'Free',
    price: 0,
    dailyPostLimit: 3,
    templateCount: 7,
    description: 'Basic countdown timer features',
    features: [
      'Post 3 times per day',
      'Access to 7 basic templates',
      'Limited to 7 days of countdown',
      'Social media sharing'
    ]
  },
  {
    type: SubscriptionType.Standard,
    name: 'Standard',
    price: 20,
    dailyPostLimit: 10,
    templateCount: 20,
    description: 'Enhanced features for growing businesses',
    features: [
      'Post 10 times per day',
      'Access to 20 premium templates',
      'No countdown time limit',
      'Remove branding',
      'Faster countdown update period'
    ]
  },
  {
    type: SubscriptionType.Premium,
    name: 'Premium',
    price: 50,
    dailyPostLimit: 20,
    templateCount: 999, // All templates
    description: 'Full access to all features',
    features: [
      'Post 20 times per day',
      'Access to ALL templates',
      'Priority support',
      'Custom branding options',
      'Advanced analytics',
      'White-label solution'
    ]
  }
];
