import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit, OnDestroy {
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

  private routeSubscription: Subscription | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private facebookPageService: FacebookPageService,
    private templateService: TemplateService,
    private notificationService: NotificationService,
    private dialog: MatDialog
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
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
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

    if (this.isEdit) {
      // Edit mode: load post, pages, and templates
      forkJoin({
        post: this.postService.getPostById(this.postId),
       // pages: this.facebookPageService.getUserPages(),
        templates: this.templateService.getTemplates()
      }).subscribe({
        next: result => {
         // this.pages = result.pages;
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
      // Create mode: load pages and templates
      forkJoin({
       // pages: this.facebookPageService.getUserPages(),
        templates: this.templateService.getTemplates()
      }).subscribe({
        next: result => {
         // this.pages = result.pages;
          this.templates = result.templates;

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
          this.notificationService.showError('Failed to load data. Please try again later.');
          this.router.navigate(['/dashboard']);
        }
      });
    }
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
    }
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

    // First save as draft
    this.submitting = true;
    const formData = {...this.postForm.value};
    formData.scheduledFor = null;

    if (this.isEdit) {
      this.postService.updatePost(this.postId, formData).subscribe({
        next: post => {
          // Then publish
          this.postService.publishPost(post.id).subscribe({
            next: result => {
              if (result.success) {
                this.notificationService.showSuccess('Post published successfully!');
                this.router.navigate(['/posts']);
              } else {
                this.notificationService.showError(result.errorMessage || 'Failed to publish post');
              }
              this.submitting = false;
            },
            error: error => {
              this.notificationService.showError(error.error || 'Failed to publish post');
              this.submitting = false;
            }
          });
        },
        error: error => {
          this.notificationService.showError(error.error || 'Failed to save post');
          this.submitting = false;
        }
      });
    } else {
      this.postService.createPost(formData).subscribe({
        next: post => {
          // Then publish
          this.postService.publishPost(post.id).subscribe({
            next: result => {
              if (result.success) {
                this.notificationService.showSuccess('Post published successfully!');
                this.router.navigate(['/posts']);
              } else {
                this.notificationService.showError(result.errorMessage || 'Failed to publish post');
              }
              this.submitting = false;
            },
            error: error => {
              this.notificationService.showError(error.error || 'Failed to publish post');
              this.submitting = false;
            }
          });
        },
        error: error => {
          this.notificationService.showError(error.error || 'Failed to save post');
          this.submitting = false;
        }
      });
    }
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
