import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() label = '';
  @Input() type: 'text' | 'date' | 'email' | 'password' = 'text';
  @Input() placeholder = '';
  @Input() mask = '';

  value: string | null = null;
  onChange: (value: string | null) => void = () => {};
  onTouched: () => void = () => {};
  disabled = false;
  showPassword = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.placeholder) {
      this.placeholder = `Digite seu ${this.label.toLowerCase()}...`;
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  writeValue(value: string | null): void {
    this.value = value;

    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
