import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { Post } from '../models/post.model';
import { CreatePost } from '../models/create-post.model';
import { UpdatePost } from '../models/update-post.model';
import { PublishResult } from '../models/publish-result.model';
import { PostPreview } from '../models/post-preview.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/post`;

  constructor(private http: HttpClient) { }

  getUserPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getPagePosts(pageId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/page/${pageId}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  createPost(createPostData: CreatePost): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, createPostData)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  updatePost(id: number, updatePostData: UpdatePost): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, updatePostData)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  publishPost(id: number): Observable<PublishResult> {
    return this.http.post<PublishResult>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  cancelPost(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
