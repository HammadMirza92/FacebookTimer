import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TemplateLibraryComponent } from './components/templatess/template-library/template-library.component';
import { FacebookPagesComponent } from './components/facebook-pages/facebook-pages/facebook-pages.component';
import { CreatePostComponent } from './components/posts/create-post/create-post.component';
import { PostListComponent } from './components/posts/post-list/post-list.component';
import { SubscriptionPlansComponent } from './components/subscriptions/subscription-plans/subscription-plans.component';
import { PaymentHistoryComponent } from './components/subscriptions/payment-history/payment-history.component';
import { NotFoundComponent } from './components/layout/not-found/not-found.component';

import { AuthGuard } from './guards/auth.guard';
import { SubscriptionGuard } from './guards/subscription.guard';
import { TestComponent } from './components/auth/test/test.component';
import { Test2Component } from './components/auth/test2/test2.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'test', component: TestComponent },
  { path: 'test2', component: Test2Component },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'templates', component: TemplateLibraryComponent, canActivate: [AuthGuard] },
  { path: 'facebook-pages', component: FacebookPagesComponent, canActivate: [AuthGuard] },
  { path: 'posts', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'posts/create', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'posts/edit/:id', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'subscription/plans', component: SubscriptionPlansComponent, canActivate: [AuthGuard] },
  { path: 'subscription/history', component: PaymentHistoryComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
