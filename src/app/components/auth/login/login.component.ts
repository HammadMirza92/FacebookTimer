import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { NotificationService } from '../../../services/notification.service';
import { GoogleAuthService } from '../../../services/GoogleAuthService.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  googleLoading = false;
  returnUrl: string;
  hidePassword = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    // Redirect to dashboard if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  async ngOnInit(): Promise<void> {
    await this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async initializeGoogleSignIn(): Promise<void> {
    try {
      await this.googleAuthService.ensureGoogleSDKLoaded();
      await this.googleAuthService.initializeGoogleSignIn(this.handleGoogleSignIn.bind(this));
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      this.notificationService.showError('Failed to initialize Google Sign-In');
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.googleLoading = true;
      await this.googleAuthService.promptGoogleSignIn();
    } catch (error) {
      console.error('Google Sign-In error:', error);
      this.notificationService.showError('Google Sign-In failed. Please try again.');
      this.googleLoading = false;
    }
  }

  private handleGoogleSignIn(response: any): void {
    this.ngZone.run(() => {
      this.googleLoading = true;

      const subscription = this.authService.googleLogin(response.credential).subscribe({
        next: (result) => {
          this.notificationService.showSuccess('Welcome back! Login successful.');
          this.googleLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Google login error:', error);
          const errorMessage = error.error?.message || 'Google login failed. Please try again.';
          this.notificationService.showError(errorMessage);
          this.googleLoading = false;
        }
      });

      this.subscriptions.push(subscription);
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    const loginData = {
      email: this.loginForm.value.email.trim(),
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe
    };

    const subscription = this.authService.login(loginData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Welcome back! Login successful.');
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.notificationService.showError(errorMessage);
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  get canSubmit(): boolean {
    return this.isFormValid && !this.loading && !this.googleLoading;
  }
}
