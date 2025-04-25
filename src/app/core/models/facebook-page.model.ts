export interface FacebookPage {
  id: number;
  facebookPageId: string;
  pageName: string;
  profilePictureUrl: string;
}

export interface LinkPageRequest {
  pageId: string;
  accessToken: string;
}
