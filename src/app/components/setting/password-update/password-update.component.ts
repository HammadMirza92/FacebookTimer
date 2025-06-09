// password-update.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';

interface PasswordValidation {
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface PasswordHistoryItem {
  date: Date;
  description: string;
  success: boolean;
}

@Component({
  selector: 'app-password-update',
  templateUrl: './password-update.component.html',
  styleUrls: ['./password-update.component.scss']
})
export class PasswordUpdateComponent implements OnInit {
  @Output() passwordChanged = new EventEmitter<boolean>();

  passwordForm: FormGroup;
  loading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  passwordValidation: PasswordValidation = {
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  passwordHistory: PasswordHistoryItem[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.setupPasswordValidation();
    this.loadPasswordHistory();
  }

  /**
   * Create reactive form for password change
   */
  private createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmNewPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  /**
   * Setup real-time password validation
   */
  private setupPasswordValidation(): void {
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      if (password) {
        this.validatePassword(password);
      } else {
        this.resetPasswordValidation();
      }
    });
  }

  /**
   * Custom validator for password strength
   */
  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;

    if (!password) {
      return null;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const hasLength = password.length >= 8;

    const isValid = hasUpper && hasLower && hasNumber && hasSpecial && hasLength;

    return isValid ? null : { passwordStrength: true };
  }

  /**
   * Custom validator for password match
   */
  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmNewPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Validate password and update validation object
   */
  private validatePassword(password: string): void {
    this.passwordValidation = {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    };
  }

  /**
   * Reset password validation
   */
  private resetPasswordValidation(): void {
    this.passwordValidation = {
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    };
  }

  /**
   * Get password strength class for styling
   */
  getPasswordStrengthClass(): string {
    const validCount = Object.values(this.passwordValidation).filter(Boolean).length;

    if (validCount <= 2) return 'weak';
    if (validCount <= 3) return 'fair';
    if (validCount <= 4) return 'good';
    return 'strong';
  }

  /**
   * Get password strength text
   */
  getPasswordStrengthText(): string {
    const validCount = Object.values(this.passwordValidation).filter(Boolean).length;

    if (validCount <= 2) return 'Weak';
    if (validCount <= 3) return 'Fair';
    if (validCount <= 4) return 'Good';
    return 'Very Strong';
  }

  /**
   * Get form controls for easy access in template
   */
  get f() {
    return this.passwordForm.controls;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    const changePasswordData = {
      currentPassword: this.f['currentPassword'].value,
      newPassword: this.f['newPassword'].value,
      confirmNewPassword: this.f['confirmNewPassword'].value
    };

    this.userService.changePassword(changePasswordData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.showSuccess('Password changed successfully');
        this.passwordChanged.emit(true);
        this.resetForm();
        this.addToPasswordHistory('Password changed successfully', true);
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Failed to change password';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors?.length > 0) {
          errorMessage = error.error.errors[0];
        }

        this.notificationService.showError(errorMessage);
        this.passwordChanged.emit(false);
        this.addToPasswordHistory('Password change failed', false);
      }
    });
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.resetForm();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.passwordForm.reset();
    this.resetPasswordValidation();
    this.hideCurrentPassword = true;
    this.hideNewPassword = true;
    this.hideConfirmPassword = true;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Load password change history
   */
  private loadPasswordHistory(): void {
    // In a real application, you would fetch this from the backend
    // For now, we'll use mock data
    this.passwordHistory = [
      {
        date: new Date(Date.now() - 86400000 * 30), // 30 days ago
        description: 'Password changed from account settings',
        success: true
      },
      {
        date: new Date(Date.now() - 86400000 * 90), // 90 days ago
        description: 'Password reset via email',
        success: true
      }
    ];
  }

  /**
   * Add entry to password history
   */
  private addToPasswordHistory(description: string, success: boolean): void {
    const newEntry: PasswordHistoryItem = {
      date: new Date(),
      description,
      success
    };

    this.passwordHistory.unshift(newEntry);

    // Keep only the last 5 entries
    if (this.passwordHistory.length > 5) {
      this.passwordHistory = this.passwordHistory.slice(0, 5);
    }
  }

  /**
   * Check if password meets all requirements
   */
  isPasswordValid(): boolean {
    return Object.values(this.passwordValidation).every(Boolean);
  }

  /**
   * Generate a strong password suggestion
   */
  generateStrongPassword(): void {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';

    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '@$!%*?&'[Math.floor(Math.random() * 7)]; // Special

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    this.passwordForm.patchValue({
      newPassword: password,
      confirmNewPassword: password
    });

    this.notificationService.showInfo('Strong password generated and filled');
  }
}
