import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLoadingSnackbarModule } from '../mat-and-snackbar/mat-loading-snackbar.module';
import { FooterComponent } from './footer/footer.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LayoutComponent } from './main-layout/layout.component';




@NgModule({
  declarations: [
    FooterComponent,
    NavbarComponent,
    NotFoundComponent,
    SidenavComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    MatLoadingSnackbarModule,
  ],
  providers: [
  ]
})
export class LayoutModule {}
