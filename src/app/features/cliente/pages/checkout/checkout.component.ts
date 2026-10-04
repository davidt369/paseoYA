import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { LoyaltyService } from '../../../../core/services/loyalty.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 pb-12">
      <div class="space-y-1">
        <h2 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Finalizar Pedido</h2>
        <p class="text-xs sm:text-sm text-slate-500">Paseo Aranjuez &middot; Pago QR y Retiro Presencial</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Store Pickup Info Box & Order Summary (Left) -->
        <div class="lg:col-span-6 space-y-4">
          <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <app-icon name="map-pin" [size]="18" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Punto de Retiro</h3>
                <p class="text-xs text-slate-600">
                  {{ firstStore()?.nombre }} &middot; <strong>{{ firstStore()?.piso }}</strong>, {{ firstStore()?.local }}
                </p>
              </div>
            </div>

            <!-- Window Selection (Validated against store hours) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="ventana">
                Selecciona tu Ventana de Retiro (Hoy)
              </label>
              <select
                id="ventana"
                [(ngModel)]="selectedVentana"
                class="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                @for (w of validWindows; track w) {
                  <option [value]="w">{{ w }}</option>
                }
              </select>
              <p class="text-[10px] text-slate-500 mt-1">
                Horario de atención del local: {{ firstStore()?.horario_semana }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1" for="notas">
                Instrucciones para el local (opcional)
              </label>
              <input
                id="notas"
                type="text"
                [(ngModel)]="nota"
                placeholder="Ej: Empaquetar para regalo, salsa aparte..."
                class="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <!-- Items Overview in checkout -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <span class="text-xs font-bold text-slate-700">Artículos a retirar ({{ cartService.totalItems() }})</span>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              @for (item of cartService.items(); track item.product.id) {
                <div class="flex items-center justify-between text-xs py-1">
                  <span class="text-slate-800 truncate pr-2">{{ item.quantity }}x {{ item.product.nombre }}</span>
                  <span class="font-bold text-slate-900 shrink-0">Bs. {{ (item.product.precio * item.quantity) | number:'1.2-2' }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Simulated QR Payment Card (Right) -->
        <div class="lg:col-span-6">
          <div class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs text-center space-y-4">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
              <app-icon name="ticket" [size]="14" class="text-amber-700" />
              <span>Reserva con Retiro Presencial (Demo Hackathon)</span>
            </div>

            <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              El pedido se registra en la tienda seleccionada. Puedes abonar en mostrador mediante efectivo, tarjeta o QR Simple del comercio al momento de recoger.
            </p>

            <!-- Generated Payment / Order QR Reference -->
            <div class="flex justify-center py-2">
              <div class="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm inline-block">
                @if (qrDataUrl()) {
                  <img [src]="qrDataUrl()" alt="Referencia de Pedido QR" class="size-48 object-contain" />
                } @else {
                  <div class="size-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Generando referencia QR...
                  </div>
                }
              </div>
            </div>

            <!-- LOYALTY POINTS & 10% MAXIMUM DISCOUNT SECTION -->
            <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <app-icon name="gem" [size]="18" class="text-amber-600" />
                  <span class="text-xs font-black text-slate-900">Puntos de Fidelidad PaseoYa</span>
                </div>
                <span class="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {{ loyalty.totalPoints() }} pts disponibles
                </span>
              </div>

              <div class="text-[11px] text-slate-600 space-y-1">
                <p>
                  Aplica tus puntos para recibir un descuento directo (margen máximo: <strong>10% por compra</strong>).
                </p>
                <div class="flex justify-between items-center text-xs font-bold text-slate-800 pt-1">
                  <span>Descuento máximo aplicable (10%):</span>
                  <span class="tabular-nums text-amber-900">Bs. {{ discountInfo().maxDiscountBs | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Toggle Use Points -->
              @if (discountInfo().maxPointsUsable > 0 && loyalty.totalPoints() > 0) {
                <div class="pt-2 flex items-center justify-between border-t border-amber-200/60">
                  <label class="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="usePoints()"
                      (change)="toggleUsePoints()"
                      class="size-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Canjear {{ discountInfo().pointsNeeded }} puntos (-Bs. {{ discountInfo().appliedDiscountBs | number:'1.2-2' }})</span>
                  </label>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    -10% Ahorro
                  </span>
                </div>
              } @else {
                <p class="text-[10px] text-slate-400 italic">
                  * Necesitas al menos 10 puntos para canjear descuentos.
                </p>
              }
            </div>

            <!-- Total Breakdown -->
            <div class="py-2 border-t border-b border-slate-100 space-y-1">
              <div class="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span class="font-bold tabular-nums text-slate-800">Bs. {{ cartService.subtotal() | number:'1.2-2' }}</span>
              </div>
              @if (usePoints() && discountInfo().appliedDiscountBs > 0) {
                <div class="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>Descuento Fidelidad (10% max)</span>
                  <span class="tabular-nums">-Bs. {{ discountInfo().appliedDiscountBs | number:'1.2-2' }}</span>
                </div>
              }
              <div class="flex justify-between items-baseline pt-1">
                <span class="text-xs text-slate-600 font-bold">Total a liquidar en mostrador</span>
                <span class="text-2xl font-black text-slate-900 tabular-nums">
                  Bs. {{ finalTotal() | number:'1.2-2' }}
                </span>
              </div>
            </div>

            <app-button
              variant="gold"
              size="lg"
              [fullWidth]="true"
              [loading]="processing()"
              (clicked)="confirmPayment()"
            >
              Confirmar Reserva y Pase QR
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  loyalty = inject(LoyaltyService);
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  qrDataUrl = signal<string>('');
  processing = signal<boolean>(false);
  usePoints = signal<boolean>(false);
  nota = '';

  readonly discountInfo = () => this.loyalty.calculateDiscount(this.cartService.subtotal());

  readonly finalTotal = () => {
    const sub = this.cartService.subtotal();
    if (!this.usePoints()) {
      return sub;
    }
    const info = this.discountInfo();
    return Math.max(0, Number((sub - info.appliedDiscountBs).toFixed(2)));
  };

  toggleUsePoints(): void {
    this.usePoints.update((v) => !v);
    this.updatePaymentQr();
  }

  readonly validWindows = [
    'Hoy en 30 minutos (Retiro Express)',
    'Hoy 16:30 - 17:30',
    'Hoy 18:00 - 19:00',
    'Hoy 19:30 - 20:30',
    'Hoy 21:00 - 22:00',
  ];

  selectedVentana = this.validWindows[0];

  firstStore() {
    const items = this.cartService.items();
    return items.length > 0 ? items[0].product.tienda : null;
  }

  async ngOnInit(): Promise<void> {
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cliente']);
      return;
    }
    await this.updatePaymentQr();
  }

  async updatePaymentQr(): Promise<void> {
    const storeName = this.firstStore()?.nombre || 'Paseo Aranjuez';
    const amount = this.finalTotal();
    const qrPayload = `PASEOYA-RESERVA|${storeName}|BS-${amount}|${Date.now()}`;

    try {
      const url = await QRCode.toDataURL(qrPayload, {
        width: 250,
        margin: 2,
        color: {
          dark: '#121417',
          light: '#ffffff',
        },
      });
      this.qrDataUrl.set(url);
    } catch (e) {
      console.warn('QR generation error:', e);
    }
  }

  async confirmPayment(): Promise<void> {
    const store = this.firstStore();
    if (!store) return;

    this.processing.set(true);

    try {
      const items = this.cartService.items();
      const res = await this.catalogService.createOrder(
        store.id,
        items,
        this.selectedVentana,
        this.nota
      );

      if (res.success && res.orderId) {
        // 1. Si canjeó puntos, descontarlos del saldo
        if (this.usePoints()) {
          const info = this.discountInfo();
          if (info.pointsNeeded > 0) {
            this.loyalty.redeemPoints(info.pointsNeeded, res.orderId);
          }
        }

        // 2. Acumular nuevos puntos por el valor de la reserva efectuada
        this.loyalty.addPurchasePoints(res.orderId, this.finalTotal());

        this.cartService.clear();
        this.toastService.success('¡Reserva confirmada! Pase QR generado y puntos sumados a tu cuenta.');
        this.router.navigate(['/cliente/pedidos', res.orderId]);
      } else {
        this.toastService.error(res.error || 'Error al procesar la reserva.');
      }
    } catch (e: any) {
      this.toastService.error(e.message || 'Error inesperado');
    } finally {
      this.processing.set(false);
    }
  }
}

