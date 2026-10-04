import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { Store, Category, Product } from '../../../../core/models';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { floorIcon } from '../../../../shared/ui/icon/icon-maps';

@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StateMessageComponent, IconComponent],
  template: `
    <div class="space-y-4 pb-12">
      
      <!-- Top Hero Header -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 shadow-lg space-y-2 relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 size-36 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
            <app-icon name="store" [size]="12" />
            Directorio Comercial
          </span>
          <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
            ● 12 Locales Activos
          </span>
        </div>
        <h1 class="text-xl font-black tracking-tight leading-tight">
          Tiendas en Paseo Aranjuez
        </h1>
        <p class="text-xs text-slate-300 leading-relaxed max-w-sm">
          Explora boutiques, tecnología, mercado gastronómico y terrazas por piso. Retira en mostrador con tu QR.
        </p>
      </div>

      <!-- Interactive Search & Floor Guide -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
        <!-- Search by Store or Rubro -->
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar tienda, rubro o local (ej: Sony, Burger, 215)..."
            class="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none transition placeholder:text-slate-400"
          />
          <svg class="size-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Floor Interactive Switcher with Mall Icons -->
        <div class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Seleccionar Piso del Paseo:</span>
          <div class="grid grid-cols-5 gap-1.5 text-xs">
            @for (f of floorTabs; track f.key) {
              <button
                type="button"
                (click)="selectFloor(f.key)"
                [class]="selectedFloor() === f.key ? 'bg-slate-900 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                class="py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
              >
                <app-icon [name]="f.icon" [size]="14" />
                <span class="text-[10px] leading-tight font-bold truncate">{{ f.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Active Floor Context Banner -->
        @if (selectedFloor() !== 'Todos') {
          <div class="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <app-icon [name]="getFloorInfo(selectedFloor()).icon" [size]="18" />
              <div>
                <p class="font-bold text-xs leading-tight text-amber-950">{{ getFloorInfo(selectedFloor()).title }}</p>
                <p class="text-[11px] text-amber-800">{{ getFloorInfo(selectedFloor()).description }}</p>
              </div>
            </div>
            <button
              (click)="selectFloor('Todos')"
              class="btn-press text-[11px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
            >
              Ver todos
            </button>
          </div>
        }
      </div>

      <!-- Stores Showcase Grid / Interactive Cards -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="h-44 bg-slate-200 rounded-3xl animate-pulse"></div>
          }
        </div>
      } @else if (filteredStores().length === 0) {
        <app-state-message
          type="empty"
          title="No se encontraron tiendas con estos criterios"
          message="Intenta seleccionando 'Todos los Pisos' o limpiando el texto de búsqueda."
          actionLabel="Ver todas las tiendas"
          (actionClicked)="clearFilters()"
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (store of filteredStores(); track store.id) {
            <article class="card-press bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-400 transition duration-200 flex flex-col justify-between group">
              
              <!-- Store Header with Cover Banner -->
              <div class="relative h-28 w-full bg-slate-800 overflow-hidden">
                <img
                  [src]="store.portada_url || store.logo_url"
                  [alt]="store.nombre"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-transparent"></div>

                <!-- Floating Floor & Local Badge -->
                <div class="absolute top-3 left-3 flex items-center gap-1.5">
                  <span class="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black border border-white/20">
                    {{ store.piso }}
                  </span>
                  <span class="px-2 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-xs inner-border-subtle">
                    {{ store.local }}
                  </span>
                </div>

                <!-- Pickup QR Badge -->
                <div class="absolute top-3 right-3">
                  <span class="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-xs text-amber-200 text-[9px] font-bold border border-amber-700/50 flex items-center gap-1">
                    <app-icon name="ticket" [size]="10" />
                    <span>Retiro QR</span>
                  </span>
                </div>

                <!-- Store Logo Overlay -->
                <div class="absolute -bottom-4 left-4 z-10 size-14 rounded-2xl bg-white p-1 shadow-md border border-slate-100 overflow-hidden">
                  <img [src]="store.logo_url" [alt]="store.nombre" class="w-full h-full object-cover rounded-xl" />
                </div>
              </div>

              <!-- Store Body Details -->
              <div class="pt-6 p-4 space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="font-black text-base text-slate-900 leading-snug group-hover:text-amber-700 transition-colors truncate">
                      {{ store.nombre }}
                    </h3>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">
                      {{ store.rubro }} &middot; {{ store.sector || 'Sector Comercial' }}
                    </p>
                  </div>
                </div>

                <!-- Hours & Location details -->
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span class="flex items-center gap-1.5">
                    <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Lun-Sáb: <strong class="tabular-nums">{{ store.horario_semana }}</strong></span>
                  </span>
                  <span class="text-slate-400 tabular-nums">Dom: {{ store.horario_domingo_feriado }}</span>
                </div>

                <!-- Store Products Quick Teaser (Interactive Thumbnails) -->
                @if (getStoreProducts(store.id).length > 0) {
                  <div class="space-y-1.5 pt-1">
                    <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Productos populares en mostrador:
                    </span>
                    <div class="grid grid-cols-2 gap-2">
                      @for (prod of getStoreProducts(store.id); track prod.id) {
                        <div class="card-press p-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 transition flex items-center gap-2 cursor-pointer">
                          <img [src]="prod.imagen_url" [alt]="prod.nombre" class="size-9 rounded-lg object-cover bg-white shrink-0" />
                          <div class="min-w-0 flex-1">
                            <p class="text-[11px] font-bold text-slate-800 truncate leading-tight">{{ prod.nombre }}</p>
                            <p class="text-[11px] font-black text-amber-700 tabular-nums">Bs. {{ prod.precio.toFixed(2) }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Action Buttons: Explore -->
                <div class="pt-2 flex items-center">
                  <a
                    [routerLink]="['/cliente/tiendas', store.id]"
                    class="btn-press w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer inner-border-subtle"
                  >
                    <span>Ver Catálogo Completo</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiendasComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);

  stores = signal<Store[]>([]);
  allProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);
  selectedFloor = signal<string>('Todos');
  searchQuery = '';

  readonly floorTabs = [
    { key: 'Todos', label: 'Todos', icon: 'building' as const },
    { key: 'Piso 1', label: 'Piso 1', icon: 'shirt' as const },
    { key: 'Piso 2', label: 'Piso 2', icon: 'headphones' as const },
    { key: 'Piso 3', label: 'Piso 3', icon: 'burger' as const },
    { key: 'Piso 4', label: 'Piso 4', icon: 'wine' as const },
  ];

  filteredStores = computed(() => {
    let list = this.stores();
    const fl = this.selectedFloor();
    const q = this.searchQuery.trim().toLowerCase();

    if (fl !== 'Todos') {
      list = list.filter((s) => s.piso === fl);
    }

    if (q) {
      list = list.filter((s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.rubro.toLowerCase().includes(q) ||
        s.local.toLowerCase().includes(q) ||
        (s.sector && s.sector.toLowerCase().includes(q))
      );
    }

    return list;
  });

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.catalogService.getStores();
      this.stores.set(data);
      this.allProducts.set(this.catalogService.products());

      this.route.queryParams.subscribe((params) => {
        if (params['piso']) {
          this.selectedFloor.set(params['piso']);
        }
      });
    } finally {
      this.loading.set(false);
    }
  }

  selectFloor(floor: string): void {
    this.selectedFloor.set(floor);
  }

  clearFilters(): void {
    this.selectedFloor.set('Todos');
    this.searchQuery = '';
  }

  getStoreProducts(storeId: string): Product[] {
    return this.allProducts().filter((p) => p.store_id === storeId).slice(0, 2);
  }

  getFloorInfo(floor: string): { title: string; description: string; icon: any } {
    switch (floor) {
      case 'Piso 1':
        return { title: 'Piso 1: Moda & Joyería', description: 'Boutiques de ropa exclusiva, accesorios y joyería fina.', icon: 'shirt' };
      case 'Piso 2':
        return { title: 'Piso 2: Tecnología & Gadgets', description: 'Sony, Xiaomi, Apple. ¡Comparador de audífonos bluetooth!', icon: 'headphones' };
      case 'Piso 3':
        return { title: 'Piso 3: Mercado Gastronómico & Sky Games', description: 'Hamburguesas, comida tradicional, pizzas y arcades.', icon: 'burger' };
      case 'Piso 4':
        return { title: 'Piso 4: Terraza Gourmet El Cuarto', description: 'Carnes a la parrilla, tablas de quesos y vinos de altura.', icon: 'wine' };
      default:
        return { title: 'Paseo Aranjuez', description: 'Todos los locales comerciales del mall.', icon: 'building' };
    }
  }
}
