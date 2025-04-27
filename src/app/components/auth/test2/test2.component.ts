// src/app/components/facebook-pages/facebook-pages.component.ts
import { Component, OnInit } from '@angular/core';
import { FacebookService } from '../test/test.service';

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks: string[];
}

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.scss']
})
export class Test2Component implements OnInit {
  pages: FacebookPage[] = [];
  selectedPage: FacebookPage | null = null;
  postContent: string = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private facebookService: FacebookService) {}

  ngOnInit(): void {
    // Check if we have a token in session storage
    const token = localStorage.getItem('fb_access_token');
    if (token) {
      this.fetchPages(token);
    }
  }

  fetchPages(token: string): void {
    this.loading = true;
    this.error = null;

    this.facebookService.getPages(token).subscribe({
      next: (response) => {
        this.pages = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching pages', err);
        this.error = 'Failed to load Facebook pages. Please try again.';
        this.loading = false;
      }
    });
  }

  selectPage(page: FacebookPage): void {
    this.selectedPage = page;

    // Store the page info in your backend
    this.facebookService.storePageInfo(page).subscribe({
      next: () => {
        this.success = `Connected to ${page.name} page successfully!`;
      },
      error: (err) => {
        console.error('Error storing page info', err);
        this.error = 'Failed to connect to the selected page.';
      }
    });
  }

  createPost(): void {
    if (!this.selectedPage || !this.postContent.trim()) {
      this.error = 'Please enter post content';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const postData = {
      message: this.postContent,
      // Add other post options like link, image etc.
    };

    this.facebookService.createPost(
      this.selectedPage.id,
      this.selectedPage.access_token,
      postData
    ).subscribe({
      next: (response) => {
        this.success = 'Post created successfully!';
        this.postContent = '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating post', err);
        this.error = 'Failed to create post. Please try again.';
        this.loading = false;
      }
    });
  }
}
