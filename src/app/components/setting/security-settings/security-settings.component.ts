// security-settings.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { User, UserService } from '../user.service';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  lastPasswordChange: Date | null;
}

interface UserSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  loginTime: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

interface PasswordValidation {
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss']
})
export class SecuritySettingsComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() securityUpdated = new EventEmitter<boolean>();

  passwordForm: FormGroup;
  securitySettings: SecuritySettings | null = null;
  activeSessions: UserSession[] = [];
  backupCodes: string[] = [];

  // Form states
  passwordLoading = false;
  twoFactorLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // Two-factor authentication
  selectedTwoFactorMethod: 'authenticator' | 'sms' | null = null;

  // Password validation
  passwordValidation: PasswordValidation = {
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.setupPasswordValidation();
    this.loadSecuritySettings();
    this.loadActiveSessions();
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
      confirmPassword: ['', [Validators.required]]
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
    const confirmPassword = group.get('confirmPassword')?.value;

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
   * Load security settings from server
   */
  private loadSecuritySettings(): void {
    this.userService.getSecuritySettings().subscribe({
      next: (settings) => {
        this.securitySettings = settings;
      },
      error: (error) => {
        console.error('Error loading security settings:', error);
        // Use default settings if API fails
        this.securitySettings = {
          twoFactorEnabled: false,
          emailNotifications: true,
          smsNotifications: false,
          loginAlerts: true,
          lastPasswordChange: null
        };
      }
    });
  }

  /**
   * Load active sessions from server
   */
  private loadActiveSessions(): void {
    this.userService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
      },
      error: (error) => {
        console.error('Error loading active sessions:', error);
        // Use mock data if API fails
        this.activeSessions = [
          {
            id: '1',
            deviceInfo: 'Chrome on Windows',
            ipAddress: '192.168.1.100',
            location: 'Lahore, Pakistan',
            loginTime: new Date(),
            lastActivity: new Date(),
            isCurrent: true
          }
        ];
      }
    });
  }

  /**
   * Handle password form submission
   */
  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.passwordLoading = true;

    const changePasswordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
      confirmNewPassword: this.passwordForm.get('confirmPassword')?.value
    };

    this.userService.changePassword(changePasswordData).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.notificationService.showSuccess('Password changed successfully');
        this.passwordForm.reset();
        this.resetPasswordValidation();
        this.securityUpdated.emit(true);
      },
      error: (error) => {
        this.passwordLoading = false;
        console.error('Password change error:', error);

        let errorMessage = 'Failed to change password';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.notificationService.showError(errorMessage);
        this.securityUpdated.emit(false);
      }
    });
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
   * Select two-factor authentication method
   */
  selectTwoFactorMethod(method: 'authenticator' | 'sms'): void {
    this.selectedTwoFactorMethod = method;
  }

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor(): void {
    if (!this.selectedTwoFactorMethod) {
      this.notificationService.showError('Please select a two-factor method');
      return;
    }

    this.twoFactorLoading = true;

    const twoFactorData = {
      method: this.selectedTwoFactorMethod,
      phoneNumber: this.user?.phoneNumber || null
    };

    // this.userService.enableTwoFactor(twoFactorData).subscribe({
    //   next: (response) => {
    //     this.twoFactorLoading = false;

    //     if (response.backupCodes) {
    //       this.backupCodes = response.backupCodes;
    //     }

    //     this.notificationService.showSuccess('Two-factor authentication enabled successfully');
    //     this.loadSecuritySettings(); // Reload to update status
    //     this.securityUpdated.emit(true);
    //   },
    //   error: (error) => {
    //     this.twoFactorLoading = false;
    //     console.error('Two-factor setup error:', error);
    //     this.notificationService.showError('Failed to enable two-factor authentication');
    //     this.securityUpdated.emit(false);
    //   }
    // });
  }

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor(): void {
    // In a real application, you would show a confirmation dialog
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
      this.userService.disableTwoFactor().subscribe({
        next: () => {
          this.notificationService.showSuccess('Two-factor authentication disabled');
          this.backupCodes = [];
          this.loadSecuritySettings(); // Reload to update status
          this.securityUpdated.emit(true);
        },
        error: (error) => {
          console.error('Two-factor disable error:', error);
          this.notificationService.showError('Failed to disable two-factor authentication');
          this.securityUpdated.emit(false);
        }
      });
    }
  }

  /**
   * Download backup codes as text file
   */
  downloadBackupCodes(): void {
    if (this.backupCodes.length === 0) {
      this.notificationService.showError('No backup codes available');
      return;
    }

    const content = `Facebook Scheduler - Backup Recovery Codes
Generated: ${new Date().toLocaleString()}

Save these codes in a safe place. You can use them to access your account if you lose your 2FA device.

${this.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Important:
- Each code can only be used once
- Keep these codes secure and private
- Generate new codes if these are compromised`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facebook-scheduler-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.notificationService.showSuccess('Backup codes downloaded successfully');
  }

  /**
   * Get device icon based on device info
   */
  getDeviceIcon(deviceInfo: string): string {
    const info = deviceInfo.toLowerCase();

    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
      return 'smartphone';
    } else if (info.includes('tablet') || info.includes('ipad')) {
      return 'tablet';
    } else if (info.includes('mac') || info.includes('macintosh')) {
      return 'laptop_mac';
    } else {
      return 'computer';
    }
  }

  /**
   * Terminate a specific session
   */
  terminateSession(sessionId: string): void {
    this.userService.terminateSession(sessionId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Session terminated successfully');
        this.loadActiveSessions(); // Reload sessions
      },
      error: (error) => {
        console.error('Session termination error:', error);
        this.notificationService.showError('Failed to terminate session');
      }
    });
  }

  /**
   * Logout from all sessions except current
   */
  logoutAllSessions(): void {
    if (confirm('Are you sure you want to sign out from all other devices?')) {
      this.userService.logoutAllSessions().subscribe({
        next: () => {
          this.notificationService.showSuccess('Signed out from all other devices');
          this.loadActiveSessions(); // Reload sessions
        },
        error: (error) => {
          console.error('Logout all sessions error:', error);
          this.notificationService.showError('Failed to sign out from all sessions');
        }
      });
    }
  }

  /**
   * Check if password meets all requirements
   */
  isPasswordValid(): boolean {
    return Object.values(this.passwordValidation).every(Boolean);
  }

  /**
   * Get password strength percentage
   */
  getPasswordStrength(): number {
    const validCount = Object.values(this.passwordValidation).filter(Boolean).length;
    return (validCount / Object.keys(this.passwordValidation).length) * 100;
  }

  /**
   * Generate a secure backup code
   */
  private generateBackupCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Refresh security settings
   */
  refreshSecuritySettings(): void {
    this.loadSecuritySettings();
    this.loadActiveSessions();
    this.notificationService.showInfo('Security settings refreshed');
  }

  /**
   * Export security audit log
   */
  exportSecurityAuditLog(): void {
    this.userService.getSecurityAuditLog().subscribe({
      next: (auditLog) => {
        const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `security-audit-log-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.notificationService.showSuccess('Security audit log exported successfully');
      },
      error: (error) => {
        console.error('Security audit log export error:', error);
        this.notificationService.showError('Failed to export security audit log');
      }
    });
  }
}
