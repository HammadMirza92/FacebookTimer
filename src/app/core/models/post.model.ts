import { FacebookPage } from './facebook-page.model';
import { Template } from './template.model';

export interface Post {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  targetDate: Date;
  intervalMinutes: number;
  backgroundImageUrl: string;
  fontFamily: string;
  primaryColor: string;
  hasOverlay: boolean;
  countdownUrl: string;
  status: string;
  facebookPage?: FacebookPage;
  template?: Template;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  targetDate: Date;
  intervalMinutes: number;
  backgroundImageUrl?: string;
  fontFamily: string;
  primaryColor: string;
  hasOverlay: boolean;
  facebookPageId: number;
  templateId?: number;
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  targetDate?: Date;
  intervalMinutes?: number;
  backgroundImageUrl?: string;
  fontFamily?: string;
  primaryColor?: string;
  hasOverlay?: boolean;
}

export interface PublishPostRequest {
  baseUrl: string;
}

export interface CountdownView {
  title: string;
  description: string;
  targetDate: Date;
  intervalMinutes: number;
  backgroundImageUrl: string;
  fontFamily: string;
  primaryColor: string;
  hasOverlay: boolean;
}
