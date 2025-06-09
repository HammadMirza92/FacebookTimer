import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './main-dashboard/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MaterialModule } from '../shared/mat-UI/material.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MaterialModule,
    FormsModule,
  ]
})
export class DashboardModule {

}
