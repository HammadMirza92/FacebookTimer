import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Template } from '../../../models/template.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TemplateService } from '../../../services/template.service';

@Component({
  selector: 'app-template-preview',
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent implements OnInit {
  @Input() template!: Template;
  @Input() editMode: boolean = false;
  @Output() saveTemplate = new EventEmitter<any>();

  templateForm!: FormGroup;
  previewHtml: SafeHtml | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private templateService: TemplateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.updatePreview();
  }

  initForm(): void {
    // Initialize form with template variables
    const formControls: any = {};

    if (this.template.templateVariables) {
      this.template.templateVariables.forEach(variable => {
        formControls[variable] = ['', Validators.required];
      });
    }

    this.templateForm = this.fb.group(formControls);

    // Set default values
    this.templateForm.setValue({
      eventName: 'My Event Name',
      eventDescription: 'Join us for this amazing event!',
      eventLink: 'https://example.com',
      buttonText: 'RSVP NOW',
      days: '10',
      hours: '12',
      minutes: '30',
      seconds: '00'
    });

    // Subscribe to form changes to update preview
    this.templateForm.valueChanges.subscribe(() => {
      this.updatePreview();
    });
  }

  updatePreview(): void {
    if (!this.template.htmlTemplate) {
      return;
    }

    this.loading = true;

    if (this.editMode) {
      // In edit mode, apply form values
      const values = this.templateForm.value;
      let previewHtml = this.template.htmlTemplate;

      // Apply substitutions
      Object.keys(values).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        previewHtml = previewHtml.replace(regex, values[key]);
      });

      // Sanitize the HTML
      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
      this.loading = false;
    } else {
      // In view mode, request preview from server
      const values = this.templateForm.value;

      this.templateService.previewTemplate(this.template.id, values).subscribe(
        (result: any) => {
          this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(result.html);
          this.loading = false;
        },
        error => {
          console.error('Failed to get template preview', error);
          this.loading = false;
        }
      );
    }
  }

  onSave(): void {
    if (this.templateForm.valid) {
      this.saveTemplate.emit(this.templateForm.value);
    }
  }
}
