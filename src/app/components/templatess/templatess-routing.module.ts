import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateLibraryComponent } from './template-library/template-library.component';
import { TemplateAdminComponent } from './template-admin/template-admin.component';
import { TemplateEditComponent } from './template-edit/template-edit.component';
import { TemplatePreviewComponent } from './template-preview/template-preview.component';

const routes: Routes = [
  { path: '', component: TemplateLibraryComponent },
  { path: 'admin', component: TemplateAdminComponent },
  { path: 'edit', component: TemplateEditComponent },
  { path: 'library', component: TemplateLibraryComponent },
  { path: 'preview', component: TemplatePreviewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule {
  constructor() {
    console.error('asdajsndlaksmd lajvldskc ajs casldj')
  }
}
