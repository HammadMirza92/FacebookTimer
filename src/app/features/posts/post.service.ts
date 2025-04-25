import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PublishPostRequest,
  CountdownView
} from '../../core/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private apiService: ApiService) { }

  getUserPosts(): Observable<Post[]> {
    return this.apiService.get<Post[]>('posts');
  }

  getPost(id: number): Observable<Post> {
    return this.apiService.get<Post>(`posts/${id}`);
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    return this.apiService.post<Post, CreatePostRequest>('posts', request);
  }

  updatePost(id: number, request: UpdatePostRequest): Observable<void> {
    return this.apiService.put<void, UpdatePostRequest>(`posts/${id}`, request);
  }

  deletePost(id: number): Observable<void> {
    return this.apiService.delete<void>(`posts/${id}`);
  }

  publishPost(id: number, baseUrl: string): Observable<void> {
    const request: PublishPostRequest = { baseUrl };
    return this.apiService.post<void, PublishPostRequest>(`posts/${id}/publish`, request);
  }

  getCountdown(urlSegment: string): Observable<CountdownView> {
    return this.apiService.get<CountdownView>(`posts/countdown/${urlSegment}`);
  }
}
