export enum PostStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed',
  Cancelled = 'Cancelled'
}

export interface Post {
  id: number;
  facebookPageId: number;
  facebookPageName: string;
  templateId: number;
  templateName: string;
  title: string;
  description: string;
  eventDateTime: Date;
  customFontFamily?: string;
  customPrimaryColor?: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  backgroundImageUrl?: string;
  hasOverlay: boolean;
  createdAt: Date;
  updatedAt?: Date;
  facebookPostId?: string;
  status: PostStatus;
  publishedAt?: Date;
  scheduledFor?: Date;
  refreshIntervalInMinutes: number;
  countdownPublicId?: string;
}
