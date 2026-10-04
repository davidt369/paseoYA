import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Product } from '../../../../core/models';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StateMessageComponent, IconComponent],
  template: `
    <div class="space-y-4 pb-8">
      <!-- Search Input Header -->
      <div class="space-y-2">
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Buscador y Comparador</h2>
        <p class="text-xs text-slate-500">
          Compara precios y disponibilidad entre tiendas de los distintos pisos del Paseo Aranjuez.
        </p>

        <!-- Search Bar -->
        <div class="relative flex items-center">
          <svg class="absolute left-3.5 size-5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Ej: Audífonos Bluetooth, Hamburguesa..."
            class="w-full h-12 pl-11 pr-10 text-sm bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 shadow-2xs touch-target"
            autofocus
          />
          @if (searchQuery) {
            <button
              type="button"
              (click)="clearSearch()"
              aria-label="Limpiar búsqueda"
              class="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <app-icon name="x" [size]="16" />
            </button>
          }
        </div>
      </div>

      <!-- Quick Search Suggestions (Hackathon highlights) -->
      <div class="space-y-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Búsquedas populares</span>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          @for (tag of popularTags; track tag) {
            <button
              type="button"
              (click)="setSearch(tag)"
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-medium"
            >
              <app-icon name="search" [size]="12" class="inline-block align-[-1px] mr-0.5" />
              {{ tag }}
            </button>
          }
        </div>
      </div>

      <!-- Comparative Summary Callout when multiple stores match -->
      @if (results().length > 1) {
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
          <div class="flex items-center justify-between font-bold text-amber-900">
            <span class="inline-flex items-center gap-1">
              <app-icon name="scale" [size]="14" />
              <span>Comparativa de Precios en el Paseo</span>
            </span>
            <span class="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded-full font-bold">
              {{ results().length }} opciones
            </span>
          </div>
          <p class="text-[11px] text-amber-800">
            Menor precio encontrado: <strong>Bs. {{ results()[0].precio | number:'1.2-2' }}</strong> en 
            {{ results()[0].tienda?.nombre }} ({{ results()[0].tienda?.piso }}, {{ results()[0].tienda?.local }}).
          </p>
        </div>
      }

      <!-- Results List -->
      @if (loading()) {
        <div class="p-8 text-center text-xs text-slate-400">Buscando en todas las tiendas del centro comercial...</div>
      } @else if (hasSearched && results().length === 0) {
        <app-state-message
          type="empty"
          title="No se encontraron productos"
          message="Prueba buscando 'Audífonos Bluetooth', 'Hamburguesa' o 'Moda'."
          actionLabel="Ver sugerencia 'Audífonos Bluetooth'"
          (actionClicked)="setSearch('Audífonos Bluetooth')"
        />
      } @else if (results().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (item of results(); track item.id; let idx = $index) {
            <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 relative hover:border-slate-300 transition flex flex-col justify-between">
              @if (idx === 0 && results().length > 1) {
                <span class="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs">
                  🏆 Mejor Precio
                </span>
              }

              <!-- Product Row -->
              <div class="flex items-center gap-3">
                <img
                  [src]="item.imagen_url"
                  [alt]="item.nombre"
                  class="size-16 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {{ item.nombre }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-base font-black text-slate-900 tabular-nums">
                      Bs. {{ item.precio | number:'1.2-2' }}
                    </span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          [class]="item.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                      {{ item.stock > 0 ? (item.stock + ' disp.') : 'Sin stock' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Store & Floor Details -->
              <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p class="font-bold text-slate-800 text-[11px] truncate">{{ item.tienda?.nombre }}</p>
                  <p class="text-[10px] text-slate-500">
                    📍 <strong>{{ item.tienda?.piso }}</strong> &middot; {{ item.tienda?.local }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <a
                    [routerLink]="['/cliente/tiendas', item.store_id]"
                    class="h-8 px-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center hover:bg-slate-100 transition"
                  >
                    Ver Tienda
                  </a>

                  <button
                    type="button"
                    (click)="addToCart(item)"
                    class="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    Pedir
                  </button>
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
export class BuscadorComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  searchQuery = '';
  hasSearched = false;
  loading = signal<boolean>(false);
  results = signal<Product[]>([]);

  readonly popularTags = [
    'Audífonos Bluetooth',
    'Hamburguesa',
    'Café',
    'Pique Macho',
    'Bife',
    'Camisa Lino',
  ];

  async ngOnInit(): Promise<void> {
    // Default search to showcase the 3 headphone stores comparison
    this.setSearch('Audífonos Bluetooth');
  }

  async onSearchChange(): Promise<void> {
    if (!this.searchQuery.trim()) {
      this.results.set([]);
      this.hasSearched = false;
      return;
    }

    this.hasSearched = true;
    this.loading.set(true);

    try {
      const items = await this.catalogService.searchProducts(this.searchQuery);
      this.results.set(items);
    } finally {
      this.loading.set(false);
    }
  }

  setSearch(tag: string): void {
    this.searchQuery = tag;
    this.onSearchChange();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.results.set([]);
    this.hasSearched = false;
  }

  addToCart(product: Product): void {
    const res = this.cartService.addItem(product, 1);
    if (res.success) {
      this.toastService.success(`"${product.nombre}" agregado al carrito.`);
    } else {
      this.toastService.error(res.message || 'No se pudo agregar al carrito');
    }
  }
}
