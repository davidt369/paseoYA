import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Order, OrderStatus } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';

@Component({
  selector: 'app-pedidos-comercio',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ButtonComponent, StateMessageComponent],
  template: `
    <div class="space-y-5 pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black tracking-tight text-slate-900">Bandeja de Pedidos</h1>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En Vivo
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Gestiona la preparación y retiro de compras en tu tienda de Paseo Aranjuez.
          </p>
        </div>

        <a
          routerLink="/comercio/validar"
          class="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition touch-target"
        >
          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span>Escanear QR de Retiro</span>
        </a>
      </div>

      <!-- Urgent Customer Arrival Notification Banner -->
      @if (arrivedOrders().length > 0) {
        <div class="p-4 bg-indigo-50 border-2 border-indigo-300 rounded-2xl shadow-xs space-y-2 animate-pulse">
          <div class="flex items-center gap-2 font-bold text-indigo-950 text-xs">
            <span class="text-base">🔔</span>
            <span>¡CLIENTE EN MOSTRADOR! ({{ arrivedOrders().length }} esperando)</span>
          </div>
          <p class="text-[11px] text-indigo-900 leading-snug">
            Un cliente ya llegó a tu local comercial para retirar su pedido. Escanea su código QR o solicita su PIN de 4 dígitos.
          </p>
        </div>
      }

      <!-- Status Filter Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        @for (tab of tabs; track tab.key) {
          <button
            type="button"
            (click)="selectTab(tab.key)"
            [class]="activeTab() === tab.key ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-700 border border-slate-200'"
            class="px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer touch-target flex items-center gap-1.5"
          >
            <span>{{ tab.label }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] tabular-nums"
                  [class]="activeTab() === tab.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'">
              {{ getCount(tab.key) }}
            </span>
          </button>
        }
      </div>

      <!-- Orders List -->
      @if (filteredOrders().length === 0) {
        <app-state-message
          type="empty"
          title="No hay pedidos en esta sección"
          message="Los pedidos asignados a tu tienda aparecerán aquí automáticamente en tiempo real."
        />
      } @else {
        <div class="space-y-3.5">
          @for (order of filteredOrders(); track order.id) {
            <div
              class="bg-white rounded-2xl border p-4 shadow-2xs space-y-3 transition"
              [class]="order.estado === 'cliente_llego' ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200/90'"
            >
              <!-- Order Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-black text-slate-900">
                      {{ order.pickup_code }}
                    </span>
                    <span class="text-[11px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      PIN: {{ order.pin_seguridad }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 mt-1">
                    Cliente: <strong>{{ order.cliente?.nombre_completo || 'Cliente Paseo' }}</strong>
                  </p>
                  <p class="text-[11px] text-slate-400">
                    Ventana: {{ order.ventana_retiro }}
                  </p>
                </div>

                <app-status-badge [status]="order.estado" />
              </div>

              <!-- Items Breakdown -->
              <div class="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs border border-slate-100">
                @for (item of order.items; track item.product_id) {
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-slate-800">
                      {{ item.cantidad }} &times; {{ item.nombre_producto }}
                    </span>
                    <span class="tabular-nums font-bold text-slate-900">
                      Bs. {{ item.subtotal | number:'1.2-2' }}
                    </span>
                  </div>
                }
                @if (order.nota) {
                  <p class="text-[11px] text-amber-800 pt-1 border-t border-slate-200/80 italic">
                    Nota del cliente: "{{ order.nota }}"
                  </p>
                }
              </div>

              <!-- Footer Actions (State Machine Progression) -->
              <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block leading-none">Total Pedido</span>
                  <span class="text-base font-black text-slate-900 tabular-nums">
                    Bs. {{ order.total | number:'1.2-2' }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Action button based on state -->
                  @switch (order.estado) {
                    @case ('recibido') {
                      <app-button
                        variant="primary"
                        size="sm"
                        (clicked)="advanceStatus(order, 'confirmado', 'Pedido aceptado por el comercio')"
                      >
                        ✅ Confirmar Pedido
                      </app-button>
                    }
                    @case ('confirmado') {
                      <app-button
                        variant="gold"
                        size="sm"
                        (clicked)="advanceStatus(order, 'preparando', 'Empaquetando productos en la tienda')"
                      >
                        📦 Iniciar Preparación
                      </app-button>
                    }
                    @case ('preparando') {
                      <app-button
                        variant="primary"
                        size="sm"
                        (clicked)="advanceStatus(order, 'listo_para_recoger', 'Pedido listo en el mostrador')"
                      >
                        🔔 Marcar Listo para Retiro
                      </app-button>
                    }
                    @case ('listo_para_recoger') {
                      <a
                        [routerLink]="['/comercio/validar']"
                        [queryParams]="{ orderId: order.id, code: order.pickup_code }"
                        class="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-800 transition"
                      >
                        📷 Escanear para Entregar
                      </a>
                    }
                    @case ('cliente_llego') {
                      <a
                        [routerLink]="['/comercio/validar']"
                        [queryParams]="{ orderId: order.id, code: order.pickup_code }"
                        class="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-indigo-700 transition animate-pulse"
                      >
                        ⚡ Validar Entrega Inmediata
                      </a>
                    }
                    @case ('entregado') {
                      <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Retirado + Parqueo emitido
                      </span>
                    }
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosComercioComponent implements OnInit, OnDestroy {
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  activeTab = signal<string>('todos');
  private channel: any = null;

  readonly tabs = [
    { key: 'todos', label: 'Todos' },
    { key: 'recibido', label: 'Nuevos' },
    { key: 'en_proceso', label: 'En Preparación' },
    { key: 'por_retirar', label: 'Por Retirar' },
    { key: 'entregado', label: 'Entregados' },
  ];

  ngOnInit(): void {
    this.refreshOrders();
    this.subscribeRealtime();
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.channel.unsubscribe();
    }
  }

  async refreshOrders(): Promise<void> {
    await this.catalogService.loadOrders();
    const storeId = this.authService.profile()?.store_id || 'a0000000-0000-0000-0000-000000000001';
    const list = this.catalogService.getStoreOrders(storeId);
    this.orders.set(list);
  }

  private subscribeRealtime(): void {
    try {
      this.channel = this.supabase
        .channel('merchant-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            this.refreshOrders();
            this.toastService.info('Actualización en tiempo real de pedidos.');
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Merchant realtime fallback:', e);
    }
  }

  selectTab(tabKey: string): void {
    this.activeTab.set(tabKey);
  }

  filteredOrders(): Order[] {
    const tab = this.activeTab();
    const list = this.orders();

    switch (tab) {
      case 'recibido':
        return list.filter((o) => o.estado === 'recibido');
      case 'en_proceso':
        return list.filter((o) => o.estado === 'confirmado' || o.estado === 'preparando');
      case 'por_retirar':
        return list.filter((o) => o.estado === 'listo_para_recoger' || o.estado === 'cliente_llego');
      case 'entregado':
        return list.filter((o) => o.estado === 'entregado');
      case 'todos':
      default:
        return list;
    }
  }

  arrivedOrders(): Order[] {
    return this.orders().filter((o) => o.estado === 'cliente_llego');
  }

  getCount(tabKey: string): number {
    const list = this.orders();
    switch (tabKey) {
      case 'recibido':
        return list.filter((o) => o.estado === 'recibido').length;
      case 'en_proceso':
        return list.filter((o) => o.estado === 'confirmado' || o.estado === 'preparando').length;
      case 'por_retirar':
        return list.filter((o) => o.estado === 'listo_para_recoger' || o.estado === 'cliente_llego').length;
      case 'entregado':
        return list.filter((o) => o.estado === 'entregado').length;
      case 'todos':
      default:
        return list.length;
    }
  }

  async advanceStatus(order: Order, nextState: OrderStatus, note: string): Promise<void> {
    const res = await this.catalogService.changeOrderStatus(order.id, nextState, note);
    if (res.success) {
      this.toastService.success(`Pedido ${order.pickup_code} actualizado a: ${nextState}`);
      this.refreshOrders();
    } else {
      this.toastService.error(res.error || 'No se pudo actualizar el estado');
    }
  }
}
