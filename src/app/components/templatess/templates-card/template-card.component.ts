import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Template } from '../../../models/template.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template-card',
  templateUrl: './template-card.component.html',
  styleUrls: ['./template-card.component.scss']
})
export class TemplateCardComponent {
  @Input() template!: Template;
  @Input() canUse: boolean = true;
  @Output() useTemplate = new EventEmitter<Template>();

  constructor(private router: Router) { }

  onUseTemplate(): void {
    if (this.canUse) {
      this.useTemplate.emit(this.template);
    } else {
      this.router.navigate(['/subscription/plans']);
    }
  }

  getPlanBadgeClass(): string {
    if (!this.template.requiresSubscription) {
      return 'free-badge';
    }

    if (this.template.minimumSubscriptionPlanId === 2) {
      return 'pro-badge';
    }

    if (this.template.minimumSubscriptionPlanId === 3) {
      return 'premium-badge';
    }

    return '';
  }

  getPlanName(): string {
    if (!this.template.requiresSubscription) {
      return 'Free';
    }

    return this.template.minimumSubscriptionPlanName || 'Premium';
  }
}
