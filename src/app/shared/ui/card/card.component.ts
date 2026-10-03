import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="cardClasses()"
    >
      @if (title()) {
        <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-sm md:text-base leading-tight">{{ title() }}</h3>
            @if (subtitle()) {
              <p class="text-xs text-slate-500 mt-0.5">{{ subtitle() }}</p>
            }
          </div>
          <ng-content select="[card-header-action]"></ng-content>
        </div>
      }
      <div [class]="paddingClass()">
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <div class="px-5 py-3 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  hoverable = input<boolean>(false);
  hasFooter = input<boolean>(false);

  paddingClass(): string {
    switch (this.padding()) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'lg': return 'p-6';
      case 'md':
      default: return 'p-5';
    }
  }

  cardClasses(): string {
    const base = 'bg-white rounded-2xl border border-slate-200/80 shadow-xs transition duration-150';
    const hover = this.hoverable() ? 'hover:shadow-md hover:border-slate-300' : '';
    return `${base} ${hover}`;
  }
}
