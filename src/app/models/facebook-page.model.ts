export interface FacebookPage {
  id: number;
  pageId: string;
  pageName: string;
  tokenExpiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
