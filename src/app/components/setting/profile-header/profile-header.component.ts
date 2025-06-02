// profile-header.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { User, UserStats } from '../setting.component';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent {
  @Input() user: User | null = null;
  @Input() userStats: UserStats | null = null;
  @Output() profileUpdated = new EventEmitter<User>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;

  avatarUploading = false;
  coverUploading = false;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  /**
   * Get user initials for avatar
   */
  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return 'U';

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Get cover photo URL or default gradient
   */
  getCoverPhotoUrl(): string {
    // You can extend this to support custom cover photos
    return 'linear-gradient(135deg, #1877f2 0%, #42a5f5 50%, #8b5cf6 100%)';
  }

  /**
   * Trigger avatar change
   */
  changeAvatar(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Trigger cover photo change
   */
  changeCoverPhoto(): void {
    this.coverInput.nativeElement.click();
  }

  /**
   * Handle avatar file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.uploadAvatar(file);
    }
  }

  /**
   * Handle cover photo file selection
   */
  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.uploadCoverPhoto(file);
    }
  }

  /**
   * Upload avatar image
   */
  private uploadAvatar(file: File): void {
    // Validate file
    if (!this.validateImageFile(file)) {
      return;
    }

    this.avatarUploading = true;

    this.userService.uploadAvatar(file).subscribe({
      next: (response:any) => {
        this.avatarUploading = false;

        if (this.user) {
          const updatedUser = { ...this.user, photoURL: response.photoURL };
          this.profileUpdated.emit(updatedUser);
          this.notificationService.showSuccess('Profile picture updated successfully');
        }
      },
      error: (error:any) => {
        this.avatarUploading = false;
        console.error('Avatar upload error:', error);
        this.notificationService.showError('Failed to upload profile picture');
      }
    });
  }

  /**
   * Upload cover photo
   */
  private uploadCoverPhoto(file: File): void {
    // Validate file
    if (!this.validateImageFile(file)) {
      return;
    }

    this.coverUploading = true;

    this.userService.uploadCoverPhoto(file).subscribe({
      next: (response:any) => {
        this.coverUploading = false;
        this.notificationService.showSuccess('Cover photo updated successfully');
        // Handle cover photo update logic here
      },
      error: (error:any) => {
        this.coverUploading = false;
        console.error('Cover photo upload error:', error);
        this.notificationService.showError('Failed to upload cover photo');
      }
    });
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: File): boolean {
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.notificationService.showError('Please select a valid image file');
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.notificationService.showError('Image size must be less than 5MB');
      return false;
    }

    return true;
  }

  /**
   * Edit profile action
   */
  editProfile(): void {
    // Navigate to account info tab
    this.router.navigate(['/settings'], { queryParams: { tab: 'account-info' } });
  }

  /**
   * Open settings action
   */
  openSettings(): void {
    // Navigate to security settings tab
    this.router.navigate(['/settings'], { queryParams: { tab: 'security-settings' } });
  }

  /**
   * Create new post action
   */
  createNewPost(): void {
    this.router.navigate(['/posts/create']);
  }

  /**
   * View analytics action
   */
  viewAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  /**
   * Manage schedule action
   */
  manageSchedule(): void {
    this.router.navigate(['/posts'], { queryParams: { view: 'schedule' } });
  }

  /**
   * Open advanced settings
   */
  openAdvancedSettings(): void {
    this.router.navigate(['/settings'], { queryParams: { tab: 'security-settings' } });
  }
}
