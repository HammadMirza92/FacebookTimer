import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacebookPagesComponent } from './facebook-pages/facebook-pages.component';


const routes: Routes = [
  { path: '', component: FacebookPagesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacebookPagesRoutingModule {}
