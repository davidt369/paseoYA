import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto p-4 rounded-xl shadow-lg border text-sm flex items-start gap-3 transition"
          [class]="getClasses(toast.type)"
          role="status"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') {
                <svg class="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
              @case ('error') {
                <svg class="size-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
              @default {
                <svg class="size-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            }
          </div>

          <div class="flex-1">
            @if (toast.title) {
              <p class="font-bold leading-tight">{{ toast.title }}</p>
            }
            <p class="text-xs mt-0.5 leading-snug">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="text-slate-400 hover:text-slate-700 cursor-pointer p-1 -mr-1 -mt-1"
            aria-label="Cerrar notificación"
          >
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  toastService = inject(ToastService);

  getClasses(type: 'success' | 'error' | 'info'): string {
    switch (type) {
      case 'success':
        return 'bg-white text-slate-800 border-emerald-200 shadow-emerald-500/5';
      case 'error':
        return 'bg-white text-slate-800 border-red-200 shadow-red-500/5';
      case 'info':
      default:
        return 'bg-white text-slate-800 border-slate-200 shadow-slate-500/5';
    }
  }
}
