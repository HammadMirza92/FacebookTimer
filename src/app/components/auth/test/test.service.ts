import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacebookService {
  private apiUrl = 'https://localhost:7101/api';

  constructor(private http: HttpClient) {}

  login(): Observable<any> {
    return new Observable(observer => {
      // Ensure FB SDK is loaded
      if (!window.FB) {
        observer.error('Facebook SDK not loaded');
        return;
      }

      window.FB.login((response) => {
        if (response.authResponse) {
          localStorage.setItem('fb_access_token', response.authResponse.accessToken);
          localStorage.setItem('fbUSerId', response.authResponse.userID);
          observer.next(response);
          observer.complete();
        } else {
          observer.error('User cancelled login or did not fully authorize');
        }
      }, { scope: 'pages_read_engagement,pages_manage_posts,pages_show_list' });
    });
  }

  getLoginStatus(): Observable<any> {
    return new Observable(observer => {
      window.FB.getLoginStatus((response) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  getPages(accessToken: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/FacebookPage/get-pages`, {
      params: { accessToken }
    });
  }

  storePageInfo(pageInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/store-page-info`, pageInfo);
  }

  createPost(pageId: string, pageAccessToken: string, postContent: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-post`, {
      pageId,
      pageAccessToken,
      postContent
    });
  }
}
