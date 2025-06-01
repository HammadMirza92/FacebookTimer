import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { SidenavComponent } from './components/layout/sidenav/sidenav.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { TemplateLibraryComponent } from './components/templatess/template-library/template-library.component';
import { TemplateCardComponent } from './components/templatess/templates-card/template-card.component';
import { FacebookPagesComponent } from './components/facebook-pages/facebook-pages/facebook-pages.component';
import { LinkFacebookPageComponent } from './components/facebook-pages/link-facebook-page/link-facebook-page.component';
import { CreatePostComponent } from './components/posts/create-post/create-post.component';
import { PostPreviewComponent } from './components/posts/post-preview/post-preview.component';
import { PostListComponent } from './components/posts/post-list/post-list.component';
import { PostItemComponent } from './components/posts/post-item/post-item.component';
import { SubscriptionPlansComponent } from './components/subscriptions/subscription-plans/subscription-plans.component';
import { SubscriptionCardComponent } from './components/subscriptions/subscription-card/subscription-card.component';
import { PaymentHistoryComponent } from './components/subscriptions/payment-history/payment-history.component';
import { CountdownTimerComponent } from './components/shared/countdown-timer/countdown-timer.component';
import { NotFoundComponent } from './components/layout/not-found/not-found.component';
import { AlertComponent } from './components/shared/alert/alert.component';
import { ColorPickerComponent } from './components/shared/color-picker/color-picker.component';
import { FontPickerComponent } from './components/shared/font-picker/font-picker.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';

// Services
import { AuthService } from './services/auth.service';
import { FacebookPageService } from './services/facebook-page.service';
import { TemplateService } from './services/template.service';
import { PostService } from './services/post.service';
import { SubscriptionService } from './services/subscription.service';
import { NotificationService } from './services/notification.service';

// Interceptors
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { SubscriptionGuard } from './guards/subscription.guard';

// Routes
import { AppRoutingModule } from './app-routing.module';
import { TemplateEditComponent } from './components/templatess/template-edit/template-edit.component';
import { TemplateAdminComponent } from './components/templatess/template-admin/template-admin.component';
import { TemplatePreviewComponent } from './components/templatess/template-preview/template-preview.component';
import { GoogleAuthService } from './services/GoogleAuthService.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    NavbarComponent,
    SidenavComponent,
    FooterComponent,
    TemplateLibraryComponent,
    TemplateCardComponent,
    FacebookPagesComponent,
    LinkFacebookPageComponent,
    CreatePostComponent,
    PostPreviewComponent,
    PostListComponent,
    PostItemComponent,
    SubscriptionPlansComponent,
    SubscriptionCardComponent,
    PaymentHistoryComponent,
    CountdownTimerComponent,
    NotFoundComponent,
    AlertComponent,
    ColorPickerComponent,
    FontPickerComponent,
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    TemplateEditComponent,
    TemplateAdminComponent,
    TemplatePreviewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    MatBadgeModule
  ],
  providers: [
    AuthService,
    FacebookPageService,
    TemplateService,
    PostService,
    GoogleAuthService,
    SubscriptionService,
    NotificationService,
    AuthGuard,
    SubscriptionGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
