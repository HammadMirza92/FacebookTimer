export interface FacebookPageResponse {
  data: {
    access_token: string;
    category: string;
    category_list: {
      id: string;
      name: string;
    }[];
    name: string;
    id: string;
    tasks: string[];
  }[];
  paging: {
    cursors: {
      before: string;
      after: string;
    }
  }
}
export interface FacebookPage {
  id: number;           // Local ID for the database entry
  pageId: string;       // Facebook page ID
  pageName: string;     // Facebook page name
  accessToken: string;  // Page access token
  category: string;     // Page category
  createdAt: Date;      // When this page was linked
  tokenExpiryDate: Date; // When the token expires
  tasks?: string[];     // Available tasks for this page
}
