// custom-snackbar.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-snackbar',
  template: `
    <div class="custom-snackbar" [ngClass]="data.panelClass">
      <div class="snackbar-icon">
        <!-- Success Icon -->
        <svg *ngIf="data.panelClass.includes('success-snackbar')" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
        </svg>

        <!-- Error Icon -->
        <svg *ngIf="data.panelClass.includes('error-snackbar')" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="white"/>
        </svg>

        <!-- Warning Icon -->
        <svg *ngIf="data.panelClass.includes('warning-snackbar')" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="white"/>
        </svg>

        <!-- Info Icon -->
        <svg *ngIf="data.panelClass.includes('info-snackbar')" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="white"/>
        </svg>
      </div>

      <div class="snackbar-message">
        {{ data.message }}
      </div>

      <button *ngIf="data.action !== ''" class="snackbar-action" (click)="snackBarRef.dismissWithAction()">
        {{ data.action }}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class CustomSnackBarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    public snackBarRef: MatSnackBarRef<CustomSnackBarComponent>
  ) {}
}
