import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FacebookPageService } from '../../services/facebook-page.service';
import { PostService } from '../../services/post.service';
import { TemplateService } from '../../services/template.service';
import { User } from '../../models/user.model';
import { FacebookPage } from '../../models/facebook-page.model';
import { Post, PostStatus } from '../../models/post.model';
import { Template } from '../../models/template.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  pages: FacebookPage[] = [];
  templates: Template[] = [];
  recentPosts: Post[] = [];
  loading = true;
  postStatusEnum = PostStatus;
  hasFacebookPages = false;

  constructor(
    private authService: AuthService,
    private facebookPageService: FacebookPageService,
    private postService: PostService,
    private templateService: TemplateService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load Facebook pages separately to handle its specific logic
    const tokenfb = localStorage.getItem('fb_access_token');
    if(tokenfb){
      this.facebookPageService.linkFbPages(tokenfb).subscribe({
        next: (pages) => {
          this.pages = pages;
          this.hasFacebookPages = this.pages.length > 0;
        },
        error: (error) => {
          console.error('Error loading Facebook pages:', error);
        }
      });
    }

    forkJoin({
      posts: this.postService.getUserPosts(),
      templates: this.templateService.getTemplates()
    }).subscribe({
      next: result => {
        this.recentPosts = result.posts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5); // Get most recent 5 posts
        this.templates = result.templates;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  createNewPost(): void {
    this.router.navigate(['/posts/create']);
  }

  viewAllPosts(): void {
    this.router.navigate(['/posts']);
  }

  linkFacebookPage(): void {
    this.router.navigate(['/facebook-pages']);
  }

  manageFacebookPages(): void {
    this.router.navigate(['/facebook-pages']);
  }

  viewAllTemplates(): void {
    this.router.navigate(['/templates']);
  }

  getPostStatusClass(status: PostStatus): string {
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
}
