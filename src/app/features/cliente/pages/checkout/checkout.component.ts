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
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
              <app-icon name="smartphone" [size]="12" />
              <span>Pago QR Simple (Simulación Hackathon)</span>
            </div>

            <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Escanea el código QR desde cualquier aplicación bancaria boliviana (o presiona el botón inferior para confirmar la simulación).
            </p>

            <!-- Generated Payment QR -->
            <div class="flex justify-center py-2">
              <div class="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm inline-block">
                @if (qrDataUrl()) {
                  <img [src]="qrDataUrl()" alt="QR de Pago Simulado" class="size-48 object-contain" />
                } @else {
                  <div class="size-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Generando QR...
                  </div>
                }
              </div>
            </div>

            <!-- Total Breakdown -->
            <div class="py-2 border-t border-b border-slate-100">
              <span class="text-xs text-slate-500 block">Monto total a pagar</span>
              <span class="text-2xl font-black text-slate-900 tabular-nums">
                Bs. {{ cartService.subtotal() | number:'1.2-2' }}
              </span>
            </div>

            <app-button
              variant="gold"
              size="lg"
              [fullWidth]="true"
              [loading]="processing()"
              (clicked)="confirmPayment()"
            >
              Confirmar Pago y Generar QR de Retiro
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
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  qrDataUrl = signal<string>('');
  processing = signal<boolean>(false);
  nota = '';

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

    // Generate simulated payment QR payload
    const storeName = this.firstStore()?.nombre || 'Paseo Aranjuez';
    const amount = this.cartService.subtotal();
    const qrPayload = `PASEOYA-PAY|${storeName}|BS-${amount}|${Date.now()}`;

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
        this.cartService.clear();
        this.toastService.success('¡Pago confirmado! Tu pedido ha sido enviado a la tienda.');
        this.router.navigate(['/cliente/pedidos', res.orderId]);
      } else {
        this.toastService.error(res.error || 'Error al procesar la orden.');
      }
    } catch (e: any) {
      this.toastService.error(e.message || 'Error inesperado');
    } finally {
      this.processing.set(false);
    }
  }
}
