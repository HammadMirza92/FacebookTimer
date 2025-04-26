import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FacebookPageService } from '../../../services/facebook-page.service';
import { NotificationService } from '../../../services/notification.service';
import { FacebookPage } from '../../../models/facebook-page.model';
import { LinkFacebookPageComponent } from '../link-facebook-page/link-facebook-page.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-facebook-pages',
  templateUrl: './facebook-pages.component.html',
  styleUrls: ['./facebook-pages.component.scss']
})
export class FacebookPagesComponent implements OnInit {
  pages: FacebookPage[] = [];
  loading = true;

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
    this.facebookPageService.getUserPages().subscribe({
      next: pages => {
        this.pages = pages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openLinkPageDialog(): void {
    const dialogRef = this.dialog.open(LinkFacebookPageComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPages();
      }
    });
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
            this.loadPages();
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
