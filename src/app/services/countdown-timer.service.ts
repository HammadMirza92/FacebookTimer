import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { PostPreview } from '../models/post-preview.model';

@Injectable({
  providedIn: 'root'
})
export class CountdownTimerService {
  private apiUrl = `${environment.apiUrl}/countdowntimer`;

  constructor(private http: HttpClient) { }

  getTimerForPost(postId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/post/${postId}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getPublicTimer(publicId: string): Observable<PostPreview> {
    return this.http.get<PostPreview>(`${this.apiUrl}/public/${publicId}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
