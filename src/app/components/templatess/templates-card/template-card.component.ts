import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit, SecurityContext } from '@angular/core';
import { Template } from '../../../models/template.model';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-template-card',
  templateUrl: './template-card.component.html',
  styleUrls: ['./template-card.component.scss']
})
export class TemplateCardComponent implements OnInit, AfterViewInit {
  @Input() template!: Template;
  @Input() canUse: boolean = true;
  @Output() useTemplate = new EventEmitter<Template>();
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  previewSrc: SafeResourceUrl | null = null;
  templateHtml: string = '';

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Prepare the HTML for the iframe
    this.prepareTemplateHtml();
  }

  ngAfterViewInit(): void {
    // Once the iframe is loaded, we can directly inject the content
    setTimeout(() => {
      this.injectContentToIframe();
    }, 100);
  }

  prepareTemplateHtml(): void {
    if (!this.template.htmlTemplate) {
      return;
    }

    // Create a preview with placeholder values
    let previewHtml = this.template.htmlTemplate;

    // Replace template variables with sample values
    const placeholders = {
      'eventName': 'EVENT NAME IS COMING!',
      'eventDescription': 'Join us for this amazing event!',
      'eventLink': '#',
      'buttonText': 'REGISTER NOW',
      'days': '01',
      'hours': '12',
      'minutes': '30',
      'seconds': '00'
    };

    // Apply substitutions
    Object.keys(placeholders).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, placeholders[key as keyof typeof placeholders]);
    });

    // Create a data URL for the iframe
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    // Save the HTML for direct injection
    this.templateHtml = previewHtml;
  }

  injectContentToIframe(): void {
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

    return this.template.minimumSubscriptionPlanName || (this.template.minimumSubscriptionPlanId === 2 ? 'Pro' : 'Premium');
  }
}
