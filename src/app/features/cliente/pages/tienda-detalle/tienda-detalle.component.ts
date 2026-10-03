import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Store, Product } from '../../../../core/models';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';

@Component({
  selector: 'app-tienda-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonComponent, StateMessageComponent],
  template: `
    <div class="space-y-5 pb-8">
      <!-- Back Navigation -->
      <a
        routerLink="/cliente"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Volver a tiendas</span>
      </a>

      @if (loading()) {
        <app-skeleton variant="card" />
        <div class="grid grid-cols-2 gap-3">
          <app-skeleton variant="product" />
          <app-skeleton variant="product" />
        </div>
      } @else if (!store()) {
        <app-state-message
          type="error"
          title="Tienda no encontrada"
          message="El local comercial no existe o no se encuentra activo actualmente."
          actionLabel="Volver al inicio"
        />
      } @else {
        <!-- Store Header Card -->
        <div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <!-- Cover Image -->
          <div class="h-32 sm:h-48 md:h-64 w-full bg-slate-800 relative">
            @if (store()?.portada_url) {
              <img [src]="store()?.portada_url" [alt]="store()?.nombre" class="w-full h-full object-cover" />
            }
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>

          <div class="p-4 sm:p-6 pt-0 relative">
            <!-- Floating Logo -->
            <div class="flex items-end justify-between -mt-10 sm:-mt-14 mb-4">
              <img
                [src]="store()?.logo_url"
                [alt]="store()?.nombre"
                class="size-20 sm:size-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
              />
              <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Abierto ahora
              </span>
            </div>

            <!-- Store Meta -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {{ store()?.nombre }}
                </h1>
                <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{{ store()?.rubro }}</p>
              </div>

              <div class="grid grid-cols-2 sm:flex sm:items-center gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div class="sm:px-3">
                  <span class="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Ubicación Física</span>
                  <span class="font-bold text-slate-800">{{ store()?.piso }} &middot; {{ store()?.local }}</span>
                  @if (store()?.sector) {
                    <span class="text-slate-500 block text-[10px]">({{ store()?.sector }})</span>
                  }
                </div>
                <div class="sm:px-3 sm:border-l sm:border-slate-200">
                  <span class="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Horario de Retiro</span>
                  <span class="font-semibold text-slate-800">{{ store()?.horario_semana }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Catalog -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
              Catálogo Disponible ({{ products().length }})
            </h2>
            <span class="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              ⚡ Retiro inmediato en mostrador
            </span>
          </div>

          @if (products().length === 0) {
            <app-state-message
              type="empty"
              title="Sin productos activos"
              message="Este comercio no tiene productos disponibles en este momento."
            />
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              @for (prod of products(); track prod.id) {
                <div class="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition">
                  <div class="space-y-2">
                    <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img
                        [src]="prod.imagen_url"
                        [alt]="prod.nombre"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                      @if (prod.stock <= 5) {
                        <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                          ¡Últimas {{ prod.stock }}!
                        </span>
                      }
                    </div>

                    <div>
                      <h3 class="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {{ prod.nombre }}
                      </h3>
                      @if (prod.descripcion) {
                        <p class="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                          {{ prod.descripcion }}
                        </p>
                      }
                    </div>
                  </div>

                  <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] text-slate-400 block leading-none">Precio</span>
                      <span class="text-sm font-extrabold text-slate-900 tabular-nums">
                        Bs. {{ prod.precio | number:'1.2-2' }}
                      </span>
                    </div>

                    <button
                      type="button"
                      (click)="addToCart(prod)"
                      class="size-8 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white flex items-center justify-center transition cursor-pointer shadow-2xs"
                      title="Agregar al Carrito"
                      aria-label="Agregar al Carrito"
                    >
                      <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiendaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  store = signal<Store | undefined>(undefined);
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    const storeId = this.route.snapshot.paramMap.get('id');
    if (storeId) {
      try {
        const [st, prds] = await Promise.all([
          this.catalogService.getStoreById(storeId),
          this.catalogService.getProductsByStore(storeId),
        ]);
        this.store.set(st);
        this.products.set(prds);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }

  addToCart(product: Product): void {
    const currentStore = this.store();
    const productWithStore: Product = {
      ...product,
      tienda: currentStore,
    };

    const res = this.cartService.addItem(productWithStore, 1);
    if (res.success) {
      this.toastService.success(`"${product.nombre}" agregado al carrito.`);
    } else {
      this.toastService.error(res.message || 'No se pudo agregar el producto.');
    }
  }
}
