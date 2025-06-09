import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/main-dashboard/dashboard.component';
import { TemplateLibraryComponent } from './components/templatess/template-library/template-library.component';
import { FacebookPagesComponent } from './components/facebook-pages/facebook-pages/facebook-pages.component';
import { CreatePostComponent } from './components/posts/create-post/create-post.component';
import { PostListComponent } from './components/posts/post-list/post-list.component';
import { SubscriptionPlansComponent } from './components/subscriptions/subscription-plans/subscription-plans.component';
import { PaymentHistoryComponent } from './components/subscriptions/payment-history/payment-history.component';
import { NotFoundComponent } from './components/layout/not-found/not-found.component';

import { AuthGuard } from './guards/auth.guard';
import { SubscriptionGuard } from './guards/subscription.guard';
import { SettingComponent } from './components/setting/setting.component';
import { TemplateAdminComponent } from './components/templatess/template-admin/template-admin.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard', loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  { path: 'settings', component: SettingComponent , canActivate: [AuthGuard] },
  { path: 'templates', component: TemplateLibraryComponent, canActivate: [AuthGuard] },
  { path: 'facebook-pages', component: FacebookPagesComponent, canActivate: [AuthGuard] },
  { path: 'posts', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'posts/create', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'posts/edit/:id', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'subscription/plans', component: SubscriptionPlansComponent, canActivate: [AuthGuard] },
  { path: 'subscription/history', component: PaymentHistoryComponent, canActivate: [AuthGuard] },
   {path: 'test', component: TemplateAdminComponent },
  { path: '**', component: NotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
