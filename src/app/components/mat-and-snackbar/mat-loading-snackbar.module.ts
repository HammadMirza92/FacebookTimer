import { NgModule } from '@angular/core';
import { CustomSnackBarComponent } from './custom-snackbar/custom-snackbar.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MaterialModule } from './mat-UI/material.module';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';



@NgModule({
  declarations: [
    CustomSnackBarComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  imports: [
    MaterialModule,
    CommonModule
  ],
  exports:[
    MaterialModule
  ],
})
export class MatLoadingSnackbarModule {}
