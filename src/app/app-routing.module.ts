import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TemplateLibraryComponent } from './components/templatess/template-library/template-library.component';
import { SubscriptionPlansComponent } from './components/subscriptions/subscription-plans/subscription-plans.component';
import { PaymentHistoryComponent } from './components/subscriptions/payment-history/payment-history.component';
import { NotFoundComponent } from './components/layout/not-found/not-found.component';

import { AuthGuard } from './guards/auth.guard';
import { SubscriptionGuard } from './guards/subscription.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard', loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'facebook-pages', loadChildren: () => import('./components/facebook-pages/facebook-pages.module').then(m => m.FacebookPagesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'posts', loadChildren: () => import('./components/posts/posts.module').then(m => m.PostsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings', loadChildren: () => import('./components/setting/setting.module').then(m => m.SettingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'subscription', loadChildren: () => import('./components/subscriptions/subscription.module').then(m => m.SubscriptionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'templates', loadChildren: () => import('./components/templatess/templatess.module').then(m => m.TemplatesModule),
    canActivate: [AuthGuard]
  },
  { path: '**', component: NotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
