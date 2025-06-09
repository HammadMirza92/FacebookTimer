import { Component, OnInit } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { NotificationService } from '../../../services/notification.service';
import { Post, PostStatus } from '../../../models/post.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../mat-and-snackbar/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  loading = true;
  searchTerm = '';
  filterStatus = 'all';
  sortOrder = 'newest';
  postStatusEnum = PostStatus;

  constructor(
    private postService: PostService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getUserPosts().subscribe({
      next: posts => {
        this.posts = posts;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Failed to load posts. Please try again later.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.posts];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term) ||
        post.facebookPageName.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === this.filterStatus);
    }

    // Apply sort order
    if (this.sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.sortOrder === 'event-nearest') {
      filtered.sort((a, b) => new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime());
    } else if (this.sortOrder === 'event-furthest') {
      filtered.sort((a, b) => new Date(b.eventDateTime).getTime() - new Date(a.eventDateTime).getTime());
    }

    this.filteredPosts = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  createNewPost(): void {
    this.router.navigate(['/posts/create']);
  }

  editPost(post: Post): void {
    this.router.navigate(['/posts/edit', post.id]);
  }

  publishPost(post: Post): void {
    this.postService.publishPost(post.id).subscribe({
      next: result => {
        if (result.success) {
          this.notificationService.showSuccess('Post published successfully!');
          this.loadPosts();
        } else {
          this.notificationService.showError(result.errorMessage || 'Failed to publish post');
        }
      },
      error: error => {
        this.notificationService.showError(error.error || 'Failed to publish post');
      }
    });
  }

  cancelPost(post: Post): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Scheduled Post',
        message: 'Are you sure you want to cancel this scheduled post? This action cannot be undone.',
        confirmText: 'Cancel Post',
        cancelText: 'Keep Scheduled',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postService.cancelPost(post.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Post has been canceled');
            this.loadPosts();
          },
          error: error => {
            this.notificationService.showError(error.error || 'Failed to cancel post');
          }
        });
      }
    });
  }

  deletePost(post: Post): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postService.deletePost(post.id).subscribe({
          next: (result) => {
            if(result.warning){
              this.notificationService.showSuccess(result.warning,5000);
            } else {
              this.notificationService.showSuccess('Post has been deleted');
            }

            this.loadPosts();
          },
          error: error => {
            this.notificationService.showError(error.error || 'Failed to delete post');
          }
        });
      }
    });
  }

  viewOnFacebook(postId: string): void {
    window.open(`https://www.facebook.com/${postId}`, '_blank');
  }

  getStatusClass(status: PostStatus): string {
    switch (status) {
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

  canPublish(post: Post): boolean {
    return post.status === PostStatus.Draft;
  }

  canCancel(post: Post): boolean {
    return post.status === PostStatus.Scheduled;
  }

  canEdit(post: Post): boolean {
    return post.status === PostStatus.Draft || post.status === PostStatus.Scheduled;
  }

  canDelete(post: Post): boolean {
    return post.status !== PostStatus.Published;
  }
}
