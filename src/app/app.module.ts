import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { SidenavComponent } from './components/layout/sidenav/sidenav.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { TemplateLibraryComponent } from './components/templatess/template-library/template-library.component';
import { TemplateCardComponent } from './components/templatess/templates-card/template-card.component';
import { SubscriptionPlansComponent } from './components/subscriptions/subscription-plans/subscription-plans.component';
import { SubscriptionCardComponent } from './components/subscriptions/subscription-card/subscription-card.component';
import { PaymentHistoryComponent } from './components/subscriptions/payment-history/payment-history.component';
import { NotFoundComponent } from './components/layout/not-found/not-found.component';

// Services
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
import { SettingComponent } from './components/setting/setting.component';
import { ProfileHeaderComponent } from './components/setting/profile-header/profile-header.component';
import { PasswordUpdateComponent } from './components/setting/password-update/password-update.component';
import { AccountInfoComponent } from './components/setting/account-info/account-info.component';
import { SecuritySettingsComponent } from './components/setting/security-settings/security-settings.component';
import { MatLoadingSnackbarModule } from './components/mat-and-snackbar/mat-loading-snackbar.module';

@NgModule({
  declarations: [
    AppComponent,

    NavbarComponent,
    SidenavComponent,
    FooterComponent,
    NotFoundComponent,

    TemplateLibraryComponent,
    TemplateCardComponent,
    SubscriptionPlansComponent,
    SubscriptionCardComponent,
    PaymentHistoryComponent,

    TemplateEditComponent,
    TemplateAdminComponent,
    TemplatePreviewComponent,

    SettingComponent,
    ProfileHeaderComponent,
    PasswordUpdateComponent,
    AccountInfoComponent,
    SecuritySettingsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    MatLoadingSnackbarModule,
    ReactiveFormsModule
  ],
  providers: [
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
