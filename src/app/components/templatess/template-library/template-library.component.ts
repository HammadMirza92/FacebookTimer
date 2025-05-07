import { Component, OnInit } from '@angular/core';
import { TemplateService } from '../../../services/template.service';
import { NotificationService } from '../../../services/notification.service';
import { Template } from '../../../models/template.model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-template-library',
  templateUrl: './template-library.component.html',
  styleUrls: ['./template-library.component.scss']
})
export class TemplateLibraryComponent implements OnInit {
  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  loading = true;
  searchTerm = '';
  filterSubscription = 'all';
  currentUser$: Observable<User | null>;

  constructor(
    private templateService: TemplateService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.templateService.getTemplates().subscribe({
      next: templates => {
        this.templates = templates;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Failed to load templates. Please try again later.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTemplates = this.templates.filter(template => {
      // Apply search filter
      const searchMatch = !this.searchTerm ||
        template.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Apply subscription filter
      let subscriptionMatch = true;
      if (this.filterSubscription !== 'all') {
        if (this.filterSubscription === 'free') {
          subscriptionMatch = !template.requiresSubscription;
        } else if (this.filterSubscription === 'premium') {
          subscriptionMatch = template.requiresSubscription;
        }
      }

      return searchMatch && subscriptionMatch;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  useTemplate(template: Template): void {
    this.router.navigate(['/posts/create'], { queryParams: { templateId: template.id } });
  }

  canUseTemplate(template: Template, user: User | null): boolean {
    if (!template.requiresSubscription) {
      return true;
    }

    if (!user || !user.currentSubscription) {
      return false;
    }

    return user.currentSubscription.subscriptionPlanId >= (template.minimumSubscriptionPlanId || 0);
  }
}
