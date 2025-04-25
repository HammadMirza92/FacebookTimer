export interface Template {
  id: number;
  name: string;
  description: string;
  previewImageUrl: string;
  backgroundImageUrl: string;
  fontFamily: string;
  primaryColor: string;
  hasOverlay: boolean;
  category: string;
  minimumSubscription: string;
}
