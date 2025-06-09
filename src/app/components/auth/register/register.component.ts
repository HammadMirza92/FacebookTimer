import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { GoogleAuthService } from '../../../services/GoogleAuthService.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup = new FormGroup({});
  loading = false;
  googleLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private notificationService: NotificationService,
    private router: Router,
    private ngZone: NgZone
  ) {
    // Redirect to dashboard if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.initializeForm();
  }

  async ngOnInit(): Promise<void> {
    await this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.nameValidator
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.emailValidator
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      acceptTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom Validators
  private nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const namePattern = /^[a-zA-Z\s\-']+$/;
    if (!namePattern.test(control.value)) {
      return { invalidName: true };
    }
    return null;
  }

  private emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const hasNumber = /[0-9]/.test(control.value);
    const hasUpper = /[A-Z]/.test(control.value);
    const hasLower = /[a-z]/.test(control.value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(control.value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;

    if (!valid) {
      return {
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial
        }
      };
    }
    return null;
  }

  private passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const confirmPasswordControl = formGroup.get('confirmPassword');
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
      }
    }
    return null;
  }

  private async initializeGoogleSignIn(): Promise<void> {
    try {
      await this.googleAuthService.ensureGoogleSDKLoaded();
      await this.googleAuthService.initializeGoogleSignIn(this.handleGoogleSignUp.bind(this));
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      this.notificationService.showError('Failed to initialize Google Sign-Up');
    }
  }

  async signUpWithGoogle(): Promise<void> {
    try {
      this.googleLoading = true;
      await this.googleAuthService.promptGoogleSignIn();
    } catch (error) {
      console.error('Google Sign-Up error:', error);
      this.notificationService.showError('Google Sign-Up failed. Please try again.');
      this.googleLoading = false;
    }
  }

  private handleGoogleSignUp(response: any): void {
    this.ngZone.run(() => {
      this.googleLoading = true;

      const subscription = this.authService.googleRegister(response.credential).subscribe({
        next: (result) => {
          this.notificationService.showSuccess('Welcome! Your account has been created successfully.');
          this.googleLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Google registration error:', error);
          const errorMessage = error.error?.message || 'Google registration failed. Please try again.';
          this.notificationService.showError(errorMessage);
          this.googleLoading = false;
        }
      });

      this.subscriptions.push(subscription);
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    const registerData = {
      firstName: this.registerForm.value.firstName.trim(),
      lastName: this.registerForm.value.lastName.trim(),
      email: this.registerForm.value.email.trim().toLowerCase(),
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword
    };

    const subscription = this.authService.register(registerData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Registration successful!');
        this.loading = false;
        this.router.navigate(['/login'], {
          queryParams: { email: registerData.email }
        });
      },
      error: error => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.notificationService.showError(errorMessage);
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  get isFormValid(): boolean {
    return this.registerForm.valid;
  }

  get canSubmit(): boolean {
    return this.isFormValid && !this.loading && !this.googleLoading;
  }

  get passwordStrengthErrors() {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.errors?.['passwordStrength']) {
      return passwordControl.errors['passwordStrength'];
    }
    return null;
  }

  getPasswordStrengthClass(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length === 0) return '';

    const strength = this.calculatePasswordStrength(password);
    if (strength >= 4) return 'strong';
    if (strength >= 3) return 'medium';
    return 'weak';
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (/[0-9]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return strength;
  }
}
