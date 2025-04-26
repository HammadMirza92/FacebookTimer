import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FacebookPageService } from '../../../services/facebook-page.service';
import { NotificationService } from '../../../services/notification.service';
import { LinkPage } from '../../../models/link-page.model';

@Component({
  selector: 'app-link-facebook-page',
  templateUrl: './link-facebook-page.component.html',
  styleUrls: ['./link-facebook-page.component.scss']
})
export class LinkFacebookPageComponent implements OnInit {
  linkPageForm: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private facebookPageService: FacebookPageService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<LinkFacebookPageComponent>
  ) {
    this.linkPageForm = this.formBuilder.group({
      pageId: ['', Validators.required],
      pageName: ['', Validators.required],
      accessToken: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.linkPageForm.invalid) {
      return;
    }

    this.loading = true;
    this.facebookPageService.linkFacebookPage(this.linkPageForm.value).subscribe({
      next: page => {
        this.notificationService.showSuccess(`Successfully linked Facebook page: ${page.pageName}`);
        this.dialogRef.close(true);
      },
      error: error => {
        this.notificationService.showError(error.error || 'Failed to link Facebook page');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get f() { return this.linkPageForm.controls; }
}
