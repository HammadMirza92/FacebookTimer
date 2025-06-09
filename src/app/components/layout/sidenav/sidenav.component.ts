import { Component, OnInit } from '@angular/core';
import { filter, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../../models/user.model';
import { NavigationEnd, Router } from '@angular/router';
interface UserStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
}
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  currentUser$: Observable<User | null>;
  currentRoute$: Observable<string>;
userStats: UserStats = {
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    draftPosts: 0
  };

  // Navigation badges
  connectedPagesCount = 0;
  templatesCount = 0;
  pendingPostsCount = 0;
  hasUpgradeAvailable = false;

  private destroy$ = new Subject<void>();
  constructor(private authService: AuthService,  private router: Router) {
     this.currentUser$ = this.authService.currentUser;

    // Track current route for active state
    this.currentRoute$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      startWith(this.router.url)
    );
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserStats();
    this.loadNavigationCounts();
  }
   ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getInitials(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return 'U';

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return `${firstInitial}${lastInitial}`;
  }
   getSubscriptionStatusClass(): string {
    return this.currentUser$.pipe(
      map(user => {
        if (!user?.currentSubscription) return 'danger';

        const daysRemaining = user.currentSubscription.daysRemaining;

        if (daysRemaining <= 0) return 'danger';
        if (daysRemaining <= 7) return 'warning';
        return 'success';
      })
    ) as any; // For template usage
  }
getSubscriptionIcon(): string {
    // This would be called synchronously in template, so we need a different approach
    // You might want to make this a computed property or use async pipe differently
    return 'verified'; // Default icon
  }
   isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
  private loadUserData(): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$),
      filter(user => !!user)
    ).subscribe(user => {
      if (user) {
        this.checkUpgradeAvailability(user);
      }
    });
  }
  private loadUserStats(): void {
    // Replace with actual service calls
    this.currentUser$.pipe(
      takeUntil(this.destroy$),
      filter(user => !!user)
    ).subscribe(user => {
      if (user) {
        // Example: Load stats from your post service
        // this.postService.getUserStats(user.id).subscribe(stats => {
        //   this.userStats = stats;
        // });

        // Mock data for demonstration
        this.userStats = {
          totalPosts: 24,
          scheduledPosts: 8,
          publishedPosts: 16,
          draftPosts: 2
        };
      }
    });
  }
   private loadNavigationCounts(): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$),
      filter(user => !!user)
    ).subscribe(user => {
      if (user) {
        // Example service calls to get counts
        // this.facebookService.getConnectedPagesCount().subscribe(count => {
        //   this.connectedPagesCount = count;
        // });

        // this.templateService.getTemplatesCount().subscribe(count => {
        //   this.templatesCount = count;
        // });

        // this.postService.getPendingPostsCount().subscribe(count => {
        //   this.pendingPostsCount = count;
        // });

        // Mock data for demonstration
        this.connectedPagesCount = 3;
        this.templatesCount = 12;
        this.pendingPostsCount = 5;
      }
    });
  }
  private checkUpgradeAvailability(user: User): void {
    if (user.currentSubscription) {
      const isBasicPlan = user.currentSubscription.subscriptionPlanName.toLowerCase().includes('basic');
      const isExpiringSoon = user.currentSubscription.daysRemaining <= 30;

      this.hasUpgradeAvailable = isBasicPlan || isExpiringSoon;
    } else {
      this.hasUpgradeAvailable = true; // No subscription
    }
  }
}
