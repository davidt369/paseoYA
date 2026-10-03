import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant()) {
      @case ('product') {
        <div class="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-3 animate-pulse">
          <div class="w-full aspect-square bg-slate-200 rounded-xl"></div>
          <div class="h-3.5 bg-slate-200 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 rounded w-1/2"></div>
          <div class="flex justify-between items-center pt-1">
            <div class="h-4 bg-slate-200 rounded w-1/3"></div>
            <div class="size-8 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      }
      @case ('card') {
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 animate-pulse">
          <div class="h-4 bg-slate-200 rounded w-2/5"></div>
          <div class="h-3 bg-slate-200 rounded w-full"></div>
          <div class="h-3 bg-slate-200 rounded w-4/5"></div>
          <div class="h-9 bg-slate-200 rounded-xl w-full mt-2"></div>
        </div>
      }
      @case ('list') {
        <div class="space-y-2 animate-pulse">
          @for (i of countArray(); track i) {
            <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/70">
              <div class="size-12 bg-slate-200 rounded-lg shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 bg-slate-200 rounded w-1/2"></div>
                <div class="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          }
        </div>
      }
      @default {
        <div
          class="animate-pulse bg-slate-200 rounded-lg"
          [style.width]="width()"
          [style.height]="height()"
        ></div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  variant = input<'text' | 'card' | 'product' | 'list'>('text');
  width = input<string>('100%');
  height = input<string>('1rem');
  count = input<number>(3);

  countArray(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
