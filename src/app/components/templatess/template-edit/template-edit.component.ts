import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateService } from '../template.service';
import { PostService } from '../../../services/post.service';
import { NotificationService } from '../../../services/notification.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Template } from '../../../models/template.model';

@Component({
  selector: 'app-template-edit',
  templateUrl: './template-edit.component.html',
  styleUrls: ['./template-edit.component.scss']
})
export class TemplateEditComponent implements OnInit {
  templateId!: number;
  template: Template | null = null;
  postForm!: FormGroup;
  previewHtml: SafeHtml | null = null;
  loading = true;
  savingPost = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private templateService: TemplateService,
    private postService: PostService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe(params => {
      if (params['templateId']) {
        this.templateId = +params['templateId'];
        this.loadTemplate();
      } else {
        this.notificationService.showError('No template selected');
        this.router.navigate(['/templates']);
      }
    });
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      eventName: ['', [Validators.required]],
      eventDescription: ['', [Validators.required]],
      eventLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      buttonText: ['Learn More', [Validators.required]],
      scheduledDateTime: [new Date(), [Validators.required]]
    });

    // Update preview when form changes
    this.postForm.valueChanges.subscribe(() => {
      this.updatePreview();
    });
  }

  loadTemplate(): void {
    this.loading = true;
    this.templateService.getTemplateById(this.templateId).subscribe({
      next: (template) => {
        this.template = template;
        this.loading = false;
        this.updatePreview();
      },
      error: (error) => {
        this.notificationService.showError('Failed to load template');
        console.error('Error loading template:', error);
        this.loading = false;
        this.router.navigate(['/templates']);
      }
    });
  }

  updatePreview(): void {
    if (!this.template?.htmlTemplate || !this.postForm.valid) {
      return;
    }

    const formValues = this.postForm.value;
    const targetDate = new Date(formValues.scheduledDateTime);
    const now = new Date();
    const diff = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));

    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = Math.floor(diff % 60);

    // Create substitution values
    const values = {
      eventName: formValues.eventName,
      eventDescription: formValues.eventDescription,
      eventLink: formValues.eventLink,
      buttonText: formValues.buttonText,
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };

    // Apply substitutions to template
    let previewHtml = this.template.htmlTemplate;
    Object.keys(values).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, values[key as keyof typeof values]);
    });

    // Sanitize HTML
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
  }

  onSubmit(): void {
    if (this.postForm.invalid || !this.template) {
      return;
    }

    this.savingPost = true;
    const formValues = this.postForm.value;

    // Create post data
    const postData = {
      title: formValues.title,
      description: formValues.description,
      templateId: this.templateId,
      scheduledDateTime: formValues.scheduledDateTime,
      templateValues: {
        eventName: formValues.eventName,
        eventDescription: formValues.eventDescription,
        eventLink: formValues.eventLink,
        buttonText: formValues.buttonText
      }
    };

    this.postService.createPost(postData).subscribe({
      next: (post) => {
        this.notificationService.showSuccess('Post created successfully');
        this.router.navigate(['/posts']);
        this.savingPost = false;
      },
      error: (error) => {
        this.notificationService.showError('Failed to create post');
        console.error('Error creating post:', error);
        this.savingPost = false;
      }
    });
  }
}
