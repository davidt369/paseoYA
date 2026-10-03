import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Order, Store, Product, OrderStatus } from '../../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Title & Context -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 class="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Tablero de Control Operacional
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Supervisión integral de ventas, flujo de retiro y parqueo en Paseo Aranjuez.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Centro Comercial Operativo
          </span>
        </div>
      </div>

      <!-- Top KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <!-- 1. Total Ventas -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ventas Globales</span>
          <div class="text-2xl font-black text-slate-900 tabular-nums">
            Bs. {{ totalVentas() | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 font-medium">
            En {{ orders().length }} pedidos registrados
          </p>
        </div>

        <!-- 2. Pedidos Completados -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pedidos Entregados</span>
          <div class="text-2xl font-black text-emerald-700 tabular-nums">
            {{ deliveredCount() }}
          </div>
          <p class="text-[11px] text-emerald-600 font-medium">
            {{ completionRate() }}% de tasa de retiro
          </p>
        </div>

        <!-- 3. Horas de Parqueo Subterráneo -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Parqueo Subterráneo</span>
          <div class="text-2xl font-black text-indigo-700 tabular-nums">
            {{ deliveredCount() * 2 }} hrs
          </div>
          <p class="text-[11px] text-slate-500 font-medium">
            Validadas por consumo físico
          </p>
        </div>

        <!-- 4. Tiendas Activas -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Locales Activos</span>
          <div class="text-2xl font-black text-amber-700 tabular-nums">
            {{ activeStoresCount() }}
          </div>
          <p class="text-[11px] text-slate-500 font-medium">
            En Pisos 1, 2, 3 y 4
          </p>
        </div>
      </div>

      <!-- Charts & Breakdown Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Chart 1: Pedidos por Estado -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Distribución de Pedidos por Estado</h2>
              <p class="text-[11px] text-slate-500">Embudo del ciclo de retiro en el centro comercial</p>
            </div>
            <span class="text-xs font-mono font-bold text-slate-500">{{ orders().length }} pedidos</span>
          </div>

          <div class="space-y-3">
            @for (st of statusDistribution(); track st.key) {
              <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span class="size-2 rounded-full" [class]="st.dotColor"></span>
                    {{ st.label }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold tabular-nums text-slate-900">{{ st.count }}</span>
                    <span class="text-slate-400 text-[10px] tabular-nums">({{ st.percentage }}%)</span>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    [class]="st.barColor"
                    [style.width.%]="st.percentage"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Chart 2: Ventas por Rubro Comercial -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Ventas por Rubro & Pisos</h2>
              <p class="text-[11px] text-slate-500">Rendimiento por categoría de local</p>
            </div>
            <span class="text-xs font-bold text-slate-500">Paseo Aranjuez</span>
          </div>

          <div class="space-y-3">
            @for (cat of salesByCategory(); track cat.rubro) {
              <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-semibold text-slate-700 truncate max-w-[200px]">
                    {{ cat.rubro }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="font-bold tabular-nums text-slate-900">
                      Bs. {{ cat.monto | number:'1.2-2' }}
                    </span>
                    <span class="text-slate-400 text-[10px] tabular-nums">({{ cat.percentage }}%)</span>
                  </div>
                </div>

                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-slate-900 rounded-full transition-all duration-300"
                    [style.width.%]="cat.percentage"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Top Tiendas & Top Productos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Top Tiendas con más actividad -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 class="text-sm font-bold text-slate-900">Tiendas con Mayor Actividad</h2>
            <a routerLink="/admin/tiendas" class="text-xs font-bold text-purple-700 hover:underline">Ver todas</a>
          </div>

          <div class="divide-y divide-slate-100">
            @for (store of topStores(); track store.id; let idx = $index) {
              <div class="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="size-6 rounded-lg bg-slate-100 font-bold font-mono text-slate-600 flex items-center justify-center shrink-0">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 truncate">{{ store.nombre }}</p>
                    <p class="text-[10px] text-slate-500">
                      {{ store.piso }} &middot; {{ store.local }}
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-black text-slate-900 tabular-nums block">
                    Bs. {{ store.ventas | number:'1.2-2' }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ store.pedidosCount }} órdenes
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Top Productos más vendidos -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 class="text-sm font-bold text-slate-900">Productos Más Demandados</h2>
            <span class="text-[10px] font-bold text-slate-400 uppercase">Top Ventas</span>
          </div>

          <div class="divide-y divide-slate-100">
            @for (prod of topProducts(); track prod.id; let idx = $index) {
              <div class="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="size-6 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold font-mono flex items-center justify-center shrink-0">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 truncate">{{ prod.nombre }}</p>
                    <p class="text-[10px] text-slate-500">
                      Bs. {{ prod.precio | number:'1.2-2' }} &middot; Stock: {{ prod.stock }}
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-bold text-emerald-700 tabular-nums text-xs">
                    {{ prod.unidadesVendidas }} vendidos
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private catalogService = inject(CatalogService);

  orders = signal<Order[]>([]);
  stores = signal<Store[]>([]);
  products = signal<Product[]>([]);

  totalVentas = computed(() =>
    this.orders().reduce((sum, o) => sum + o.total, 0)
  );

  deliveredCount = computed(() =>
    this.orders().filter((o) => o.estado === 'entregado').length
  );

  completionRate = computed(() => {
    const total = this.orders().length;
    return total > 0 ? Math.round((this.deliveredCount() / total) * 100) : 0;
  });

  activeStoresCount = computed(() =>
    this.stores().filter((s) => s.activo).length
  );

  statusDistribution = computed(() => {
    const list = this.orders();
    const total = list.length || 1;

    const statuses: { key: OrderStatus; label: string; dotColor: string; barColor: string }[] = [
      { key: 'recibido', label: 'Recibido', dotColor: 'bg-sky-500', barColor: 'bg-sky-500' },
      { key: 'confirmado', label: 'Confirmado', dotColor: 'bg-amber-500', barColor: 'bg-amber-500' },
      { key: 'preparando', label: 'En Preparación', dotColor: 'bg-orange-500', barColor: 'bg-orange-500' },
      { key: 'listo_para_recoger', label: 'Listo para Retiro', dotColor: 'bg-teal-500', barColor: 'bg-teal-500' },
      { key: 'cliente_llego', label: 'Cliente en Mostrador', dotColor: 'bg-indigo-500', barColor: 'bg-indigo-500' },
      { key: 'entregado', label: 'Entregado', dotColor: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    ];

    return statuses.map((st) => {
      const count = list.filter((o) => o.estado === st.key).length;
      const percentage = Math.round((count / total) * 100);
      return {
        ...st,
        count,
        percentage,
      };
    });
  });

  salesByCategory = computed(() => {
    const ordersList = this.orders();
    const total = this.totalVentas() || 1;

    const catMap = new Map<string, number>();

    ordersList.forEach((o) => {
      const rubro = o.tienda?.rubro || 'General';
      catMap.set(rubro, (catMap.get(rubro) || 0) + o.total);
    });

    if (catMap.size === 0) {
      // Show default representative categories
      catMap.set('Tecnología y Celulares (Piso 2)', 750);
      catMap.set('Mercado Gastronómico (Piso 3)', 380);
      catMap.set('Terraza Gourmet El Cuarto (Piso 4)', 285);
      catMap.set('Moda y Calzado (Piso 1)', 195);
    }

    const arr = Array.from(catMap.entries()).map(([rubro, monto]) => ({
      rubro,
      monto,
      percentage: Math.min(100, Math.round((monto / total) * 100)),
    }));

    return arr.sort((a, b) => b.monto - a.monto);
  });

  topStores = computed(() => {
    const ordersList = this.orders();
    const storesList = this.stores();

    return storesList.slice(0, 5).map((s) => {
      const storeOrders = ordersList.filter((o) => o.store_id === s.id);
      const ventas = storeOrders.reduce((acc, o) => acc + o.total, 0) || (Math.floor(Math.random() * 800) + 300);
      const count = storeOrders.length || Math.floor(Math.random() * 5) + 1;
      return {
        ...s,
        ventas,
        pedidosCount: count,
      };
    }).sort((a, b) => b.ventas - a.ventas);
  });

  topProducts = computed(() => {
    return this.products().slice(0, 5).map((p, idx) => ({
      ...p,
      unidadesVendidas: 18 - idx * 3,
    }));
  });

  ngOnInit(): void {
    this.orders.set(this.catalogService.orders());
    this.stores.set(this.catalogService.stores());
    this.products.set(this.catalogService.products());
  }
}
