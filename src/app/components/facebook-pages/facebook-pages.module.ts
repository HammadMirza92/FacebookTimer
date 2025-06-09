import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/mat-UI/material.module';
import { FacebookPagesRoutingModule } from './facebook-pages-routing.module';
import { FacebookPagesComponent } from './facebook-pages/facebook-pages.component';



@NgModule({
  declarations: [
    FacebookPagesComponent
  ],
  imports: [
    CommonModule,
    FacebookPagesRoutingModule,
    MaterialModule,
  ]
})
export class FacebookPagesModule {

}
