import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownTimerComponent } from '../shared/countdown-timer/countdown-timer.component';
import { FontPickerComponent } from '../shared/font-picker/font-picker.component';
import { ColorPickerComponent } from '../shared/color-picker/color-picker.component';



@NgModule({
  declarations: [
    CountdownTimerComponent,
    FontPickerComponent,
    ColorPickerComponent,
  ],
  imports: [
   CommonModule,

  ],
  providers: [

  ],
})
export class SharedModule {}
