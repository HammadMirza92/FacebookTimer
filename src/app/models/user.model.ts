export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationDate: Date;
  lastLoginDate?: Date;
  isActive: boolean;
  currentSubscription?: UserSubscription;
}
