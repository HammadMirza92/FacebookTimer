import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable, from } from 'rxjs';

declare const google: any;

export interface GoogleInitConfig {
  client_id: string;
  callback: (response: any) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private googleClientId = environment.googleClientId;
  private googleSDKLoaded = new BehaviorSubject<boolean>(false);
  private loadingPromise: Promise<void> | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeGoogleSDK();
  }

  getGoogleClientId(): string {
    return this.googleClientId;
  }

  isGoogleSDKLoaded(): Observable<boolean> {
    return this.googleSDKLoaded.asObservable();
  }

  async ensureGoogleSDKLoaded(): Promise<void> {
    if (this.googleSDKLoaded.value) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    return this.loadGoogleSDK();
  }

  private async initializeGoogleSDK(): Promise<void> {
    try {
      await this.loadGoogleSDK();
    } catch (error) {
      console.error('Failed to initialize Google SDK:', error);
      throw error;
    }
  }

  loadGoogleSDK(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Check if google is already available
      if (this.isGoogleAvailable()) {
        this.googleSDKLoaded.next(true);
        resolve();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          this.waitForGoogleInit()
            .then(() => {
              this.googleSDKLoaded.next(true);
              resolve();
            })
            .catch(reject);
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Failed to load Google SDK'));
        });
        return;
      }

      // Create and load the script
      this.createGoogleScript()
        .then(() => {
          return this.waitForGoogleInit();
        })
        .then(() => {
          this.googleSDKLoaded.next(true);
          resolve();
        })
        .catch(reject);
    });

    return this.loadingPromise;
  }

  private createGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google SDK script'));

      document.head.appendChild(script);
    });
  }

  private waitForGoogleInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait time

      const checkGoogle = () => {
        attempts++;

        if (this.isGoogleAvailable()) {
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error('Google SDK failed to initialize within timeout period'));
          return;
        }

        setTimeout(checkGoogle, 100);
      };

      checkGoogle();
    });
  }

  private isGoogleAvailable(): boolean {
    return typeof google !== 'undefined' &&
           google.accounts &&
           google.accounts.id &&
           typeof google.accounts.id.initialize === 'function';
  }

  async initializeGoogleSignIn(callback: (response: any) => void): Promise<void> {
    try {
      await this.ensureGoogleSDKLoaded();

      if (!this.isGoogleAvailable()) {
        throw new Error('Google SDK not available');
      }

      const config: GoogleInitConfig = {
        client_id: this.googleClientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false
      };

      google.accounts.id.initialize(config);
      this.isInitialized = true;

    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      throw error;
    }
  }

  async promptGoogleSignIn(): Promise<void> {
    try {
      await this.ensureGoogleSDKLoaded();

      if (!this.isGoogleAvailable()) {
        throw new Error('Google SDK not available');
      }

      if (!this.isInitialized) {
        throw new Error('Google Sign-In not initialized. Call initializeGoogleSignIn first.');
      }

      return new Promise((resolve, reject) => {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            // Try alternative method if prompt is not displayed
            this.showOneTapFallback()
              .then(resolve)
              .catch(reject);
          } else if (notification.isSkippedMoment()) {
            // User dismissed the prompt
            reject(new Error('User dismissed the Google Sign-In prompt'));
          } else {
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Failed to show Google Sign-In prompt:', error);
      throw error;
    }
  }

  private async showOneTapFallback(): Promise<void> {
    // Fallback: Try to render a button temporarily to trigger authentication
    return new Promise((resolve, reject) => {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-9999px';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        google.accounts.id.renderButton(tempDiv, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
        });

        // Simulate click on the hidden button
        const button = tempDiv.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          button.click();
          resolve();
        } else {
          reject(new Error('Could not create fallback Google Sign-In button'));
        }

        // Clean up
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  }

  renderGoogleButton(
    element: HTMLElement,
    config: any = {}
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ensureGoogleSDKLoaded();

        if (!this.isGoogleAvailable()) {
          throw new Error('Google SDK not available');
        }

        const defaultConfig = {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'signin_with',
          size: 'large',
          logo_alignment: 'left'
        };

        const buttonConfig = { ...defaultConfig, ...config };

        google.accounts.id.renderButton(element, buttonConfig);
        resolve();

      } catch (error) {
        console.error('Failed to render Google button:', error);
        reject(error);
      }
    });
  }

  signOut(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ensureGoogleSDKLoaded();

        if (!this.isGoogleAvailable()) {
          resolve(); // No Google SDK available, consider signed out
          return;
        }

        if (google.accounts.id.disableAutoSelect) {
          google.accounts.id.disableAutoSelect();
        }

        resolve();

      } catch (error) {
        console.error('Failed to sign out from Google:', error);
        reject(error);
      }
    });
  }

  revokeAccess(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ensureGoogleSDKLoaded();

        if (!this.isGoogleAvailable()) {
          resolve(); // No Google SDK available, consider revoked
          return;
        }

        if (google.accounts.id.revoke) {
          google.accounts.id.revoke(this.googleClientId, () => {
            resolve();
          });
        } else {
          resolve();
        }

      } catch (error) {
        console.error('Failed to revoke Google access:', error);
        reject(error);
      }
    });
  }

  // Utility method to check if the service is ready
  isReady(): boolean {
    return this.googleSDKLoaded.value && this.isInitialized;
  }

  // Method to reset the service state (useful for testing)
  reset(): void {
    this.isInitialized = false;
    this.loadingPromise = null;
    this.googleSDKLoaded.next(false);
  }
}
