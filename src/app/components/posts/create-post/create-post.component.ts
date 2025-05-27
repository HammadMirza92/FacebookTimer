import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { FacebookPageService } from '../../../services/facebook-page.service';
import { TemplateService } from '../../../services/template.service';
import { NotificationService } from '../../../services/notification.service';
import { FacebookPage } from '../../../models/facebook-page.model';
import { Template } from '../../../models/template.model';
import { Post } from '../../../models/post.model';
import { MatDialog } from '@angular/material/dialog';
import { PostPreviewComponent } from '../post-preview/post-preview.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  postForm: FormGroup;
  pages: FacebookPage[] = [];
  templates: Template[] = [];
  loading = true;
  submitting = false;
  isEdit = false;
  postId: number = 0;
  selectedTemplate: Template | null = null;
  selectedPage: FacebookPage | null = null;
  minDateTime = new Date();
  previewSrc: SafeResourceUrl | null = null;
  templateHtml: string = '';

  private routeSubscription: Subscription | null = null;
  private formSubscription: Subscription | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private facebookPageService: FacebookPageService,
    private templateService: TemplateService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.postForm = this.createPostForm();
  }

  ngOnInit(): void {
    this.minDateTime.setMinutes(this.minDateTime.getMinutes() + 5); // Set min date to 5 minutes from now

    this.routeSubscription = this.route.params.subscribe(params => {
      this.postId = params['id'];
      this.isEdit = !!this.postId;

      this.loadInitialData();
    });

    // Subscribe to form changes to update preview in real-time
    this.formSubscription = this.postForm.valueChanges.subscribe(() => {
      this.updateTemplatePreview();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  private createPostForm(): FormGroup {
    return this.formBuilder.group({
      facebookPageId: ['', Validators.required],
      templateId: ['', Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      eventDateTime: ['', Validators.required],
      customFontFamily: [''],
      customPrimaryColor: [''],
      showDays: [true],
      showHours: [true],
      showMinutes: [true],
      showSeconds: [true],
      backgroundImageUrl: [''],
      hasOverlay: [false],
      scheduledFor: [''],
      refreshIntervalInMinutes: [15]
    });
  }

  private loadInitialData(): void {
    this.loading = true;

    // First, load the Facebook pages from the database
    this.facebookPageService.getUserPages().subscribe({
      next: (response) => {
        this.pages = response.pages;

        if (this.isEdit) {
          // Edit mode: load post and templates
          forkJoin({
            post: this.postService.getPostById(this.postId),
            templates: this.templateService.getTemplates()
          }).subscribe({
            next: result => {
              this.templates = result.templates;
              this.populateForm(result.post);
              this.loading = false;
            },
            error: error => {
              this.notificationService.showError('Failed to load post data');
              this.router.navigate(['/posts']);
            }
          });
        } else {
          // Create mode: load templates
          this.templateService.getTemplates().subscribe({
            next: templates => {
              this.templates = templates;

              // Check for query params
              this.route.queryParams.subscribe(params => {
                if (params['pageId']) {
                  this.postForm.patchValue({ facebookPageId: parseInt(params['pageId']) });
                  this.onPageChange();
                }

                if (params['templateId']) {
                  this.postForm.patchValue({ templateId: parseInt(params['templateId']) });
                  this.onTemplateChange();
                }
              });

              this.loading = false;
            },
            error: error => {
              this.notificationService.showError('Failed to load templates. Please try again later.');
              this.router.navigate(['/dashboard']);
            }
          });
        }
      },
      error: error => {
        this.notificationService.showError('Failed to load Facebook pages');
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private populateForm(post: Post): void {
    const formValue = {
      facebookPageId: post.facebookPageId,
      templateId: post.templateId,
      title: post.title,
      description: post.description,
      eventDateTime: new Date(post.eventDateTime),
      customFontFamily: post.customFontFamily,
      customPrimaryColor: post.customPrimaryColor,
      showDays: post.showDays,
      showHours: post.showHours,
      showMinutes: post.showMinutes,
      showSeconds: post.showSeconds,
      backgroundImageUrl: post.backgroundImageUrl,
      hasOverlay: post.hasOverlay,
      scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
      refreshIntervalInMinutes: post.refreshIntervalInMinutes
    };

    this.postForm.patchValue(formValue);
    this.onPageChange();
    this.onTemplateChange();
  }

  onPageChange(): void {
    const pageId = this.postForm.get('facebookPageId')?.value;
    this.selectedPage = this.pages.find(page => page.id === pageId) || null;
  }

  onTemplateChange(): void {
    const templateId = this.postForm.get('templateId')?.value;
    this.selectedTemplate = this.templates.find(template => template.id === templateId) || null;

    if (this.selectedTemplate) {
      // Apply template defaults if custom values are not set
      if (!this.postForm.get('customFontFamily')?.value) {
        this.postForm.patchValue({ customFontFamily: this.selectedTemplate.defaultFontFamily });
      }

      if (!this.postForm.get('customPrimaryColor')?.value) {
        this.postForm.patchValue({ customPrimaryColor: this.selectedTemplate.primaryColor });
      }

      if (this.selectedTemplate.backgroundImageUrl && !this.postForm.get('backgroundImageUrl')?.value) {
        this.postForm.patchValue({ backgroundImageUrl: this.selectedTemplate.backgroundImageUrl });
      }

      // Update template preview
      this.updateTemplatePreview();
    }
  }

  private updateTemplatePreview(): void {
    if (!this.selectedTemplate || !this.selectedTemplate.htmlTemplate) {
      return;
    }

    this.prepareTemplateHtml();
    // Small delay to ensure iframe is ready
    setTimeout(() => {
      this.injectContentToIframe();
    }, 100);
  }

  private prepareTemplateHtml(): void {
    if (!this.selectedTemplate || !this.selectedTemplate.htmlTemplate) {
      return;
    }

    // Create a preview with actual form values
    let previewHtml = this.selectedTemplate.htmlTemplate;

    // Calculate countdown values
    const eventDate = this.postForm.get('eventDateTime')?.value;
    const now = new Date();
    const timeDiff = eventDate ? new Date(eventDate).getTime() - now.getTime() : 0;

    const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((timeDiff % (1000 * 60)) / 1000));

    // Replace template variables with form values
    const replacements = {
      'eventName': this.postForm.get('title')?.value || 'EVENT NAME IS COMING!',
      'eventDescription': this.postForm.get('description')?.value || 'Join us for this amazing event!',
      'eventLink': '#',
      'buttonText': 'REGISTER NOW',
      'days': String(days).padStart(2, '0'),
      'hours': String(hours).padStart(2, '0'),
      'minutes': String(minutes).padStart(2, '0'),
      'seconds': String(seconds).padStart(2, '0')
    };

    // Apply substitutions
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, replacements[key as keyof typeof replacements]);
    });

    // Apply custom styling from form
    const customFontFamily = this.postForm.get('customFontFamily')?.value || this.selectedTemplate.defaultFontFamily;
    const customPrimaryColor = this.postForm.get('customPrimaryColor')?.value || this.selectedTemplate.primaryColor;
    const backgroundImageUrl = this.postForm.get('backgroundImageUrl')?.value || this.selectedTemplate.backgroundImageUrl;

    // Inject custom styles
    if (customFontFamily || customPrimaryColor || backgroundImageUrl) {
      const styleTag = `
        <style>
          body {
            font-family: ${customFontFamily} !important;
            ${backgroundImageUrl ? `background-image: url(${backgroundImageUrl}) !important;` : ''}
            ${backgroundImageUrl ? 'background-size: cover !important; background-position: center !important;' : ''}
          }
          .primary-color, .countdown-timer {
            color: ${customPrimaryColor} !important;
          }
          .primary-bg {
            background-color: ${customPrimaryColor} !important;
          }
          ${this.postForm.get('hasOverlay')?.value ? '.overlay { background: rgba(0,0,0,0.5) !important; }' : ''}
        </style>
      `;
      previewHtml = previewHtml.replace('</head>', `${styleTag}</head>`);
    }

    // Save the HTML for direct injection
    this.templateHtml = previewHtml;
  }

  private injectContentToIframe(): void {
    if (!this.previewFrame || !this.templateHtml) {
      return;
    }

    try {
      // Get the iframe document
      const iframe = this.previewFrame.nativeElement;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Write the HTML directly to the iframe document
        iframeDoc.open();
        iframeDoc.write(this.templateHtml);
        iframeDoc.close();
      }
    } catch (error) {
      console.error('Error injecting content to iframe:', error);
    }
  }

  onPreviewLoad(): void {
    // Called when iframe loads, inject content
    this.injectContentToIframe();
  }

  getPreviewHtml(): string {
    // This method is used by the [srcdoc] attribute as fallback
    return this.templateHtml || '';
  }

  previewPost(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      this.notificationService.showWarning('Please fill in all required fields before previewing');
      return;
    }

    const previewData = {
      title: this.postForm.get('title')?.value,
      description: this.postForm.get('description')?.value,
      eventDateTime: this.postForm.get('eventDateTime')?.value,
      customFontFamily: this.postForm.get('customFontFamily')?.value,
      customPrimaryColor: this.postForm.get('customPrimaryColor')?.value,
      showDays: this.postForm.get('showDays')?.value,
      showHours: this.postForm.get('showHours')?.value,
      showMinutes: this.postForm.get('showMinutes')?.value,
      showSeconds: this.postForm.get('showSeconds')?.value,
      backgroundImageUrl: this.postForm.get('backgroundImageUrl')?.value,
      hasOverlay: this.postForm.get('hasOverlay')?.value
    };

    this.dialog.open(PostPreviewComponent, {
      width: '500px',
      data: previewData
    });
  }

  saveAsDraft(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      this.notificationService.showWarning('Please fill in all required fields');
      return;
    }

    // Clear scheduled date for draft
    const formData = {...this.postForm.value};
    formData.scheduledFor = null;

    this.savePost(formData);
  }

  schedulePost(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      this.notificationService.showWarning('Please fill in all required fields');
      return;
    }

    if (!this.postForm.get('scheduledFor')?.value) {
      this.notificationService.showWarning('Please select a date and time to schedule this post');
      return;
    }

    this.savePost(this.postForm.value);
  }

publishNow(): void {
  if (this.postForm.invalid) {
    this.markFormGroupTouched(this.postForm);
    this.notificationService.showWarning('Please fill in all required fields');
    return;
  }

  this.submitting = true;

  // Prepare form data for saving
  const formData = {
    facebookPageId: parseInt(this.postForm.get('facebookPageId')?.value),
    templateId: parseInt(this.postForm.get('templateId')?.value),
    title: this.postForm.get('title')?.value?.trim(),
    description: this.postForm.get('description')?.value?.trim(),
    eventDateTime: this.postForm.get('eventDateTime')?.value,
    customFontFamily: this.postForm.get('customFontFamily')?.value || '',
    customPrimaryColor: this.postForm.get('customPrimaryColor')?.value || '',
    showDays: this.postForm.get('showDays')?.value || false,
    showHours: this.postForm.get('showHours')?.value || false,
    showMinutes: this.postForm.get('showMinutes')?.value || false,
    showSeconds: this.postForm.get('showSeconds')?.value || false,
    backgroundImageUrl: this.postForm.get('backgroundImageUrl')?.value || '',
    hasOverlay: this.postForm.get('hasOverlay')?.value || false,
    scheduledFor: null, // Clear scheduled date for immediate publishing
    refreshIntervalInMinutes: parseInt(this.postForm.get('refreshIntervalInMinutes')?.value) || 15
  };

  console.log('Saving post data before publishing:', formData);
  // Step 1: Save/Update the post first
  const saveOperation = this.postService.createPost(formData);
  saveOperation.subscribe({
    next: (savedPost) => {
      console.log('Post saved successfully:', savedPost);
      console.log(`Now calling publish endpoint for post ID: ${savedPost.id}`);
        this.notificationService.showSuccess('Post published successfully to Facebook with countdown image!');
        this.router.navigate(['/posts']);
    },
    error: (saveError) => {
      this.submitting = false;
      console.error('Save error:', saveError);

      let errorMessage = this.isEdit ? 'Failed to update post' : 'Failed to create post';

      if (saveError?.status === 400 && saveError?.error) {
        if (saveError.error.message) {
          errorMessage = saveError.error.error;
        } else if (saveError.error.errors) {
          const validationErrors = Object.values(saveError.error.errors).flat();
          errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
        }
      } else if (saveError?.error?.message) {
        errorMessage = saveError.error.message;
      } else if (saveError?.message) {
        errorMessage = saveError.message;
      }

      this.notificationService.showError(errorMessage);
    }
  });
}
  private savePost(formData: any): void {
    this.submitting = true;

    if (this.isEdit) {
      this.postService.updatePost(this.postId, formData).subscribe({
        next: post => {
          this.notificationService.showSuccess('Post updated successfully!');
          this.router.navigate(['/posts']);
        },
        error: error => {
          this.notificationService.showError(error.error || 'Failed to update post');
          this.submitting = false;
        }
      });
    } else {
      this.postService.createPost(formData).subscribe({
        next: post => {
          this.notificationService.showSuccess('Post created successfully!');
          this.router.navigate(['/posts']);
        },
        error: error => {
          this.notificationService.showError(error.error || 'Failed to create post');
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/posts']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get f() { return this.postForm.controls; }
}
