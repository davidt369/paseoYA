import { Component, inject, signal, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order } from '../../../../core/models';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';

@Component({
  selector: 'app-ventas-comercio',
  standalone: true,
  imports: [CommonModule, StateMessageComponent],
  template: `
    <div class="space-y-6 pb-8">
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-xl font-black tracking-tight text-slate-900">Resumen de Ventas de Hoy</h1>
        <p class="text-xs text-slate-500">
          Métricas y recaudación por retiro presencial en Paseo Aranjuez.
        </p>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Revenue Card -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ventas Totales Hoy</span>
          <div class="text-2xl font-black text-slate-900 tabular-nums">
            Bs. {{ totalVentas() | number:'1.2-2' }}
          </div>
          <p class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>●</span> Recaudación confirmada por QR
          </p>
        </div>

        <!-- Orders Count -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pedidos Entregados</span>
          <div class="text-2xl font-black text-emerald-700 tabular-nums">
            {{ deliveredOrders().length }} <span class="text-xs text-slate-400 font-normal">/ {{ allOrders().length }} tot.</span>
          </div>
          <p class="text-[10px] text-slate-500">
            {{ pendingOrdersCount() }} pendientes de retiro
          </p>
        </div>

        <!-- Average Ticket -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ticket Promedio</span>
          <div class="text-2xl font-black text-amber-800 tabular-nums">
            Bs. {{ averageTicket() | number:'1.2-2' }}
          </div>
          <p class="text-[10px] text-slate-500">
            Por compra retirada en local
          </p>
        </div>
      </div>

      <!-- Pickup Operations Stats -->
      <div class="p-4 bg-slate-900 text-white rounded-2xl shadow-sm flex items-center justify-between">
        <div class="space-y-0.5">
          <span class="text-xs font-bold text-emerald-400">🎫 Retiros Completados Hoy</span>
          <p class="text-[11px] text-slate-300">
            Has entregado <strong>{{ deliveredOrders().length }}</strong> pedidos en mostrador a tus clientes de PaseoYa.
          </p>
        </div>
        <span class="text-xs font-black text-white px-2.5 py-1 bg-white/10 rounded-xl border border-white/20">
          Paseo Aranjuez
        </span>
      </div>

      <!-- Orders Breakdown Table -->
      <section class="space-y-3">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
          Transacciones del Día ({{ allOrders().length }})
        </h2>

        @if (allOrders().length === 0) {
          <app-state-message
            type="empty"
            title="Sin ventas registradas hoy"
            message="Los pedidos confirmados de tu tienda se listarán aquí en tiempo real."
          />
        } @else {
          <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div class="divide-y divide-slate-100">
              @for (order of allOrders(); track order.id) {
                <div class="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div class="space-y-0.5 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-slate-900">{{ order.pickup_code }}</span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded font-bold"
                            [class]="order.estado === 'entregado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                        {{ order.estado === 'entregado' ? 'Entregado' : order.estado }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500 truncate">
                      Cliente: {{ order.cliente?.nombre_completo || 'Cliente Paseo' }} &middot; {{ order.items?.length || 1 }} artículo(s)
                    </p>
                  </div>

                  <div class="text-right shrink-0">
                    <span class="font-black text-sm text-slate-900 tabular-nums block">
                      Bs. {{ order.total | number:'1.2-2' }}
                    </span>
                    <span class="text-[10px] text-slate-400">
                      {{ order.created_at | date:'shortTime' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentasComercioComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);

  allOrders = signal<Order[]>([]);

  deliveredOrders = computed(() =>
    this.allOrders().filter((o) => o.estado === 'entregado')
  );

  totalVentas = computed(() =>
    this.deliveredOrders().reduce((sum, o) => sum + o.total, 0)
  );

  pendingOrdersCount = computed(() =>
    this.allOrders().filter((o) => o.estado !== 'entregado').length
  );

  averageTicket = computed(() => {
    const list = this.deliveredOrders();
    return list.length > 0 ? this.totalVentas() / list.length : 0;
  });

  ngOnInit(): void {
    const storeId = this.authService.profile()?.store_id || 'a0000000-0000-0000-0000-000000000001';
    this.allOrders.set(this.catalogService.getStoreOrders(storeId));
  }
}
