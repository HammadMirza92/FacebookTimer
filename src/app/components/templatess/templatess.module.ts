import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLoadingSnackbarModule } from '../mat-and-snackbar/mat-loading-snackbar.module';
import { TemplateAdminComponent } from './template-admin/template-admin.component';
import { TemplateEditComponent } from './template-edit/template-edit.component';
import { TemplateLibraryComponent } from './template-library/template-library.component';
import { TemplatePreviewComponent } from './template-preview/template-preview.component';
import { TemplateService } from './template.service';
import { TemplateCardComponent } from './templates-card/template-card.component';
import { TemplatesRoutingModule } from './templatess-routing.module';



@NgModule({
  declarations: [
    TemplateAdminComponent,
    TemplateEditComponent,
    TemplateLibraryComponent,
    TemplatePreviewComponent,
    TemplateCardComponent
  ],
  imports: [
    CommonModule,
    MatLoadingSnackbarModule,
    ReactiveFormsModule,
    TemplatesRoutingModule,
    FormsModule,
  ],
  providers: [
    TemplateService,
  ]
})
export class TemplatesModule {}
