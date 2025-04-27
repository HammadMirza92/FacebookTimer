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
  id: number;
  pageId: string;
  pageName: string;
  accessToken: string;
  category: string;
  createdAt: Date;
  tokenExpiryDate: Date;
  tasks?: string[];
  isActive: boolean;
}
