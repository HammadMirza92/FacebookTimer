import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLoadingSnackbarModule } from '../mat-and-snackbar/mat-loading-snackbar.module';
import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting-sidebar/setting.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { PasswordUpdateComponent } from './password-update/password-update.component';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { UserService } from './user.service';



@NgModule({
  declarations: [
    SettingComponent,
    SecuritySettingsComponent,
    AccountInfoComponent,
    PasswordUpdateComponent,
    ProfileHeaderComponent,
  ],
  imports: [
    CommonModule,
    MatLoadingSnackbarModule,
    ReactiveFormsModule,
    SettingRoutingModule
  ],
  providers: [
    UserService
  ]
})
export class SettingModule {}
