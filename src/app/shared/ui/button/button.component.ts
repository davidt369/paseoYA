import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="handleClick($event)"
      [class]="buttonClasses()"
      [attr.aria-busy]="loading()"
      [attr.aria-label]="ariaLabel() || null"
    >
      @if (loading()) {
        <span class="inline-block size-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  ariaLabel = input<string>('');

  clicked = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  buttonClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold select-none rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer touch-target focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2';
    
    const sizes: Record<ButtonSize, string> = {
      sm: 'min-h-[44px] px-3.5 py-1.5 text-xs',
      md: 'min-h-[44px] px-4 py-2.5 text-sm',
      lg: 'min-h-[48px] px-6 py-3 text-base',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200',
      outline: 'bg-transparent hover:bg-slate-50 text-slate-800 border border-slate-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
      gold: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]} ${width}`;
  }
}
