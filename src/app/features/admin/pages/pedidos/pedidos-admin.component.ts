import { Component, inject, signal, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Order, OrderStatus } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, StateMessageComponent],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-xl md:text-2xl font-black tracking-tight text-slate-900">
          Supervisión Global de Pedidos
        </h1>
        <p class="text-xs text-slate-500">
          Auditoría en tiempo real de todas las transacciones y retiros de Paseo Aranjuez.
        </p>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <!-- Text Search -->
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1" for="adminOrderSearch">
              Buscar por Código o Cliente
            </label>
            <input
              id="adminOrderSearch"
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Ej: PY-B8C24 o Carlos..."
              class="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1" for="adminStatusFilter">
              Estado del Pedido
            </label>
            <select
              id="adminStatusFilter"
              [(ngModel)]="selectedStatus"
              class="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
            >
              <option value="todos">Todos los Estados ({{ allOrders().length }})</option>
              <option value="recibido">1. Recibido</option>
              <option value="confirmado">2. Confirmado</option>
              <option value="preparando">3. En Preparación</option>
              <option value="listo_para_recoger">4. Listo para Retiro</option>
              <option value="cliente_llego">5. Cliente en Mostrador</option>
              <option value="entregado">6. Entregado</option>
            </select>
          </div>

          <!-- Floor Filter -->
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1" for="adminFloorFilter">
              Piso del Local
            </label>
            <select
              id="adminFloorFilter"
              [(ngModel)]="selectedFloor"
              class="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
            >
              <option value="todos">Todos los Pisos</option>
              <option value="Piso 1">Piso 1</option>
              <option value="Piso 2">Piso 2</option>
              <option value="Piso 3">Piso 3</option>
              <option value="Piso 4">Piso 4</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Detail Modal / History Inspector -->
      @if (selectedOrderForAudit()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Auditoría Operacional</span>
                <h3 class="font-bold text-base text-slate-900">
                  Pedido {{ selectedOrderForAudit()!.pickup_code }}
                </h3>
              </div>
              <button type="button" (click)="selectedOrderForAudit.set(null)" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Meta details -->
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-500">Tienda:</span>
                <span class="font-bold text-slate-900">{{ selectedOrderForAudit()!.tienda?.nombre }} ({{ selectedOrderForAudit()!.tienda?.piso }}, {{ selectedOrderForAudit()!.tienda?.local }})</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Cliente:</span>
                <span class="font-bold text-slate-900">{{ selectedOrderForAudit()!.cliente?.nombre_completo || 'Cliente' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">PIN de Respaldo:</span>
                <span class="font-mono font-bold text-amber-700">{{ selectedOrderForAudit()!.pin_seguridad }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Ventana Retiro:</span>
                <span class="font-medium text-slate-900">{{ selectedOrderForAudit()!.ventana_retiro }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-200/80 pt-1.5 font-bold">
                <span>Total:</span>
                <span class="tabular-nums">Bs. {{ selectedOrderForAudit()!.total | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Items -->
            <div>
              <h4 class="text-xs font-bold text-slate-800 mb-2">Desglose de Artículos</h4>
              <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                @for (it of selectedOrderForAudit()!.items; track it.product_id) {
                  <div class="p-2.5 flex justify-between bg-white">
                    <span>{{ it.cantidad }} &times; {{ it.nombre_producto }}</span>
                    <span class="font-bold tabular-nums">Bs. {{ it.subtotal | number:'1.2-2' }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="pt-2 text-right">
              <button
                type="button"
                (click)="selectedOrderForAudit.set(null)"
                class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Orders List / Table -->
      @if (filteredOrders().length === 0) {
        <app-state-message
          type="empty"
          title="No se encontraron pedidos con estos filtros"
          message="Intenta seleccionando 'Todos los Estados' o 'Todos los Pisos'."
        />
      } @else {
        <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div class="divide-y divide-slate-100">
            @for (order of filteredOrders(); track order.id) {
              <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 transition">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-black text-slate-900 text-sm">
                      {{ order.pickup_code }}
                    </span>
                    <app-status-badge [status]="order.estado" />
                    <span class="text-[10px] font-mono text-slate-400">
                      PIN: {{ order.pin_seguridad }}
                    </span>
                  </div>

                  <p class="text-slate-700 font-semibold truncate">
                    {{ order.tienda?.nombre }} &middot;
                    <span class="text-slate-500 font-normal">{{ order.tienda?.piso }}, {{ order.tienda?.local }}</span>
                  </p>

                  <p class="text-[11px] text-slate-500">
                    Cliente: <strong>{{ order.cliente?.nombre_completo || 'Cliente' }}</strong> &middot;
                    Ventana: {{ order.ventana_retiro }}
                  </p>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div class="text-right">
                    <span class="font-black text-sm text-slate-900 tabular-nums block">
                      Bs. {{ order.total | number:'1.2-2' }}
                    </span>
                    <span class="text-[10px] text-slate-400">
                      {{ order.items?.length || 1 }} artículo(s)
                    </span>
                  </div>

                  <button
                    type="button"
                    (click)="selectedOrderForAudit.set(order)"
                    class="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Auditar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidosAdminComponent implements OnInit {
  private catalogService = inject(CatalogService);

  allOrders = signal<Order[]>([]);
  searchQuery = '';
  selectedStatus = 'todos';
  selectedFloor = 'todos';
  selectedOrderForAudit = signal<Order | null>(null);

  ngOnInit(): void {
    this.allOrders.set(this.catalogService.orders());
  }

  filteredOrders(): Order[] {
    const list = this.allOrders();
    const q = this.searchQuery.trim().toLowerCase();
    const st = this.selectedStatus;
    const fl = this.selectedFloor;

    return list.filter((o) => {
      // Status filter
      if (st !== 'todos' && o.estado !== st) return false;

      // Floor filter
      if (fl !== 'todos' && o.tienda?.piso !== fl) return false;

      // Search query
      if (q) {
        const codeMatch = o.pickup_code.toLowerCase().includes(q);
        const clientMatch = o.cliente?.nombre_completo?.toLowerCase().includes(q);
        const storeMatch = o.tienda?.nombre.toLowerCase().includes(q);
        if (!codeMatch && !clientMatch && !storeMatch) return false;
      }

      return true;
    });
  }
}
