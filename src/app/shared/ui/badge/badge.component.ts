import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="badgeConfig().classes"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-2xs select-none"
    >
      <span class="size-1.5 rounded-full" [class]="badgeConfig().dotClass"></span>
      {{ badgeConfig().label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<OrderStatus | string>();

  badgeConfig = computed(() => {
    const s = this.status();
    switch (s) {
      case 'recibido':
        return {
          label: 'Recibido',
          classes: 'bg-sky-50 text-sky-800 border-sky-200',
          dotClass: 'bg-sky-500',
        };
      case 'confirmado':
        return {
          label: 'Confirmado',
          classes: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500',
        };
      case 'preparando':
        return {
          label: 'Preparando',
          classes: 'bg-orange-50 text-orange-800 border-orange-200',
          dotClass: 'bg-orange-500',
        };
      case 'listo_para_recoger':
        return {
          label: 'Listo para retirar',
          classes: 'bg-teal-50 text-teal-800 border-teal-200',
          dotClass: 'bg-teal-500 animate-pulse',
        };
      case 'cliente_llego':
        return {
          label: 'Cliente en el local',
          classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dotClass: 'bg-indigo-500',
        };
      case 'entregado':
        return {
          label: 'Entregado',
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-500',
        };
      default:
        return {
          label: s,
          classes: 'bg-slate-50 text-slate-800 border-slate-200',
          dotClass: 'bg-slate-400',
        };
    }
  });
}
