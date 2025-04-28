import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  linkSuccessMessage = '';

  constructor(
    private facebookPageService: FacebookPageService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages(): void {
    this.loading = true;
    this.changeDetectorRef.detectChanges(); // Force update UI

    const token = localStorage.getItem('fb_access_token');
    if (token) {
      this.accessToken = token;
      this.isLoggedIn = true;
      this.getPages();
    } else {
      this.loading = false;
      this.changeDetectorRef.detectChanges(); // Force update UI
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
        this.changeDetectorRef.detectChanges(); // Force update UI
      }
    });
  }

  getPages(): void {
    this.loading = true;
    this.changeDetectorRef.detectChanges(); // Force update UI

    this.facebookPageService.linkFbPages(this.accessToken)
      .subscribe({
        next: (response) => {
          // Process the API response format with the new structure
          if (response && response.pages) {
            this.pages = response.pages;
            this.linkSuccessMessage = response.message;

            // Save linked pages to local storage
            this.savePagesToStorage();

            // Update loading state before showing notification
            this.loading = false;
            this.changeDetectorRef.detectChanges(); // Force update UI

            // Show notification after UI update
            this.notificationService.showSuccess(this.linkSuccessMessage || 'Facebook pages linked successfully');
          } else {
            this.pages = [];
            this.loading = false;
            this.changeDetectorRef.detectChanges(); // Force update UI
            this.notificationService.showError('No Facebook pages found.');
          }
        },
        error: (error) => {
          console.error('Failed to fetch pages', error);
          this.loading = false;
          this.changeDetectorRef.detectChanges(); // Force update UI
          this.notificationService.showError('Failed to fetch Facebook pages');
        }
      });
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
    // Force a short delay to ensure component is fully initialized
    setTimeout(() => {
      try {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: 'Unlink Facebook Page',
            message: `Are you sure you want to unlink "${page.pageName}"? Any scheduled posts for this page will be canceled.`,
            confirmText: 'Unlink',
            cancelText: 'Cancel',
            color: 'warn'
          },
          // Add this to ensure dialog is properly styled and positioned
          panelClass: 'confirm-dialog-container',
          disableClose: false
        });

        // Use changeDetectorRef to ensure UI updates
        this.changeDetectorRef.detectChanges();

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loading = true;
            this.changeDetectorRef.detectChanges();

            console.log(`Unlinking page with ID: ${page.pageId}`);

            this.facebookPageService.unlinkPage(page.pageId).subscribe({
              next: () => {
                this.notificationService.showSuccess(`Successfully unlinked ${page.pageName}`);

                // Fix the filter to use pageId for consistency
                this.pages = this.pages.filter(p => p.pageId !== page.pageId);

                this.savePagesToStorage();
                this.loading = false;
                this.changeDetectorRef.detectChanges();
              },
              error: error => {
                console.error('Failed to unlink page:', error);
                this.loading = false;
                this.changeDetectorRef.detectChanges();
                this.notificationService.showError(error.error || 'Failed to unlink page');
              }
            });
          }
        });
      } catch (error) {
        console.error('Error opening dialog:', error);
        this.notificationService.showError('Failed to open confirmation dialog');
      }
    }, 100); // Small delay to ensure component is ready
  }
  getDaysRemaining(expiryDate: Date): number {
    if (!expiryDate) return 0;

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
