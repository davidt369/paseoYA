import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../core/models';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

interface StepInfo {
  key: OrderStatus;
  label: string;
  sublabel: string;
  icon: IconName;
}

@Component({
  selector: 'app-order-stepper',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="py-2">
      <!-- Mobile Compact Timeline -->
      <ol class="relative border-l-2 border-slate-200 ml-3.5 space-y-5 my-2">
        @for (step of steps; track step.key; let idx = $index) {
          <li class="relative pl-6">
            <!-- Icon/Bullet Marker -->
            <span
              class="absolute -left-[17px] top-0.5 flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors"
              [class]="getMarkerClasses(idx)"
              [attr.aria-current]="isCurrent(step.key) ? 'step' : null"
            >
              @if (isCompleted(idx)) {
                <svg class="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              } @else if (isCurrent(step.key)) {
                <span class="size-2.5 rounded-full bg-white animate-pulse"></span>
              } @else {
                <app-icon [name]="step.icon" [size]="16" />
              }
            </span>

            <!-- Step Details -->
            <div class="flex flex-col">
              <span
                class="text-xs font-bold leading-tight"
                [class]="getTextClasses(step.key, idx)"
              >
                {{ step.label }}
              </span>
              <span class="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {{ step.sublabel }}
              </span>
            </div>
          </li>
        }
      </ol>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStepperComponent {
  currentStatus = input.required<OrderStatus | string>();

  readonly steps: StepInfo[] = [
    { key: 'recibido', label: '1. Pedido Recibido', sublabel: 'Registrado en PaseoYa y enviado a la tienda', icon: 'note-edit' },
    { key: 'confirmado', label: '2. Confirmado por Tienda', sublabel: 'El comercio aceptó tu orden y reservó stock', icon: 'check' },
    { key: 'preparando', label: '3. En Preparación', sublabel: 'Empaquetando en el local comercial', icon: 'package' },
    { key: 'listo_para_recoger', label: '4. Listo para Retirar', sublabel: '¡Pasa al local con tu código QR de retiro!', icon: 'bell' },
    { key: 'cliente_llego', label: '5. Llegaste al Local', sublabel: 'Notificaste tu presencia en el mostrador', icon: 'map-pin' },
    { key: 'entregado', label: '6. Entregado', sublabel: 'Pedido retirado en el mostrador del local', icon: 'party' },
  ];

  private readonly statusOrder: OrderStatus[] = [
    'recibido',
    'confirmado',
    'preparando',
    'listo_para_recoger',
    'cliente_llego',
    'entregado',
  ];

  currentIndex = computed(() => {
    return this.statusOrder.indexOf(this.currentStatus() as OrderStatus);
  });

  isCompleted(stepIdx: number): boolean {
    return stepIdx < this.currentIndex();
  }

  isCurrent(statusKey: OrderStatus): boolean {
    return this.currentStatus() === statusKey;
  }

  getMarkerClasses(stepIdx: number): string {
    const curIdx = this.currentIndex();
    if (stepIdx < curIdx) {
      return 'bg-emerald-600 text-white ring-4 ring-emerald-50';
    }
    if (stepIdx === curIdx) {
      return 'bg-slate-900 text-white ring-4 ring-slate-100 shadow-xs';
    }
    return 'bg-slate-100 text-slate-400 border border-slate-200';
  }

  getTextClasses(statusKey: OrderStatus, stepIdx: number): string {
    const curIdx = this.currentIndex();
    if (stepIdx === curIdx) {
      return 'text-slate-900 font-extrabold';
    }
    if (stepIdx < curIdx) {
      return 'text-emerald-700';
    }
    return 'text-slate-400';
  }
}
