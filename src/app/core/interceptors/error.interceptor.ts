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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../features/auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          this.snackBar.open('Your session has expired, please log in again.', 'Close', {
            duration: 5000
          });
        } else if (error.status === 403) {
          this.snackBar.open('You do not have permission to perform this action.', 'Close', {
            duration: 5000
          });
        } else if (error.status === 400) {
          if (typeof error.error === 'string') {
            this.snackBar.open(error.error, 'Close', {
              duration: 5000
            });
          } else {
            this.snackBar.open('Invalid request. Please check your input.', 'Close', {
              duration: 5000
            });
          }
        } else {
          this.snackBar.open(
            'An unexpected error occurred. Please try again later.',
            'Close',
            { duration: 5000 }
          );
        }

        return throwError(() => error);
      })
    );
  }
}
