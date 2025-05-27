import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { Post } from '../models/post.model';
import { CreatePost } from '../models/create-post.model';
import { UpdatePost } from '../models/update-post.model';

// Updated PublishResult interface to match the new API response
export interface PublishResult {
  success: boolean;
  facebookPostId?: string;
  message?: string;
  errorMessage?: string;
}

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
          console.error('Error fetching user posts:', error);
          return throwError(() => error);
        })
      );
  }

  getPagePosts(pageId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/page/${pageId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching page posts:', error);
          return throwError(() => error);
        })
      );
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching post by ID:', error);
          return throwError(() => error);
        })
      );
  }

  createPost(createPostData: any): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, createPostData)
      .pipe(
        catchError(error => {
          console.error('Error creating post:', error);
          return throwError(() => error);
        })
      );
  }

  updatePost(id: number, updatePostData: UpdatePost): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, updatePostData)
      .pipe(
        catchError(error => {
          console.error('Error updating post:', error);
          return throwError(() => error);
        })
      );
  }

  publishPost(id: number): Observable<PublishResult> {
    return this.http.post<PublishResult>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(
        catchError(error => {
          console.error('Error publishing post:', error);
          // Handle different error response formats
          const errorResponse = error.error || error;
          return throwError(() => ({
            success: false,
            errorMessage: errorResponse.errorMessage || errorResponse.message || 'Failed to publish post'
          }));
        })
      );
  }

  cancelPost(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(
        catchError(error => {
          console.error('Error canceling post:', error);
          return throwError(() => error);
        })
      );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting post:', error);
          return throwError(() => error);
        })
      );
  }
}
