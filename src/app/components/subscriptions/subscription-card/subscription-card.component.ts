import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SubscriptionPlan } from '../../../models/subscription-plan.model';

@Component({
  selector: 'app-subscription-card',
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss']
})
export class SubscriptionCardComponent {
  @Input() plan!: SubscriptionPlan;
  @Input() currentPlan: boolean = false;
  @Input() features: string[] = [];
  @Input() loading: boolean = false;
  @Output() subscribe = new EventEmitter<SubscriptionPlan>();

  constructor() { }

  onSubscribe(): void {
    if (!this.currentPlan && !this.loading) {
      this.subscribe.emit(this.plan);
    }
  }

  getPlanColor(): string {
    if (this.plan.id === 1) {
      return 'basic-color';
    } else if (this.plan.id === 2) {
      return 'pro-color';
    } else if (this.plan.id === 3) {
      return 'premium-color';
    }
    return '';
  }
}
