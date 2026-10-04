import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../../../core/services/catalog.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Store, Product } from '../../../../core/models';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

type StoreTab = 'destacados' | 'catalogo' | 'contacto';

interface TiendaReview {
  autor: string;
  iniciales: string;
  fecha: string;
  texto: string;
  estrellas: number;
}

@Component({
  selector: 'app-tienda-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonComponent, StateMessageComponent, IconComponent],
  template: `
    <div class="space-y-5 pb-8">
      <!-- Back Navigation -->
      <a
        routerLink="/cliente/tiendas"
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
        <!-- ============================ HERO ============================ -->
        <section class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div class="relative h-44 sm:h-60 md:h-72 w-full bg-slate-800">
            @if (store()?.portada_url) {
              <img
                [src]="store()?.portada_url"
                [alt]="store()?.nombre"
                class="w-full h-full object-cover"
              />
            }
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent"></div>

            <!-- Floating location badges -->
            <div class="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap items-center gap-1.5">
              <span class="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black border border-white/20">
                {{ store()?.piso }}
              </span>
              <span class="px-2 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black inner-border-subtle">
                {{ store()?.local }}
              </span>
              <span class="px-2 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-[10px] font-bold border border-white/25">
                {{ store()?.rubro }}
              </span>
            </div>

            <!-- Open state pill over banner -->
            <div class="absolute top-3 right-3 sm:top-4 sm:right-4">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black backdrop-blur-xs border shadow-xs"
                [class.bg-emerald-500/90]="isOpenNow()"
                [class.text-emerald-950]="isOpenNow()"
                [class.border-emerald-300/60]="isOpenNow()"
                [class.bg-slate-900/85]="!isOpenNow()"
                [class.text-slate-200]="!isOpenNow()"
                [class.border-white/20]="!isOpenNow()"
              >
                @if (isOpenNow()) {
                  <span class="size-1.5 rounded-full bg-emerald-900 animate-pulse"></span>
                  Abierto ahora
                } @else {
                  <span class="size-1.5 rounded-full bg-slate-400"></span>
                  Cerrado ahora
                }
                <span class="font-mono opacity-80">{{ relojLocal() }}</span>
              </span>
            </div>
          </div>

          <!-- Identity block -->
          <div class="px-4 sm:px-6 pb-5 relative">
            <div class="flex items-end justify-between gap-3 -mt-10 sm:-mt-14">
              <img
                [src]="store()?.logo_url"
                [alt]="store()?.nombre"
                class="size-20 sm:size-28 rounded-2xl object-cover border-4 border-white shadow-2xl bg-white shrink-0 ring-1 ring-slate-900/5"
              />

              <div class="flex items-center gap-2 pb-1">
                <a
                  [href]="whatsappLink()"
                  target="_blank"
                  rel="noopener"
                  class="btn-press hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                >
                  <svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.31-1.96 1.36-.5.05-.98.23-3.3-.69-2.79-1.11-4.55-3.96-4.69-4.14-.14-.19-1.13-1.5-1.13-2.86 0-1.37.71-2.03.96-2.31.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.55.8 1.9.87 2.04.07.14.12.3.02.49-.1.19-.15.3-.29.47-.15.17-.31.37-.44.5-.15.15-.3.31-.13.61.17.3.75 1.23 1.6 2 1.1.98 2.03 1.29 2.32 1.43.3.14.47.12.64-.07.17-.19.73-.85.93-1.15.19-.3.38-.24.64-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.7-.17 1.39z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  (click)="goToCatalog()"
                  class="btn-press inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs inner-border-subtle cursor-pointer"
                >
                  <span>Ver productos</span>
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Name + rating -->
            <div class="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div class="min-w-0">
                <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {{ store()?.nombre }}
                </h1>
                <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {{ store()?.rubro }}
                  @if (store()?.sector) {
                    <span class="text-slate-400">&middot; {{ store()?.sector }}</span>
                  }
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center gap-0.5" aria-hidden="true">
                  @for (star of starSlots; track $index) {
                    <svg
                      class="size-4"
                      [attr.fill]="star <= starFill() ? '#f59e0b' : '#e2e8f0'"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.3a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.3c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.3a1 1 0 00-.36-1.12L1.98 8.73c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.3z" />
                    </svg>
                  }
                </div>
                <span class="text-sm font-black text-slate-900 tabular-nums">
                  {{ rating() | number: '1.1-1' }}
                </span>
                <span class="text-[11px] text-slate-500 font-medium">
                  ({{ reviewCount() }} reseñas)
                </span>
              </div>
            </div>
          </div>

          <!-- Info strip -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border-t border-slate-100">
            <div class="bg-white p-4 flex items-start gap-2.5">
              <div class="size-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 ring-1 ring-inset ring-slate-100">
                <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ubicación</span>
                <span class="text-xs font-bold text-slate-800 block truncate">
                  {{ store()?.piso }} &middot; {{ store()?.local }}
                </span>
              </div>
            </div>

            <div class="bg-white p-4 flex items-start gap-2.5">
              <div class="size-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 ring-1 ring-inset ring-slate-100">
                <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lun a Sáb</span>
                <span class="text-xs font-bold text-slate-800 block truncate">{{ store()?.horario_semana }}</span>
              </div>
            </div>

            <div class="bg-white p-4 flex items-start gap-2.5">
              <div class="size-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 ring-1 ring-inset ring-slate-100">
                <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Dom. y feriados</span>
                <span class="text-xs font-bold text-slate-800 block truncate">{{ store()?.horario_domingo_feriado }}</span>
              </div>
            </div>

            <div class="bg-white p-4 flex items-start gap-2.5">
              <div class="size-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 ring-1 ring-inset ring-slate-100">
                <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h2.2a1 1 0 01.9.6L9.6 6h9.8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <div class="min-w-0">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Contacto</span>
                <span class="text-xs font-bold text-slate-800 block truncate">
                  {{ store()?.telefono || 'En mostrador' }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ============================ TABS ============================ -->
        <div
          role="tablist"
          aria-label="Secciones de la tienda"
          class="flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200/80 shadow-xs w-full sm:w-auto sm:inline-flex"
        >
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              role="tab"
              [id]="'tab-' + tab.key"
              [attr.aria-selected]="activeTab() === tab.key"
              [attr.aria-controls]="'panel-' + tab.key"
              (click)="setTab(tab.key)"
              class="flex-1 sm:flex-none h-9 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
              [class.bg-slate-900]="activeTab() === tab.key"
              [class.text-white]="activeTab() === tab.key"
              [class.shadow-xs]="activeTab() === tab.key"
              [class.text-slate-600]="activeTab() !== tab.key"
              [class.hover:bg-slate-50]="activeTab() !== tab.key"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- ============================ TAB: DESTACADOS ============================ -->
        @if (activeTab() === 'destacados') {
          <section id="panel-destacados" role="tabpanel" aria-labelledby="tab-destacados" class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
                Productos Destacados ({{ destacados().length }})
              </h2>
              <span class="text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <app-icon name="bolt" [size]="12" class="inline-block align-[-1px] mr-0.5" />
                Retiro inmediato en mostrador
              </span>
            </div>

            @if (destacados().length === 0) {
              <app-state-message
                type="empty"
                title="Sin productos disponibles"
                message="Este comercio todavía no tiene productos cargados."
              />
            } @else {
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                @for (prod of destacados(); track prod.id; let i = $index) {
                  <article
                    class="card-press group bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 transition-all"
                  >
                    <div class="space-y-2">
                      <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img
                          [src]="prod.imagen_url"
                          [alt]="prod.nombre"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        @if (i === 0) {
                          <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-black">
                            Más pedido
                          </span>
                        } @else if (prod.stock <= 5) {
                          <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                            ¡Últimas {{ prod.stock }}!
                          </span>
                        }
                      </div>

                      <div>
                        <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {{ prod.categoria || 'General' }}
                        </span>
                        <h3 class="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                          {{ prod.nombre }}
                        </h3>
                      </div>
                    </div>

                    <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span class="text-[10px] text-slate-400 block leading-none">Precio</span>
                        <span class="text-sm font-extrabold text-slate-900 tabular-nums">
                          Bs. {{ prod.precio | number: '1.2-2' }}
                        </span>
                      </div>

                      <button
                        type="button"
                        (click)="addToCart(prod)"
                        class="btn-press size-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                        title="Agregar al Carrito"
                        aria-label="Agregar al Carrito"
                      >
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        }

        <!-- ============================ TAB: CATÁLOGO ============================ -->
        @if (activeTab() === 'catalogo') {
          <section id="panel-catalogo" role="tabpanel" aria-labelledby="tab-catalogo" class="space-y-4">
            @if (products().length === 0) {
              <app-state-message
                type="empty"
                title="Sin productos activos"
                message="Este comercio no tiene productos disponibles en este momento."
              />
            } @else {
              <!-- Category filters -->
              @if (categorias().length > 1) {
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    (click)="setCategory(null)"
                    class="h-8 px-3 rounded-full text-[11px] font-bold border transition cursor-pointer"
                    [class.bg-slate-900]="activeCategory() === null"
                    [class.text-white]="activeCategory() === null"
                    [class.border-slate-900]="activeCategory() === null"
                    [class.bg-white]="activeCategory() !== null"
                    [class.text-slate-600]="activeCategory() !== null"
                    [class.border-slate-200]="activeCategory() !== null"
                    [class.hover:bg-slate-50]="activeCategory() !== null"
                  >
                    Todas
                  </button>
                  @for (cat of categorias(); track cat) {
                    <button
                      type="button"
                      (click)="setCategory(cat)"
                      class="h-8 px-3 rounded-full text-[11px] font-bold border transition cursor-pointer"
                      [class.bg-slate-900]="activeCategory() === cat"
                      [class.text-white]="activeCategory() === cat"
                      [class.border-slate-900]="activeCategory() === cat"
                      [class.bg-white]="activeCategory() !== cat"
                      [class.text-slate-600]="activeCategory() !== cat"
                      [class.border-slate-200]="activeCategory() !== cat"
                      [class.hover:bg-slate-50]="activeCategory() !== cat"
                    >
                      {{ cat }}
                    </button>
                  }
                </div>
              }

              <h2 class="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
                {{ activeCategory() || 'Catálogo Completo' }} ({{ filteredProducts().length }})
              </h2>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                @for (prod of filteredProducts(); track prod.id) {
                  <article
                    class="card-press group bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 transition-all"
                  >
                    <div class="space-y-2">
                      <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
                        <img
                          [src]="prod.imagen_url"
                          [alt]="prod.nombre"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        @if (prod.stock <= 5) {
                          <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold shadow-xs">
                            ¡Últimas {{ prod.stock }}!
                          </span>
                        } @else if (prod.stock === 0) {
                          <span class="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-black text-slate-500">
                            Agotado
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

                    <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span class="text-[10px] text-slate-400 block leading-none">Precio</span>
                        <span class="text-sm font-extrabold text-slate-900 tabular-nums">
                          Bs. {{ prod.precio | number: '1.2-2' }}
                        </span>
                      </div>

                      <button
                        type="button"
                        (click)="addToCart(prod)"
                        [disabled]="prod.stock === 0"
                        class="btn-press size-9 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                        title="Agregar al Carrito"
                        aria-label="Agregar al Carrito"
                      >
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </article>
                }
              </div>
            }
          </section>
        }

        <!-- ============================ TAB: CONTACTO ============================ -->
        @if (activeTab() === 'contacto') {
          <section id="panel-contacto" role="tabpanel" aria-labelledby="tab-contacto" class="space-y-5">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <!-- Location & hours -->
              <div class="lg:col-span-3 space-y-5">
                <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <div class="size-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center ring-1 ring-inset ring-amber-100">
                      <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-slate-900 tracking-tight">Ubicación del local</h3>
                      <p class="text-[11px] text-slate-500">Centro Comercial Paseo Aranjuez</p>
                    </div>
                  </div>

                  <dl class="space-y-2.5 text-xs">
                    <div class="flex justify-between gap-4">
                      <dt class="text-slate-500 font-medium">Dirección</dt>
                      <dd class="font-bold text-slate-800 text-right">Av. América y Pantaleón Dalence, Cochabamba</dd>
                    </div>
                    <div class="flex justify-between gap-4">
                      <dt class="text-slate-500 font-medium">Piso</dt>
                      <dd class="font-bold text-slate-800 text-right">{{ store()?.piso }}</dd>
                    </div>
                    <div class="flex justify-between gap-4">
                      <dt class="text-slate-500 font-medium">Local</dt>
                      <dd class="font-bold text-slate-800 text-right">{{ store()?.local }}</dd>
                    </div>
                    @if (store()?.sector) {
                      <div class="flex justify-between gap-4">
                        <dt class="text-slate-500 font-medium">Sector</dt>
                        <dd class="font-bold text-slate-800 text-right">{{ store()?.sector }}</dd>
                      </div>
                    }
                    <div class="flex justify-between gap-4">
                      <dt class="text-slate-500 font-medium">Teléfono</dt>
                      <dd class="font-bold text-slate-800 text-right tabular-nums">{{ store()?.telefono || '—' }}</dd>
                    </div>
                  </dl>
                </div>

                <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <div class="size-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center ring-1 ring-inset ring-sky-100">
                      <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-slate-900 tracking-tight">Horarios de atención</h3>
                      <p class="text-[11px] text-slate-500">
                        {{ isOpenNow() ? 'Abierto ahora mismo' : 'Cerrado en este momento' }} &middot; hora local {{ relojLocal() }}
                      </p>
                    </div>
                  </div>

                  <table class="w-full text-xs">
                    <tbody class="divide-y divide-slate-100">
                      <tr class="flex justify-between">
                        <td class="py-2 font-medium text-slate-600">Lunes a Sábado</td>
                        <td class="py-2 font-bold text-slate-900 tabular-nums">{{ store()?.horario_semana }}</td>
                      </tr>
                      <tr class="flex justify-between">
                        <td class="py-2 font-medium text-slate-600">Domingos y feriados</td>
                        <td class="py-2 font-bold text-slate-900 tabular-nums">{{ store()?.horario_domingo_feriado }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <a
                    [href]="whatsappLink()"
                    target="_blank"
                    rel="noopener"
                    class="btn-press flex items-center justify-center gap-2 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.31-1.96 1.36-.5.05-.98.23-3.3-.69-2.79-1.11-4.55-3.96-4.69-4.14-.14-.19-1.13-1.5-1.13-2.86 0-1.37.71-2.03.96-2.31.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.55.8 1.9.87 2.04.07.14.12.3.02.49-.1.19-.15.3-.29.47-.15.17-.31.37-.44.5-.15.15-.3.31-.13.61.17.3.75 1.23 1.6 2 1.1.98 2.03 1.29 2.32 1.43.3.14.47.12.64-.07.17-.19.73-.85.93-1.15.19-.3.38-.24.64-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.7-.17 1.39z" />
                    </svg>
                    Escribir a {{ store()?.nombre }}
                  </a>
                </div>
              </div>

              <!-- Pickup steps + reviews -->
              <div class="lg:col-span-2 space-y-5">
                <div class="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 class="text-xs font-black uppercase tracking-wider text-amber-400">
                    Cómo retirar tu compra
                  </h3>

                  <ol class="space-y-3.5">
                    <li class="flex items-start gap-3">
                      <span class="size-7 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                      <div>
                        <p class="text-xs font-bold leading-tight">Agrega productos al carrito</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">Desde {{ products().length }} artículos disponibles.</p>
                      </div>
                    </li>
                    <li class="flex items-start gap-3">
                      <span class="size-7 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                      <div>
                        <p class="text-xs font-bold leading-tight">Confirma tu pedido y paga online</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">Recibirás un pase QR oficial de retiro.</p>
                      </div>
                    </li>
                    <li class="flex items-start gap-3">
                      <span class="size-7 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                      <div>
                        <p class="text-xs font-bold leading-tight">Muestra el QR en el mostrador</p>
                        <p class="text-[11px] text-slate-400 mt-0.5">
                          {{ store()?.piso }} &middot; {{ store()?.local }} — {{ isOpenNow() ? 'Abierto ahora' : 'Atención dentro del horario' }}.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 class="text-sm font-black text-slate-900 tracking-tight">Reseñas de clientes</h3>
                    <span class="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <app-icon name="star" [size]="12" class="inline-block align-[-1px]" />
                      {{ rating() | number: '1.1-1' }}
                    </span>
                  </div>

                  <div class="space-y-4">
                    @for (review of reviews(); track review.autor + review.fecha) {
                      <div class="space-y-1.5">
                        <div class="flex items-center gap-2.5">
                          <span
                            class="size-8 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0"
                          >
                            {{ review.iniciales }}
                          </span>
                          <div class="min-w-0 flex-1">
                            <p class="text-xs font-bold text-slate-900 truncate">{{ review.autor }}</p>
                            <p class="text-[10px] text-slate-400">{{ review.fecha }}</p>
                          </div>
                          <div class="flex items-center gap-0.5 shrink-0" aria-hidden="true">
                            @for (star of starSlots; track $index) {
                              <svg class="size-3" [attr.fill]="star <= review.estrellas ? '#f59e0b' : '#e2e8f0'" viewBox="0 0 20 20">
                                <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.3a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.3c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.3a1 1 0 00-.36-1.12L1.98 8.73c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.3z" />
                              </svg>
                            }
                          </div>
                        </div>
                        <p class="text-[11px] text-slate-600 leading-relaxed pl-10.5">{{ review.texto }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>
        }
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
  private destroyRef = inject(DestroyRef);

  store = signal<Store | undefined>(undefined);
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);

  activeTab = signal<StoreTab>('destacados');
  activeCategory = signal<string | null>(null);
  isOpenNow = signal<boolean>(true);
  relojLocal = signal<string>('--:--');

  readonly tabs: { key: StoreTab; label: string }[] = [
    { key: 'destacados', label: 'Destacados' },
    { key: 'catalogo', label: 'Catálogo' },
    { key: 'contacto', label: 'Contacto' },
  ];

  readonly starSlots = [1, 2, 3, 4, 5];

  /** Calificación determinista 4.2 – 4.9 derivada del hash del store id (datos demo) */
  readonly rating = computed(() => {
    const id = this.store()?.id ?? 'paseo';
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = (h * 31 + id.charCodeAt(i)) % 9973;
    }
    return 4.2 + (h % 8) / 10;
  });

  readonly starFill = computed(() => Math.round(this.rating()));

  readonly reviews = computed<TiendaReview[]>(() => {
    const st = this.store();
    const base = Math.round(this.rating());
    return [
      {
        autor: 'María Fernández',
        iniciales: 'MF',
        fecha: 'Hace 3 días',
        estrellas: base,
        texto: `Atención muy ágil en el mostrador. Hice el pedido desde PaseoYa y me entregaron en minutos en ${st?.local ?? 'el local'}.`,
      },
      {
        autor: 'Diego Rojas',
        iniciales: 'DJ',
        fecha: 'Hace 1 semana',
        estrellas: Math.max(3, base - 1),
        texto: 'El inventario del local coincide con el catálogo online. Encontré todo lo que buscaba en el mismo piso.',
      },
      {
        autor: 'Carla Suárez',
        iniciales: 'CS',
        fecha: 'Hace 2 semanas',
        estrellas: base,
        texto: 'Excelente experiencia de retiro: escanean el QR y te pasan el producto sin esperas. Volveré a comprar.',
      },
    ];
  });

  readonly reviewCount = computed(() => 3);

  /** Categorías únicas del catálogo propio del comercio */
  readonly categorias = computed<string[]>(() =>
    [...new Set(this.products().map((p) => p.categoria).filter((c): c is string => !!c))].sort((a, b) =>
      a.localeCompare(b, 'es')
    )
  );

  readonly destacados = computed<Product[]>(() =>
    [...this.products()].sort((a, b) => b.stock - a.stock).slice(0, 4)
  );

  readonly filteredProducts = computed<Product[]>(() => {
    const cat = this.activeCategory();
    return cat === null ? this.products() : this.products().filter((p) => p.categoria === cat);
  });

  readonly whatsappLink = computed(() => {
    const phone = (this.store()?.telefono ?? '').replace(/\D/g, '');
    return phone
      ? `https://wa.me/591${phone}`
      : `https://wa.me/?text=${encodeURIComponent(`Hola! Quiero consultar por productos de ${this.store()?.nombre ?? 'PaseoYa'}`)}`;
  });

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
        this.evaluateSchedule();
        this.startScheduleClock();
      }
    } else {
      this.loading.set(false);
    }
  }

  setTab(tab: StoreTab): void {
    this.activeTab.set(tab);
  }

  setCategory(cat: string | null): void {
    this.activeCategory.set(cat);
  }

  goToCatalog(): void {
    this.activeTab.set('catalogo');
  }

  addToCart(product: Product): void {
    if (product.stock === 0) {
      this.toastService.error('Producto agotado por el momento.');
      return;
    }
    const productWithStore: Product = {
      ...product,
      tienda: this.store(),
    };

    const res = this.cartService.addItem(productWithStore, 1);
    if (res.success) {
      this.toastService.success(`"${product.nombre}" agregado al carrito.`);
    } else {
      this.toastService.error(res.message || 'No se pudo agregar el producto.');
    }
  }

  /** Estado abierto/cerrado real en hora de Cochabamba (America/La_Paz, UTC-4) */
  private evaluateSchedule(): void {
    const st = this.store();
    if (!st) return;

    const parse = (t: string): number => {
      const [h, m] = t.trim().split(':').map((n) => parseInt(n, 10));
      return (h || 0) * 60 + (m || 0);
    };

    const [iniStr, finStr] = st.horario_semana.split('-');
    const ini = parse(iniStr ?? '00:00');
    const fin = parse(finStr ?? '00:00');

    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/La_Paz',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const hh = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const mm = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    const actual = hh * 60 + mm;

    this.relojLocal.set(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    this.isOpenNow.set(fin >= ini ? actual >= ini && actual <= fin : actual >= ini || actual <= fin);
  }

  /** Timer de 60 s con limpieza automática del ciclo de vida */
  private startScheduleClock(): void {
    const id = setInterval(() => this.evaluateSchedule(), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}