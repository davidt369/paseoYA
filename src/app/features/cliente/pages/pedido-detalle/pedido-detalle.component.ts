import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Order, OrderStatus } from '../../../../core/models';
import { OrderStepperComponent } from '../../../../shared/ui/stepper/order-stepper.component';
import { StatusBadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    OrderStepperComponent,
    StatusBadgeComponent,
    ButtonComponent,
    StateMessageComponent,
    IconComponent,
  ],
  template: `
    <div class="space-y-5 pb-10">
      <!-- Back Navigation -->
      <div class="flex items-center justify-between">
        <a
          routerLink="/cliente/pedidos"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Mis pedidos</span>
        </a>

        @if (order()) {
          <app-status-badge [status]="order()!.estado" />
        }
      </div>

      @if (!order()) {
        <app-state-message
          type="error"
          title="Pedido no encontrado"
          message="No se encontró la orden solicitada."
        />
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Column: Official Pickup QR Pass -->
          <div class="lg:col-span-6 space-y-5">
            <!-- QR Pickup Card (Main Attraction for demo) -->
            <div class="bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-sm text-center space-y-4">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                <app-icon name="ticket" [size]="12" />
                <span>Pase Oficial de Retiro &middot; Paseo Aranjuez</span>
              </div>

              <h1 class="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {{ order()!.tienda?.nombre }}
              </h1>

              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                <app-icon name="map-pin" [size]="14" />
                <span>{{ order()!.tienda?.piso }}</span>
                <span>&middot;</span>
                <span>{{ order()!.tienda?.local }}</span>
              </div>

              <!-- QR Canvas / Image -->
              <div class="flex justify-center py-1">
                <div class="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block">
                  @if (qrCodeUrl()) {
                    <img
                      [src]="qrCodeUrl()"
                      [alt]="'Código de retiro ' + order()!.pickup_code"
                      class="size-52 object-contain"
                    />
                  } @else {
                    <div class="size-52 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Generando QR...
                    </div>
                  }
                </div>
              </div>

              <!-- Codes for merchant scan or manual fallback -->
              <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Código QR</span>
                  <span class="font-mono font-black text-sm text-slate-900 tracking-wider">
                    {{ order()!.pickup_code }}
                  </span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">PIN de Respaldo</span>
                  <span class="font-mono font-black text-sm text-amber-700 tracking-widest">
                    {{ order()!.pin_seguridad }}
                  </span>
                </div>
              </div>

              <!-- Schedule & Window -->
              <div class="text-[11px] text-slate-500 pt-1">
                <p><strong>Ventana programada:</strong> {{ order()!.ventana_retiro }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Muestra este código al llegar al mostrador de la tienda.</p>
              </div>

              <!-- "Ya llegué al local" Button (Action for client) -->
              @if (order()!.estado === 'listo_para_recoger') {
                <div class="pt-2">
                  <app-button
                    variant="gold"
                    size="md"
                    [fullWidth]="true"
                    (clicked)="onClientArrived()"
                  >
                    <app-icon name="map-pin" [size]="16" class="inline-block align-[-2px] mr-1" />
                    ¡Ya llegué al local del Paseo!
                  </app-button>
                </div>
              } @else if (order()!.estado === 'cliente_llego') {
                <div class="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-bold flex items-center gap-1.5">
                  <app-icon name="check" [size]="16" class="text-indigo-600" />
                  <span>Notificaste tu llegada. El comercio te atenderá en el mostrador.</span>
                </div>
              }
            </div>

            <!-- PICKUP CONFIRMATION (Visible if order is 'entregado') -->
            @if (order()!.estado === 'entregado') {
              <div class="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="size-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <app-icon name="party" [size]="20" />
                    </div>
                    <div>
                      <h3 class="font-bold text-sm text-emerald-300">Pedido Retirado</h3>
                      <p class="text-[10px] text-slate-300">Canje completado en {{ order()!.tienda?.nombre }}</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    Entregado
                  </span>
                </div>

                <p class="text-xs text-slate-200 leading-relaxed">
                  Tu consumo en <strong>{{ order()!.tienda?.nombre }}</strong> fue entregado en mostrador. ¡Gracias por comprar en Paseo Aranjuez!
                </p>
              </div>
            }
          </div>

          <!-- Right Column: Live Stepper, Order Items, Cross-Selling -->
          <div class="lg:col-span-6 space-y-5">
            <!-- LIVE ORDER PROGRESS STEPPER -->
            <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
                  Seguimiento en Vivo
                </h2>
                <span class="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Realtime
                </span>
              </div>

              <app-order-stepper [currentStatus]="order()!.estado" />
            </div>

            <!-- ORDER ITEMS SUMMARY -->
            <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
                Resumen de Productos
              </h2>

              <div class="divide-y divide-slate-100">
                @for (item of order()!.items; track item.product_id) {
                  <div class="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p class="font-bold text-slate-800">{{ item.nombre_producto }}</p>
                      <p class="text-[11px] text-slate-500">Cant: {{ item.cantidad }} &times; Bs. {{ item.precio_unitario | number:'1.2-2' }}</p>
                    </div>
                    <span class="font-bold tabular-nums text-slate-900">
                      Bs. {{ item.subtotal | number:'1.2-2' }}
                    </span>
                  </div>
                }
              </div>

              <div class="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span>Total Pagado</span>
                <span class="tabular-nums text-base">Bs. {{ order()!.total | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- "MIENTRAS ESPERAS, VISITA..." (Floor 3 & 4 Cross-Selling) -->
            <section class="space-y-3">
              <div class="flex items-center gap-2">
                <app-icon name="sparkles" [size]="18" />
                <div>
                  <h2 class="text-xs font-black uppercase tracking-wider text-slate-800">
                    Mientras esperas tu pedido, visita...
                  </h2>
                  <p class="text-[11px] text-slate-500">Disfruta la experiencia del centro comercial</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-2.5">
                <!-- Floor 3 Card -->
                <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                  <div class="size-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl shrink-0">
                    <app-icon name="burger" [size]="20" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-800">
                      Piso 3
                    </span>
                    <h3 class="text-xs font-bold text-slate-900 mt-1 truncate">Mercado Gastronómico & Sky Games</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Cafeterías, comidas rápidas y diversión para la familia.</p>
                  </div>
                </div>

                <!-- Floor 4 Card -->
                <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                  <div class="size-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">
                    <app-icon name="wine" [size]="20" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800">
                      Piso 4
                    </span>
                    <h3 class="text-xs font-bold text-slate-900 mt-1 truncate">Terraza Gourmet "El Cuarto"</h3>
                    <p class="text-[11px] text-slate-500 mt-0.5">Restaurantes de autor y vista panorámica de Cochabamba.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoDetalleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);

  order = signal<Order | undefined>(undefined);
  qrCodeUrl = signal<string>('');
  private channel: any = null;

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) return;

    let ord = this.catalogService.getOrderById(orderId);
    if (!ord) {
      await this.catalogService.loadOrders();
      ord = this.catalogService.getOrderById(orderId);
    }
    if (ord) {
      this.order.set(ord);
      await this.generateQR(ord);
      this.subscribeRealtime(ord.id);
    }
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.channel.unsubscribe();
    }
  }

  private async generateQR(order: Order): Promise<void> {
    // Official QR payload: Pickup Code, PIN, Store, Floor and Local
    const payload = JSON.stringify({
      app: 'PaseoYa',
      orderId: order.id,
      code: order.pickup_code,
      pin: order.pin_seguridad,
      tienda: order.tienda?.nombre,
      piso: order.tienda?.piso,
      local: order.tienda?.local,
    });

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#121417',
          light: '#ffffff',
        },
      });
      this.qrCodeUrl.set(url);
    } catch (e) {
      console.warn('Error generating order QR:', e);
    }
  }

  private subscribeRealtime(orderId: string): void {
    try {
      this.channel = this.supabase
        .channel(`order-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          (payload: any) => {
            const updated = payload.new;
            if (updated && updated.estado) {
              this.order.update((cur) => (cur ? { ...cur, estado: updated.estado } : undefined));
              this.toastService.info(`Tu pedido pasó a estado: ${updated.estado}`);
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription fallback:', e);
    }
  }

  async onClientArrived(): Promise<void> {
    const cur = this.order();
    if (!cur) return;

    const success = await this.catalogService.notifyClientArrived(cur.id);
    if (success) {
      this.order.update((o) => (o ? { ...o, estado: 'cliente_llego' } : undefined));
      this.toastService.success('¡Llegada notificada! El comercio ha recibido la alerta.');
    }
  }
}
