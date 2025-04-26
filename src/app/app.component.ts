import { Component, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  mobileQuery: MediaQueryList;
  opened = true;
  showSidenav = false;
  isLoggedIn = false;

  constructor(
    private media: MediaMatcher,
    private router: Router,
    private authService: AuthService
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 768px)');
    this.opened = !this.mobileQuery.matches;

    // Close sidenav on mobile when navigating
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.mobileQuery.matches) {
        this.opened = false;
      }
    });
  }

  ngOnInit(): void {
    // Try to auto-login user
    this.authService.autoLogin();

    // Update authentication status
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.showSidenav = this.isLoggedIn;
    });
  }

  toggleSidenav(): void {
    this.opened = !this.opened;
  }
}
