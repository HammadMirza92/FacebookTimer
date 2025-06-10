import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';


const routes: Routes = [
  { path: 'plans', component: SubscriptionPlansComponent },
  { path: 'history', component: PaymentHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule {}
