import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostPreview } from '../../../models/post-preview.model';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss']
})
export class PostPreviewComponent {
  constructor(
    public dialogRef: MatDialogRef<PostPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostPreview
  ) { }

  close(): void {
    this.dialogRef.close();
  }
}
