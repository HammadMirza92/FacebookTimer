export interface User {
  id: number;
  username: string;
  email: string;
  subscriptionType: string;
  subscriptionEndDate?: Date;
  daysUntilExpiration: number;
  linkedPagesCount: number;
  postsRemainingToday: number;
}
