import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacebookPagesRoutingModule } from './facebook-pages-routing.module';
import { FacebookPagesComponent } from './facebook-pages/facebook-pages.component';
import { FacebookPageService } from './facebook-page.service';
import { MatLoadingSnackbarModule } from '../mat-and-snackbar/mat-loading-snackbar.module';



@NgModule({
  declarations: [
    FacebookPagesComponent
  ],
  imports: [
    CommonModule,
    FacebookPagesRoutingModule,
    MatLoadingSnackbarModule,
  ],
  providers: [
    FacebookPageService
  ],
})
export class FacebookPagesModule {}
