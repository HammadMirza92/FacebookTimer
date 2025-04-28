import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { FacebookPage } from '../models/facebook-page.model';
import { LinkPage } from '../models/link-page.model';

@Injectable({
  providedIn: 'root'
})
export class FacebookPageService {
  private apiUrl = `${environment.apiUrl}/facebookpage`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  loginWithFacebook(): Observable<any> {
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
  linkFbPages(accessTokenFb: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/link-pages`, {
      params: { accessTokenFb }
    });
  }
  getUserPages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-user-pages`);
  }
  // getUserPages(): Observable<FacebookPage[]> {
  //   return this.http.get<FacebookPage[]>(this.apiUrl, { headers: this.getAuthHeaders() })
  //     .pipe(
  //       catchError(error => {
  //         return throwError(() => error);
  //       })
  //     );
  // }

  getPageById(id: number): Observable<FacebookPage> {
    return this.http.get<FacebookPage>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  linkFacebookPage(linkPageData: LinkPage): Observable<FacebookPage> {
    return this.http.post<FacebookPage>(`${this.apiUrl}/link`, linkPageData, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  unlinkPage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/unlinkFbPage/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
