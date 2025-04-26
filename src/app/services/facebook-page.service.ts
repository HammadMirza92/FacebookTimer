import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getUserPages(): Observable<FacebookPage[]> {
    return this.http.get<FacebookPage[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getPageById(id: number): Observable<FacebookPage> {
    return this.http.get<FacebookPage>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  linkFacebookPage(linkPageData: LinkPage): Observable<FacebookPage> {
    return this.http.post<FacebookPage>(`${this.apiUrl}/link`, linkPageData)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  unlinkPage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
