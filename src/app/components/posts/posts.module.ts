import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../mat-and-snackbar/mat-UI/material.module';
import { PostsRoutingModule } from './posts-routing.module';
import { CreatePostComponent } from './create-post/create-post.component';
import { PostListComponent } from './post-list/post-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountdownTimerComponent } from '../shared/countdown-timer/countdown-timer.component';
import { PostPreviewComponent } from './post-preview/post-preview.component';
import { FontPickerComponent } from '../shared/font-picker/font-picker.component';
import { ColorPickerComponent } from '../shared/color-picker/color-picker.component';



@NgModule({
  declarations: [
    CreatePostComponent,
    PostListComponent,
    PostPreviewComponent,
    CountdownTimerComponent,
    FontPickerComponent,
    ColorPickerComponent
  ],
  imports: [
    CommonModule,
    PostsRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  providers: [

  ],
})
export class PostsModule {}
