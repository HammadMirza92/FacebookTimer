import { Component } from '@angular/core';
import { FacebookService } from './test.service';

@Component({
  selector: 'app-test',
  template: `
    <div class="facebook-integration">
      <button (click)="loginWithFacebook()" *ngIf="!isLoggedIn">Connect Facebook Page</button>

      <div *ngIf="isLoggedIn && pages.length > 0">
        <h3>Select a Page to manage:</h3>
        <ul>
          <li *ngFor="let page of pages">
            <span>{{ page.name }}</span>
            <button (click)="selectPage(page)">Select</button>
          </li>
        </ul>
      </div>

      <div *ngIf="selectedPage">
        <h3>Create Post for {{ selectedPage.name }}</h3>
        <textarea [(ngModel)]="postContent" placeholder="What's on your mind?"></textarea>
        <button (click)="createPost()">Post to Facebook</button>
      </div>
    </div>
  `
})
export class TestComponent {
  isLoggedIn = false;
  pages: any[] = [];
  selectedPage: any = null;
  postContent = '';
  accessToken = '';

  constructor(private facebookService: FacebookService) {}

  loginWithFacebook(): void {
    this.facebookService.login().subscribe({
      next: (response) => {
        this.isLoggedIn = true;
        this.accessToken = response.authResponse.accessToken;
        this.getPages();
      },
      error: (error) => console.error('Login failed', error)
    });
  }

  getPages(): void {
    this.facebookService.getPages(this.accessToken).subscribe({
      next: (pages) => {
        this.pages = pages;
      },
      error: (error) => console.error('Failed to fetch pages', error)
    });
  }

  selectPage(page: any): void {
    this.selectedPage = page;
    // Store page info in your backend
    this.facebookService.storePageInfo(page).subscribe({
      next: (response) => console.log('Page info stored', response),
      error: (error) => console.error('Failed to store page info', error)
    });
  }

  createPost(): void {
    if (!this.selectedPage || !this.postContent.trim()) {
      return;
    }

    const postData = {
      message: this.postContent,
      // Add more fields as needed (link, image, etc.)
    };

    this.facebookService.createPost(
      this.selectedPage.id,
      this.selectedPage.access_token,
      postData
    ).subscribe({
      next: (response) => {
        console.log('Post created', response);
        this.postContent = '';
      },
      error: (error) => console.error('Failed to create post', error)
    });
  }
}
