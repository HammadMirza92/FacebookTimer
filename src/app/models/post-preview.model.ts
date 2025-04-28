export interface PostPreview {
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
  fontSize: number;
}
