import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FacebookPageService } from '../../../services/facebook-page.service';
import { NotificationService } from '../../../services/notification.service';
import { FacebookPage } from '../../../models/facebook-page.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-facebook-pages',
  templateUrl: './facebook-pages.component.html',
  styleUrls: ['./facebook-pages.component.scss']
})
export class FacebookPagesComponent implements OnInit {
  pages: FacebookPage[] = [];
  loading = true;
  isLoggedIn = false;
  accessToken = '';

  constructor(
    private facebookPageService: FacebookPageService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages(): void {
    this.loading = true;
    const token = localStorage.getItem('fb_access_token');
    if (token) {
      this.accessToken = token;
      this.isLoggedIn = true;
      this.getPages();
    } else {
      this.loading = false;
    }
  }

  loginWithFacebook(): void {
    this.facebookPageService.loginWithFacebook().subscribe({
      next: (response) => {
        this.isLoggedIn = true;
        this.accessToken = response.authResponse.accessToken;
        localStorage.setItem('fb_access_token', this.accessToken);
        this.getPages();
      },
      error: (error) => {
        console.error('Login failed', error);
        this.notificationService.showError('Failed to login with Facebook');
        this.loading = false;
      }
    });
  }

  getPages(): void {
    this.loading = true;
    this.facebookPageService.getUserPages(this.accessToken).subscribe({
      next: (response) => {
        // Process the Facebook API response format
        if (response && response.data) {
          this.pages = response.data.map((page: { id: any; name: any; access_token: any; category: any; tasks: any; }) => {
            // Transform Facebook API response format to our FacebookPage model
            return {
              id: this.generateLocalId(), // Generate a local ID for the page entry
              pageId: page.id,
              pageName: page.name,
              accessToken: page.access_token,
              category: page.category,
              createdAt: new Date(),
              tokenExpiryDate: this.calculateTokenExpiry(), // Set default expiry (60 days from now)
              tasks: page.tasks || []
            } as any;
          });

          // Save linked pages to local storage or your backend
          this.savePagesToStorage();

          this.notificationService.showSuccess('Facebook pages linked successfully');
        } else {
          this.pages = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch pages', error);
        this.notificationService.showError('Failed to fetch Facebook pages');
        this.loading = false;
      }
    });
  }

  // Generate a simple unique ID for local use
  private generateLocalId(): string {
    return 'page_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
  }

  // Calculate token expiry date (Facebook tokens typically last 60 days)
  private calculateTokenExpiry(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 60); // Default to 60 days
    return expiryDate;
  }

  // Save pages to storage (localStorage for demo, should be backend in production)
  private savePagesToStorage(): void {
    try {
      localStorage.setItem('linked_fb_pages', JSON.stringify(this.pages));
    } catch (error) {
      console.error('Error saving pages to storage', error);
    }
  }

  unlinkPage(page: FacebookPage): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unlink Facebook Page',
        message: `Are you sure you want to unlink "${page.pageName}"? Any scheduled posts for this page will be canceled.`,
        confirmText: 'Unlink',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.facebookPageService.unlinkPage(page.id).subscribe({
          next: () => {
            this.notificationService.showSuccess(`Successfully unlinked ${page.pageName}`);
            // Remove page from local array
            this.pages = this.pages.filter(p => p.id !== page.id);
            // Update storage
            this.savePagesToStorage();
          },
          error: error => {
            this.notificationService.showError(error.error || 'Failed to unlink page');
          }
        });
      }
    });
  }

  getDaysRemaining(expiryDate: Date): number {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isTokenExpiringSoon(expiryDate: Date): boolean {
    return this.getDaysRemaining(expiryDate) <= 7;
  }

  openFacebookPage(pageId: string): void {
    window.open(`https://www.facebook.com/${pageId}`, '_blank');
  }
}
