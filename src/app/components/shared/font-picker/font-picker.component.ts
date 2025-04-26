import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-font-picker',
  templateUrl: './font-picker.component.html',
  styleUrls: ['./font-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FontPickerComponent),
      multi: true
    }
  ]
})
export class FontPickerComponent implements ControlValueAccessor {
  @Input() label: string = 'Font';

  fontFamilies: string[] = [
    'Arial, sans-serif',
    'Verdana, sans-serif',
    'Helvetica, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Times New Roman, serif',
    'Georgia, serif',
    'Garamond, serif',
    'Courier New, monospace',
    'Brush Script MT, cursive',
    'Impact, fantasy',
    'Comic Sans MS, cursive'
  ];

  selectedFont: string = 'Arial, sans-serif';
  disabled: boolean = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  selectFont(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedFont = value;
    this.onChange(this.selectedFont);
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(font: string): void {
    this.selectedFont = font || 'Arial, sans-serif';
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

  getFontStyle(font: string): { [key: string]: string } {
    return {
      'font-family': font
    };
  }
}
