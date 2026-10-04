import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, StateMessageComponent, ButtonComponent, IconComponent],
  template: `
    <div class="space-y-5 pb-8">
      <div class="space-y-1">
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Carrito de Compras</h2>
        <p class="text-xs text-slate-500">Retiro presencial en tienda con código QR</p>
      </div>

      @if (cartService.items().length === 0) {
        <app-state-message
          type="empty"
          title="Tu carrito está vacío"
          message="Explora las tiendas y restaurantes de Paseo Aranjuez para agregar productos."
          actionLabel="Explorar Tiendas"
          (actionClicked)="goToStores()"
        />
      } @else {
        <div class="lg:grid lg:grid-cols-12 gap-8 items-start">
          <!-- Left Column (Items List) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Store Notice Card (Single store order rule) -->
            <div class="p-4 bg-amber-50/80 border border-amber-200/90 rounded-3xl flex items-start gap-3">
              <app-icon name="store" [size]="20" />
              <div class="text-xs">
                <span class="font-bold text-amber-950 block text-sm">Retiro en local de Paseo Aranjuez</span>
                <p class="text-amber-900 mt-1 leading-snug">
                  Tu pedido se preparará en: <strong>{{ firstStore()?.nombre }}</strong>
                  ({{ firstStore()?.piso }}, {{ firstStore()?.local }}).
                </p>
              </div>
            </div>

            <!-- Cart Items List -->
            <div class="space-y-3">
              @for (item of cartService.items(); track item.product.id) {
                <div class="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-4">
                  <img
                    [src]="item.product.imagen_url"
                    [alt]="item.product.nombre"
                    class="size-18 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />

                  <div class="flex-1 min-w-0">
                    <h3 class="text-xs font-bold text-slate-900 truncate">{{ item.product.nombre }}</h3>
                    <p class="text-xs text-slate-500 tabular-nums mt-0.5">
                      Bs. {{ item.product.precio | number:'1.2-2' }} c/u
                    </p>

                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-3 mt-2">
                      <div class="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                        <button
                          type="button"
                          (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)"
                          class="size-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span class="w-9 text-center text-xs font-bold tabular-nums text-slate-900">
                          {{ item.quantity }}
                        </span>
                        <button
                          type="button"
                          (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)"
                          class="size-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <span class="text-sm font-black text-slate-900 tabular-nums ml-auto">
                        Bs. {{ (item.product.precio * item.quantity) | number:'1.2-2' }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right Column (Sticky Order Summary on Desktop) -->
          <div class="lg:col-span-5 space-y-4 lg:sticky lg:top-24 mt-4 lg:mt-0">
            <!-- Summary & Checkout Bar -->
            <div class="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
              <h3 class="font-black text-sm text-slate-900 pb-2 border-b border-slate-100">Resumen del Pedido</h3>

              <div class="space-y-2 text-xs text-slate-600">
                <div class="flex justify-between">
                  <span>Subtotal productos ({{ cartService.totalItems() }})</span>
                  <span class="font-bold tabular-nums text-slate-900">
                    Bs. {{ cartService.subtotal() | number:'1.2-2' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Costo de Retiro en Tienda</span>
                  <span class="font-bold text-emerald-600">GRATIS</span>
                </div>
                <div class="flex justify-between text-amber-900 bg-amber-50 p-2.5 rounded-xl font-medium text-xs">
                  <span>Pase QR de Retiro</span>
                  <span class="font-black text-amber-800">Digital</span>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Total a Pagar</span>
                  <span class="text-xl font-black text-slate-900 tabular-nums">
                    Bs. {{ cartService.subtotal() | number:'1.2-2' }}
                  </span>
                </div>

                <app-button size="md" (clicked)="goToCheckout()">
                  Continuar al Pago &rarr;
                </app-button>
              </div>
            </div>

            <!-- Perks Card -->
            <div class="p-4 rounded-3xl bg-slate-900 text-white text-xs space-y-2">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="font-bold text-amber-400">Garantía de Retiro en Paseo Aranjuez</span>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                Muestra tu QR en el mostrador del local de la tienda y el comercio te entrega tu pedido al instante.
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarritoComponent {
  cartService = inject(CartService);
  private router = inject(Router);

  firstStore() {
    const items = this.cartService.items();
    return items.length > 0 ? items[0].product.tienda : null;
  }

  goToStores(): void {
    this.router.navigate(['/cliente']);
  }

  goToCheckout(): void {
    this.router.navigate(['/cliente/checkout']);
  }
}
