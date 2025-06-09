import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService } from '../components/auth/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          this.notificationService.showError('Session expired. Please login again.');
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          this.notificationService.showError('You do not have permission to access this resource.');
        } else if (error.status === 404) {
          this.notificationService.showError('The requested resource was not found.');
        } else if (error.status === 500) {
          this.notificationService.showError('An error occurred on the server. Please try again later.');
        } else {
          // Handle other error types
          const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
          this.notificationService.showError(errorMessage);
        }

        return throwError(() => error);
      })
    );
  }
}
