import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() label: string = 'Color';
  @Input() presetColors: string[] = [
    '#000000', '#FFFFFF', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
  ];

  color: string = '#000000';
  disabled: boolean = false;
  isOpen: boolean = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  togglePicker(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectColor(color: string): void {
    this.color = color;
    this.onChange(this.color);
    this.onTouched();
    this.isOpen = false;
  }

  // ControlValueAccessor methods
  writeValue(color: string): void {
    this.color = color || '#000000';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
