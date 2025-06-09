import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './main-dashboard/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { FormsModule } from '@angular/forms';
import { MatLoadingSnackbarModule } from '../mat-and-snackbar/mat-loading-snackbar.module';



@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatLoadingSnackbarModule,
    FormsModule,
  ]
})
export class DashboardModule {

}
