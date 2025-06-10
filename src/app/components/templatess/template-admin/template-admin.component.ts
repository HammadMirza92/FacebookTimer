import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateService } from '../../../services/template.service';
import { NotificationService } from '../../../services/notification.service';
import { SubscriptionPlan } from '../../../models/subscription-plan.model';
import { Template } from '../../../models/template.model';

@Component({
  selector: 'app-template-admin',
  templateUrl: './template-admin.component.html',
  styleUrls: ['./template-admin.component.scss']
})
export class TemplateAdminComponent implements OnInit {
  templates: Template[] = [];
  subscriptionPlans: SubscriptionPlan[] = [];
  templateForm!: FormGroup;
  isEditMode = false;
  currentTemplateId?: number;
  loading = false;
  htmlEditor = false; // Toggle for HTML editor

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService,
    private notificationService: NotificationService,
   // private SubscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadTemplates();
    //this.loadSubscriptionPlans();
  }

  initForm(): void {
    this.templateForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      backgroundImageUrl: [''],
      defaultFontFamily: ['Arial, sans-serif', [Validators.required]],
      primaryColor: ['#3f51b5', [Validators.required]],
      requiresSubscription: [false],
      minimumSubscriptionPlanId: [null],
      htmlTemplate: ['', [Validators.required]]
    });

    // Update form validation based on requiresSubscription
    this.templateForm.get('requiresSubscription')?.valueChanges.subscribe(requiresSub => {
      const minSubPlanControl = this.templateForm.get('minimumSubscriptionPlanId');
      if (requiresSub) {
        minSubPlanControl?.setValidators([Validators.required]);
      } else {
        minSubPlanControl?.clearValidators();
        minSubPlanControl?.setValue(null);
      }
      minSubPlanControl?.updateValueAndValidity();
    });
  }

  loadTemplates(): void {
    this.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load templates');
        console.error('Error loading templates:', error);
        this.loading = false;
      }
    });
  }

  // loadSubscriptionPlans(): void {
  //   this.SubscriptionService.getSubscriptionPlans().subscribe({
  //     next: (plans) => {
  //       this.subscriptionPlans = plans;
  //     },
  //     error: (error) => {
  //       this.notificationService.showError('Failed to load subscription plans');
  //       console.error('Error loading plans:', error);
  //     }
  //   });
  // }

  onSubmit(): void {
    if (this.templateForm.invalid) {
      return;
    }

    const templateData = this.templateForm.value;
    this.loading = true;

    if (this.isEditMode && this.currentTemplateId) {
      // Update existing template
      this.templateService.updateTemplate(this.currentTemplateId, templateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Template updated successfully');
          this.resetForm();
          this.loadTemplates();
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to update template');
          console.error('Error updating template:', error);
          this.loading = false;
        }
      });
    } else {
      // Create new template
      this.templateService.createTemplate(templateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Template created successfully');
          this.resetForm();
          this.loadTemplates();
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.showError('Failed to create template');
          console.error('Error creating template:', error);
          this.loading = false;
        }
      });
    }
  }

  editTemplate(template: Template): void {
    this.isEditMode = true;
    this.currentTemplateId = template.id;

    this.templateForm.patchValue({
      name: template.name,
      description: template.description,
      backgroundImageUrl: template.backgroundImageUrl,
      defaultFontFamily: template.defaultFontFamily,
      primaryColor: template.primaryColor,
      requiresSubscription: template.requiresSubscription,
      minimumSubscriptionPlanId: template.minimumSubscriptionPlanId,
      htmlTemplate: template.htmlTemplate
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentTemplateId = undefined;
    this.htmlEditor = false;
    this.templateForm.reset({
      defaultFontFamily: 'Arial, sans-serif',
      primaryColor: '#3f51b5',
      requiresSubscription: false
    });
  }

  toggleHtmlEditor(): void {
    this.htmlEditor = !this.htmlEditor;
  }

  loadDefaultTemplate(): void {
    // Load a default HTML template as a starting point
    const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Countdown Timer Post</title>
  <style>
    .countdown-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
      background-color: #1a1a1a;
      color: white;
      text-align: center;
    }

    .event-title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 30px;
      text-transform: uppercase;
    }

    .countdown-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
    }

    .time-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 5px;
    }

    .time-value {
      font-size: 48px;
      font-weight: bold;
      background-color: #333;
      border-radius: 8px;
      padding: 10px;
      min-width: 80px;
    }

    .time-label {
      margin-top: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .time-separator {
      font-size: 48px;
      margin: 0 5px;
      padding-bottom: 25px;
    }

    .event-details {
      max-width: 500px;
    }

    .event-description {
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 1.5;
    }

    .event-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #ff4500;
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
    }

    .event-button:hover {
      background-color: #ff6a33;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 69, 0, 0.4);
    }
  </style>
</head>
<body>
<div class="countdown-container">
  <h1 class="event-title">{{eventName}}</h1>

  <div class="countdown-timer">
    <div class="time-block">
      <div class="time-value">{{days}}</div>
      <div class="time-label">Days</div>
    </div>
    <div class="time-separator">:</div>
    <div class="time-block">
      <div class="time-value">{{hours}}</div>
      <div class="time-label">Hours</div>
    </div>
    <div class="time-separator">:</div>
    <div class="time-block">
      <div class="time-value">{{minutes}}</div>
      <div class="time-label">Minutes</div>
    </div>
    <div class="time-separator">:</div>
    <div class="time-block">
      <div class="time-value">{{seconds}}</div>
      <div class="time-label">Seconds</div>
    </div>
  </div>

  <div class="event-details">
    <p class="event-description">{{eventDescription}}</p>
    <a href="{{eventLink}}" class="event-button">{{buttonText}}</a>
  </div>
</div>
</body>
</html>`;

    this.templateForm.patchValue({
      htmlTemplate: defaultTemplate
    });
  }
}
