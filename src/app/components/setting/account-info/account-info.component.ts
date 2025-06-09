// account-info.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { User, UserService } from '../user.service';

interface AccountStats {
  loginCount: number;
  securityScore: number;
  dataUsage: number;
  lastPasswordChange: Date | null;
}

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() accountUpdated = new EventEmitter<User>();

  accountForm: FormGroup;
  loading = false;
  emailReadonly = true;
  originalFormValue: any;
  accountStats: AccountStats | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.accountForm = this.createAccountForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAccountStats();
    this.storeOriginalFormValue();
  }

  /**
   * Create reactive form for account information
   */
  private createAccountForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      bio: ['', [Validators.maxLength(500)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      location: ['']
    });
  }

  /**
   * Initialize form with user data
   */
  private initializeForm(): void {
    if (this.user) {
      this.accountForm.patchValue({
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        phoneNumber: this.user.phoneNumber || '',
        bio: this.user.bio || '',
        location: this.user.location || ''
      });
    }
  }

  /**
   * Store original form value for comparison
   */
  private storeOriginalFormValue(): void {
    this.originalFormValue = { ...this.accountForm.value };
  }

  /**
   * Check if form has changes
   */
  hasChanges(): boolean {
    if (!this.originalFormValue) return false;

    const currentValue = this.accountForm.value;
    return JSON.stringify(this.originalFormValue) !== JSON.stringify(currentValue);
  }

  /**
   * Get form controls for easy access in template
   */
  get f() {
    return this.accountForm.controls;
  }

  /**
   * Get bio character count
   */
  getBioCharacterCount(): number {
    return this.f['bio'].value?.length || 0;
  }

  /**
   * Get days since registration
   */
  getDaysSinceRegistration(): number {
    if (!this.user?.registrationDate) return 0;

    const today = new Date();
    const registrationDate = new Date(this.user.registrationDate);
    const diffTime = Math.abs(today.getTime() - registrationDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get formatted last login time
   */
  getLastLoginFormatted(): string {
    if (!this.user?.lastLoginDate) return 'Never';

    const now = new Date();
    const lastLogin = new Date(this.user.lastLoginDate);
    const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return lastLogin.toLocaleDateString();
  }

  /**
   * Load account statistics
   */
  private loadAccountStats(): void {
    this.userService.getAccountStats().subscribe({
      next: (stats) => {
        this.accountStats = stats;
      },
      error: (error) => {
        console.error('Error loading account stats:', error);
        // Use default stats if API fails
        this.accountStats = {
          loginCount: 0,
          securityScore: 75,
          dataUsage: 0,
          lastPasswordChange: null
        };
      }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.hasChanges()) {
      this.notificationService.showInfo('No changes to save');
      return;
    }

    this.loading = true;

    const updateData = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      phoneNumber: this.f['phoneNumber'].value || null,
      bio: this.f['bio'].value || null,
      website: this.f['website'].value || null,
      location: this.f['location'].value || null
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.showSuccess('Account information updated successfully');

        // Update the user object with new data
        if (this.user) {
          const updatedUser: User = {
            ...this.user,
            ...updateData
          };
          this.accountUpdated.emit(updatedUser);
        }

        this.storeOriginalFormValue();
      },
      error: (error) => {
        this.loading = false;
        console.error('Profile update error:', error);

        let errorMessage = 'Failed to update account information';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors?.length > 0) {
          errorMessage = error.error.errors[0];
        }

        this.notificationService.showError(errorMessage);
      }
    });
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.initializeForm();
    this.storeOriginalFormValue();
  }

  /**
   * Handle reset action
   */
  onReset(): void {
    this.initializeForm();
    this.notificationService.showInfo('Form reset to original values');
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.accountForm.controls).forEach(key => {
      const control = this.accountForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Open change email dialog
   */
  openChangeEmailDialog(): void {
    // In a real application, you would open a dialog component
    // For now, we'll navigate to a separate change email flow
    this.notificationService.showInfo('Email change functionality coming soon');
  }

  /**
   * Resend email verification
   */
  resendEmailVerification(): void {
    this.userService.resendEmailVerification().subscribe({
      next: () => {
        this.notificationService.showSuccess('Verification email sent successfully');
      },
      error: (error) => {
        console.error('Email verification error:', error);
        this.notificationService.showError('Failed to send verification email');
      }
    });
  }

  /**
   * Verify phone number
   */
  verifyPhoneNumber(): void {
    const phoneNumber = this.f['phoneNumber'].value;
    if (!phoneNumber) {
      this.notificationService.showError('Please enter a phone number first');
      return;
    }

    this.userService.sendPhoneVerification(phoneNumber).subscribe({
      next: () => {
        this.notificationService.showSuccess('Verification code sent to your phone');
        // Open verification dialog or navigate to verification page
      },
      error: (error) => {
        console.error('Phone verification error:', error);
        this.notificationService.showError('Failed to send verification code');
      }
    });
  }

  /**
   * Download account data
   */
  downloadAccountData(): void {
    this.userService.downloadAccountData().subscribe({
      next: (data) => {
        // Create and download the file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facebook-scheduler-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.notificationService.showSuccess('Account data downloaded successfully');
      },
      error: (error) => {
        console.error('Data download error:', error);
        this.notificationService.showError('Failed to download account data');
      }
    });
  }

  /**
   * Open delete account dialog
   */
  openDeleteAccountDialog(): void {
    // In a real application, you would open a confirmation dialog
    // For now, we'll show a warning message
    this.notificationService.showWarning('Account deletion functionality requires additional confirmation steps');
  }

  /**
   * Validate website URL format
   */
  validateWebsite(): void {
    const website = this.f['website'].value;
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      this.f['website'].setValue(`https://${website}`);
    }
  }

  /**
   * Format phone number as user types
   */
  formatPhoneNumber(): void {
    let phoneNumber = this.f['phoneNumber'].value;
    if (phoneNumber) {
      // Remove all non-numeric characters except +
      phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
      this.f['phoneNumber'].setValue(phoneNumber);
    }
  }

  /**
   * Copy email to clipboard
   */
  copyEmail(): void {
    if (this.user?.email) {
      navigator.clipboard.writeText(this.user.email).then(() => {
        this.notificationService.showSuccess('Email copied to clipboard');
      }).catch(() => {
        this.notificationService.showError('Failed to copy email');
      });
    }
  }

  /**
   * Check if user has premium subscription
   */
  hasPremiumSubscription(): boolean {
    return this.user?.currentSubscription?.isActive ?? false;
  }

  /**
   * Calculate security score based on profile completeness
   */
  calculateSecurityScore(): number {
    if (!this.user) return 0;

    let score = 0;
    const maxScore = 100;

    // Email verified (25 points)
    if (this.user.emailConfirmed) score += 25;

    // Phone verified (20 points)
    if (this.user.phoneNumberConfirmed) score += 20;

    // Profile complete (25 points)
    const profileFields = [this.user.firstName, this.user.lastName, this.user.bio, this.user.location];
    const completedFields = profileFields.filter(field => field && field.trim().length > 0).length;
    score += (completedFields / profileFields.length) * 25;

    // Two-factor authentication (30 points)
    if (this.user.twoFactorEnabled) score += 30;

    return Math.round(score);
  }
}
