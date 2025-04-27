// src/app/types/facebook.d.ts

interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null;
  status: string;
}

interface FacebookInitParams {
  appId: string;
  autoLogAppEvents?: boolean;
  cookie?: boolean;
  xfbml?: boolean;
  version: string;
}

interface FacebookLoginOptions {
  scope?: string;
  return_scopes?: boolean;
  enable_profile_selector?: boolean;
  profile_selector_ids?: string;
}

interface FacebookSDK {
  init(params: FacebookInitParams): void;
  login(callback: (response: FacebookLoginResponse) => void, options?: FacebookLoginOptions): void;
  logout(callback: (response: any) => void): void;
  getLoginStatus(callback: (response: FacebookLoginStatusResponse) => void): void;
  api(path: string, method: string, params: any, callback: (response: any) => void): void;
}

declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit: () => void;
  }
}

export {};
