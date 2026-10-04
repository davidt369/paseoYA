import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Product } from '../../../../core/models';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { filterIcon } from '../../../../shared/ui/icon/icon-maps';

@Component({
  selector: 'app-productos-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StateMessageComponent, IconComponent],
  template: `
    <div class="space-y-6 pb-16">
      
      <!-- Top Marketplace Hero Banner -->
      <div class="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 size-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 max-w-2xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-amber-200 text-xs font-bold uppercase tracking-wider">
              <app-icon name="shopping-bag" [size]="14" />
              Gran Vitrina PaseoYa
            </span>
            <span class="text-xs font-black text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-3 py-1 rounded-full">
              ● {{ allProducts().length }} Productos en Vivo
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Venta de Todos los Productos del Mall
          </h1>
          <p class="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Explora y compara artículos de todas las tiendas de los 4 pisos de Paseo Aranjuez en un solo lugar. Pide en línea y retira en mostrador con tu código QR.
          </p>
        </div>
      </div>

      <!-- MAIN 12-COLUMN RESPONSIVE LAYOUT (Desktop Sidebar + Content) -->
      <div class="lg:grid lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT COLUMN: FACEBOOK MARKETPLACE STYLE FILTERS (Desktop Sticky Sidebar) -->
        <aside class="hidden lg:block lg:col-span-3 space-y-5 sticky top-20">
          
          <div class="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-5">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-black text-sm text-slate-900 flex items-center gap-2">
                <app-icon name="search" [size]="16" />
                <span>Filtros de Catálogo</span>
              </h3>
              @if (selectedFloor() !== 'Todos los Pisos' || selectedCategory() !== 'all' || searchQuery || priceBracket !== 'all') {
                <button
                  type="button"
                  (click)="resetFilters()"
                  class="text-[11px] font-bold text-amber-600 hover:text-amber-800 underline cursor-pointer"
                >
                  Limpiar
                </button>
              }
            </div>

            <!-- Search Field in Sidebar -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Buscar</label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Ej: Sony, hamburguesa..."
                  class="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none transition"
                />
                <svg class="size-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Floor Selector (Facebook Style List) -->
            <div class="space-y-2">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Piso del Paseo</label>
              <div class="space-y-1 text-xs">
                @for (f of ['Todos los Pisos', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4']; track f) {
                  <button
                    type="button"
                    (click)="selectedFloor.set(f)"
                    [class]="selectedFloor() === f ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'"
                    class="w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{{ f }}</span>
                    @if (selectedFloor() === f) {
                      <span class="text-amber-400 text-xs">✓</span>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Category Selector (Facebook Style Pills) -->
            <div class="space-y-2">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Categoría</label>
              <div class="space-y-1 text-xs">
                @for (cat of categoryOptions; track cat.label) {
                  <button
                    type="button"
                    (click)="selectedCategory.set(cat.key)"
                    [class]="selectedCategory() === cat.key ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'"
                    class="w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <span class="flex items-center gap-2">
                      <app-icon [name]="cat.icon" [size]="14" />
                      <span>{{ cat.label }}</span>
                    </span>
                    @if (selectedCategory() === cat.key) {
                      <span class="text-white text-xs">✓</span>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Price Bracket Filter -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Rango de Precio</label>
              <select
                [(ngModel)]="priceBracket"
                class="w-full h-10 px-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todos los precios</option>
                <option value="under50">Hasta Bs. 50</option>
                <option value="50to100">Bs. 50 a Bs. 100</option>
                <option value="above100">Más de Bs. 100</option>
              </select>
            </div>

            <!-- Sort By Select -->
            <div class="space-y-2">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ordenar Por</label>
              <select
                [(ngModel)]="sortBy"
                class="w-full h-10 px-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Menor precio primero</option>
                <option value="price-desc">Mayor precio primero</option>
              </select>
            </div>
          </div>

          <!-- Retiro Express Card (Sidebar) -->
          <div class="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-5 border border-amber-800/40 shadow-sm space-y-2">
            <div class="flex items-center gap-2">
              <app-icon name="ticket" [size]="18" class="text-amber-400" />
              <span class="text-xs font-bold text-amber-400">Retiro Express con QR</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">
              Cualquier compra con retiro presencial se completa mostrando tu código QR en el mostrador de la tienda.
            </p>
          </div>
        </aside>

        <!-- RIGHT COLUMN: PRODUCTS SHOWCASE & COMPARATOR (lg:col-span-9) -->
        <main class="lg:col-span-9 space-y-5">
          
          <!-- SPECIAL COMPARATOR CALLOUT: AUDÍFONOS BLUETOOTH EN PISO 2 -->
          <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-indigo-900/60 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="size-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                  <app-icon name="headphones" [size]="18" />
                </div>
                <div>
                  <h3 class="font-black text-sm text-white leading-tight">Comparativa de Audífonos Bluetooth</h3>
                  <p class="text-xs text-indigo-300">Piso 2 &middot; 3 Tiendas oficiales a diferentes rangos de precio</p>
                </div>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-xl text-indigo-200 border border-white/10">
                3 Modelos Oficiales
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              @for (hp of bluetoothHeadphones(); track hp.id) {
                <div class="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex sm:flex-col justify-between items-center sm:items-stretch gap-3 group hover:border-amber-500/50 transition">
                  <img [src]="hp.imagen_url" class="size-16 sm:w-full sm:h-24 object-cover rounded-xl bg-white shrink-0" />
                  <div class="min-w-0 flex-1 sm:w-full">
                    <p class="font-bold text-xs text-white truncate leading-tight">{{ hp.nombre }}</p>
                    <p class="text-[10px] text-slate-400 truncate mt-0.5">{{ hp.tienda?.nombre }}</p>
                    <div class="pt-2 flex items-center justify-between border-t border-slate-700/50 mt-2">
                      <span class="text-sm font-black text-amber-400">Bs. {{ hp.precio.toFixed(0) }}</span>
                      <button
                        type="button"
                        (click)="addToCart(hp)"
                        class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:scale-90 text-slate-950 font-black rounded-lg text-xs shadow-xs cursor-pointer"
                        title="Pedir"
                      >
                        + Pedir
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- MOBILE ONLY FILTER BAR (Visible < lg screens) -->
          <div class="lg:hidden bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Buscar en el catálogo..."
                class="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none"
              />
              <svg class="size-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Floor chips -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              @for (f of ['Todos los Pisos', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4']; track f) {
                <button
                  type="button"
                  (click)="selectedFloor.set(f)"
                  [class]="selectedFloor() === f ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'"
                  class="px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px]"
                >
                  {{ f }}
                </button>
              }
            </div>
          </div>

          <!-- Active filters & Products counter header -->
          <div class="flex items-center justify-between px-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 text-sm">Productos Disponibles</span>
              <span class="text-xs bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                {{ filteredProducts().length }}
              </span>
            </div>

            <div class="text-xs text-slate-500 font-medium">
              Mostrando: <strong>{{ selectedFloor() }}</strong>
            </div>
          </div>

          <!-- RESPONSIVE PRODUCTS GRID (Up to 4 columns on PC) -->
          @if (filteredProducts().length === 0) {
            <app-state-message
              type="empty"
              title="No se encontraron productos"
              message="Intenta seleccionando 'Todos los Pisos' o 'Todas las Categorías'."
              actionLabel="Restablecer filtros"
              (actionClicked)="resetFilters()"
            />
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (product of filteredProducts(); track product.id) {
                <article class="card-press bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-amber-400 hover:shadow-md transition duration-200 flex flex-col justify-between group">
                  <div>
                    <!-- Image Container with Floor Tag -->
                    <div class="relative w-full aspect-square bg-slate-100 overflow-hidden">
                      <img
                        [src]="product.imagen_url"
                        [alt]="product.nombre"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      <!-- Floor & Local Badge -->
                      <div class="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span class="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-900/90 text-white backdrop-blur-xs shadow-xs">
                          {{ product.tienda?.piso || 'Piso' }}
                        </span>
                        <span class="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-xs inner-border-subtle">
                          {{ product.tienda?.local }}
                        </span>
                      </div>

                      <!-- Pickup indicator -->
                      <span class="absolute bottom-2.5 right-2.5 text-[8px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-amber-200 backdrop-blur-xs border border-amber-700/40">
                        <app-icon name="ticket" [size]="10" class="inline-block align-[-1px] mr-0.5" />
                        Retiro QR
                      </span>
                    </div>

                    <!-- Product Details -->
                    <div class="p-3.5 space-y-1.5">
                      <!-- Store Link -->
                      <a
                        [routerLink]="['/cliente/tiendas', product.store_id]"
                        class="text-[11px] text-slate-500 hover:text-amber-700 font-bold truncate block transition-colors"
                      >
                        <app-icon name="store" [size]="12" class="inline-block align-[-2px] mr-0.5" />
                        {{ product.tienda?.nombre || 'Tienda Paseo' }}
                      </a>
                      
                      <h3 class="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
                        {{ product.nombre }}
                      </h3>
                      
                      <p class="text-[10px] text-slate-400 tabular-nums">Stock: {{ product.stock }} disponibles</p>
                    </div>
                  </div>

                  <!-- Price & Action Button -->
                  <div class="p-3.5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                    <div>
                      <span class="text-[10px] text-slate-400 block leading-none">Precio</span>
                      <span class="font-black text-sm sm:text-base text-slate-900 tabular-nums tracking-tight">
                        Bs. {{ product.precio.toFixed(2) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <!-- Direct Add to Cart -->
                      <button
                        type="button"
                        (click)="addToCart(product)"
                        class="btn-press px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer inner-border-subtle"
                        title="Añadir al carrito"
                      >
                        + Pedir
                      </button>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosCatalogoComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  allProducts = signal<Product[]>([]);
  searchQuery = '';
  selectedFloor = signal<string>('Todos los Pisos');
  selectedCategory = signal<string>('all');
  priceBracket = 'all';
  sortBy = 'featured';

  readonly categoryOptions = [
    { key: 'all', label: 'Todas', icon: 'sparkles' as const },
    { key: 'Audio', label: 'Audio & Tech', icon: 'headphones' as const },
    { key: 'Hamburguesas', label: 'Hamburguesas', icon: 'burger' as const },
    { key: 'Tradicional', label: 'Tradicional', icon: 'utensils' as const },
    { key: 'Carnes Premium', label: 'Carnes', icon: 'beef' as const },
    { key: 'Pizzas', label: 'Pizzas', icon: 'pizza' as const },
    { key: 'Bebidas', label: 'Bebidas & Café', icon: 'coffee' as const },
    { key: 'Moda', label: 'Moda & Ropa', icon: 'shirt' as const },
    { key: 'Joyería', label: 'Joyería', icon: 'gem' as const },
  ];

  // Specific 3 Bluetooth headphones for comparison
  bluetoothHeadphones = computed(() => {
    return this.allProducts().filter((p) =>
      p.nombre.toLowerCase().includes('audífonos') ||
      p.nombre.toLowerCase().includes('audifonos') ||
      p.nombre.toLowerCase().includes('beats') ||
      p.categoria === 'Audio'
    ).sort((a, b) => a.precio - b.precio).slice(0, 3);
  });

  filteredProducts = computed(() => {
    let list = this.allProducts();
    const q = this.searchQuery.trim().toLowerCase();
    const floor = this.selectedFloor();
    const cat = this.selectedCategory();
    const bracket = this.priceBracket;

    // Filter by Floor
    if (floor !== 'Todos los Pisos') {
      list = list.filter((p) => p.tienda?.piso === floor);
    }

    // Filter by Category
    if (cat !== 'all') {
      list = list.filter((p) =>
        p.categoria?.toLowerCase().includes(cat.toLowerCase()) ||
        p.nombre.toLowerCase().includes(cat.toLowerCase())
      );
    }

    // Filter by Price Bracket
    if (bracket === 'under50') {
      list = list.filter((p) => p.precio <= 50);
    } else if (bracket === '50to100') {
      list = list.filter((p) => p.precio > 50 && p.precio <= 100);
    } else if (bracket === 'above100') {
      list = list.filter((p) => p.precio > 100);
    }

    // Filter by Search Query
    if (q) {
      list = list.filter((p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.tienda?.nombre.toLowerCase().includes(q) ||
        p.tienda?.local.toLowerCase().includes(q) ||
        (p.categoria && p.categoria.toLowerCase().includes(q))
      );
    }

    // Sort
    if (this.sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.precio - b.precio);
    } else if (this.sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.precio - a.precio);
    }

    return list;
  });

  ngOnInit(): void {
    this.allProducts.set(this.catalogService.products());
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['categoria']) {
        this.selectedCategory.set(params['categoria']);
      }
      if (params['piso']) {
        this.selectedFloor.set(params['piso']);
      }
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedFloor.set('Todos los Pisos');
    this.selectedCategory.set('all');
    this.priceBracket = 'all';
    this.sortBy = 'featured';
  }

  addToCart(product: Product): void {
    const res = this.cartService.addItem(product);
    if (res.success) {
      this.toastService.show(`"${product.nombre}" agregado al carrito`, 'success');
    } else {
      this.toastService.show(res.message || 'Error al agregar', 'error');
    }
  }
}
