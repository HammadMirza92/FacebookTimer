import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { SidenavComponent } from './components/layout/sidenav/sidenav.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { NotFoundComponent } from './components/layout/not-found/not-found.component';

// Services
import { PostService } from './services/post.service';
import { NotificationService } from './services/notification.service';

// Interceptors
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { SubscriptionGuard } from './guards/subscription.guard';

// Routes
import { AppRoutingModule } from './app-routing.module';
import { GoogleAuthService } from './services/GoogleAuthService.service';
import { MaterialModule } from './components/mat-and-snackbar/mat-UI/material.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,

    NavbarComponent,
    SidenavComponent,
    FooterComponent,
    NotFoundComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [
    PostService,
    GoogleAuthService,
    NotificationService,
    AuthGuard,
    SubscriptionGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
