import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Order } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, StateMessageComponent, IconComponent],
  template: `
    <div class="space-y-4 pb-8">
      <div class="space-y-1">
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Mis Pedidos y Reservas</h2>
        <p class="text-xs text-slate-500">Muestra tu código QR en el local para validar tu reserva y retirar en mostrador.</p>
      </div>

      @if (orders().length === 0) {
        <app-state-message
          type="empty"
          title="No tienes reservas registradas"
          message="Cuando reserves productos en las tiendas del Paseo Aranjuez, aparecerán aquí con su código QR de retiro."
          actionLabel="Ir a reservar productos"
          (actionClicked)="goToShop()"
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (order of orders(); track order.id) {
            <a
              [routerLink]="['/cliente/pedidos', order.id]"
              class="block bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:border-amber-400 hover:shadow-md transition space-y-3"
            >
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-mono block">Código {{ order.pickup_code }}</span>
                  <h3 class="text-sm font-bold text-slate-900 mt-0.5">{{ order.tienda?.nombre || 'Tienda Paseo Aranjuez' }}</h3>
                  <p class="text-xs text-slate-500">
                    <app-icon name="map-pin" [size]="12" />
                    <strong>{{ order.tienda?.piso }}</strong> &middot; {{ order.tienda?.local }}
                  </p>
                </div>
                <app-status-badge [status]="order.estado" />
              </div>

              <!-- Details Bar -->
              <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 block leading-tight">Total</span>
                  <span class="font-extrabold text-slate-900 tabular-nums">
                    Bs. {{ order.total | number:'1.2-2' }}
                  </span>
                </div>

                <div class="flex items-center gap-1 text-slate-900 font-bold text-xs">
                  <span>Ver Pase de Reserva</span>
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisPedidosComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);

  orders = signal<Order[]>([]);

  ngOnInit(): void {
    const user = this.authService.user();
    const list = this.catalogService.getClientOrders(user?.id);
    this.orders.set(list);
  }

  goToShop(): void {
    // Navigate handled by link
  }
}
