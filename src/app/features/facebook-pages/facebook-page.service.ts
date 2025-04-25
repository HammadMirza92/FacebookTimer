import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { FacebookPage, LinkPageRequest } from '../../core/models/facebook-page.model';
import { Post } from '../../core/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class FacebookPageService {
  constructor(private apiService: ApiService) { }

  getUserPages(): Observable<FacebookPage[]> {
    return this.apiService.get<FacebookPage[]>('users/pages');
  }

  linkPage(request: LinkPageRequest): Observable<FacebookPage> {
    return this.apiService.post<FacebookPage, LinkPageRequest>('facebookpages/link', request);
  }

  unlinkPage(pageId: number): Observable<void> {
    return this.apiService.delete<void>(`facebookpages/${pageId}`);
  }

  getPagePosts(pageId: number): Observable<Post[]> {
    return this.apiService.get<Post[]>(`facebookpages/${pageId}/posts`);
  }
}
