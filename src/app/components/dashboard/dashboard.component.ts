import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FacebookPageService } from '../../services/facebook-page.service';
import { PostService } from '../../services/post.service';
import { TemplateService } from '../../services/template.service';
import { User } from '../../models/user.model';
import { FacebookPage } from '../../models/facebook-page.model';
import { Post, PostStatus } from '../../models/post.model';
import { Template } from '../../models/template.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/services/notification.service';

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
  contentIdeas: string[] = [];
private predefinedIdeas: string[] = [
    "Share a 'behind-the-scenes' look at your recent project.",
    "Ask your audience a 'fill-in-the-blank' question related to your niche.",
    "Create a short video tutorial or a quick tip series.",
    "Post a 'this or that' poll to boost engagement.",
    "Share a personal anecdote related to your industry and ask for similar stories.",
    "Highlight a customer success story or testimonial.",
    "Do a 'throwback Thursday' with an old post that performed well.",
    "Share a valuable resource or tool you use and explain why.",
    "Host a live Q&A session on a trending topic.",
    "Create a 'did you know?' fact about your product/service or industry.",
    "Run a mini-challenge for your followers (e.g., 5-day challenge).",
    "Share an inspiring quote and elaborate on its meaning for your audience."
  ];
  constructor(
    private authService: AuthService,
    private _snackBar: NotificationService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
   setTimeout(() => {
      this.loading = false;
      this.generateContentIdeas(); // Generate initial ideas after loading
    }, 1500); // Simulate network delay
  }
generateContentIdeas(): void {
    const shuffled = [...this.predefinedIdeas].sort(() => 0.5 - Math.random());
    this.contentIdeas = shuffled.slice(0, Math.floor(Math.random() * 2) + 3); // Get 3 to 4 random ideas
    console.log('Generated content ideas:', this.contentIdeas);
    this._snackBar.showSuccess('New content ideas generated!');
  }
copyIdeaToClipboard(idea: string): void {
    navigator.clipboard.writeText(idea).then(() => {
      this._snackBar.showSuccess('Idea copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      this._snackBar.showSuccess('Failed to copy idea.');
    });
  }
viewInspirationHub(): void {
    console.log('View Inspiration Hub clicked!');
    // Implement navigation to a dedicated content inspiration page/route
    this._snackBar.showSuccess('Navigating to Inspiration Hub (feature coming soon)!');
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
