import { MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { filter } from 'rxjs';

interface UserStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
}
@Component({
  selector: 'app-sidenav',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
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
