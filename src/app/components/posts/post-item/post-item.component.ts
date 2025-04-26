import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post, PostStatus } from '../../../models/post.model';

@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.scss']
})
export class PostItemComponent {
  @Input() post: Post;
  @Output() edit = new EventEmitter<Post>();
  @Output() publish = new EventEmitter<Post>();
  @Output() cancel = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<Post>();
  @Output() viewOnFacebook = new EventEmitter<string>();

  postStatusEnum = PostStatus;

  constructor() { }

  onEdit(): void {
    this.edit.emit(this.post);
  }

  onPublish(): void {
    this.publish.emit(this.post);
  }

  onCancel(): void {
    this.cancel.emit(this.post);
  }

  onDelete(): void {
    this.delete.emit(this.post);
  }

  onViewOnFacebook(): void {
    if (this.post.facebookPostId) {
      this.viewOnFacebook.emit(this.post.facebookPostId);
    }
  }

  getStatusClass(): string {
    switch (this.post.status) {
      case PostStatus.Draft:
        return 'status-draft';
      case PostStatus.Scheduled:
        return 'status-scheduled';
      case PostStatus.Published:
        return 'status-published';
      case PostStatus.Failed:
        return 'status-failed';
      case PostStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  canPublish(): boolean {
    return this.post.status === PostStatus.Draft;
  }

  canCancel(): boolean {
    return this.post.status === PostStatus.Scheduled;
  }

  canEdit(): boolean {
    return this.post.status === PostStatus.Draft || this.post.status === PostStatus.Scheduled;
  }

  canDelete(): boolean {
    return this.post.status !== PostStatus.Published;
  }
}
