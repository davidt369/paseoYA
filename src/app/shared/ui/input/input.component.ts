import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5 w-full">
      @if (label()) {
        <label [for]="id()" class="block text-xs font-semibold text-slate-700">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500 font-bold ml-0.5">*</span>
          }
        </label>
      }

      <div class="relative">
        <input
          [id]="id()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          (input)="onInput($event)"
          [class]="inputClasses()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="error() ? id() + '-error' : null"
        />
        <ng-content select="[input-suffix]"></ng-content>
      </div>

      @if (error()) {
        <p [id]="id() + '-error'" class="text-xs text-red-600 font-medium mt-1 flex items-center gap-1" role="alert">
          <svg class="size-3.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ error() }}
        </p>
      } @else if (helper()) {
        <p class="text-[11px] text-slate-500 mt-1">{{ helper() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent {
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  label = input<string>('');
  type = input<string>('text');
  value = input<string | number>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>('');
  helper = input<string>('');

  valueChange = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  inputClasses(): string {
    const base = 'w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-xl transition duration-150 focus:outline-none focus:bg-white touch-target disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed';
    const state = this.error()
      ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-500'
      : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900';
    return `${base} ${state}`;
  }
}
