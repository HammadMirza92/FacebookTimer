import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLoadingSnackbarModule } from '../mat-and-snackbar/mat-loading-snackbar.module';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionCardComponent } from './subscription-card/subscription-card.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { SubscriptionService } from './subscription.service';



@NgModule({
  declarations: [
    SubscriptionCardComponent,
    SubscriptionPlansComponent,
    PaymentHistoryComponent
  ],
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    MatLoadingSnackbarModule,
    ReactiveFormsModule
  ],
  providers: [
    SubscriptionService
  ]
})
export class SubscriptionModule {}
