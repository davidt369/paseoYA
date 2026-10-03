import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Category, Store, Product } from '../../../../core/models';

interface MallStory {
  id: string;
  storeName: string;
  piso: string;
  avatarUrl: string;
  imageUrl: string;
  title: string;
  tagline: string;
  highlightText: string;
  queryPrompt?: string;
  storeId?: string;
}

interface FeedPost {
  id: string;
  storeName: string;
  piso: string;
  local: string;
  avatarUrl: string;
  timeAgo: string;
  badge: string;
  content: string;
  imageUrl?: string;
  product?: {
    id: string;
    nombre: string;
    precio: number;
    store_id: string;
    imagen_url: string;
    stock: number;
  };
  likes: number;
  isLiked?: boolean;
  queryPrompt: string;
}

@Component({
  selector: 'app-cliente-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="lg:grid lg:grid-cols-12 gap-8 pb-8">
      <!-- Main Content Area (Mobile + Desktop feed) -->
      <div class="lg:col-span-8 space-y-4">

      <!-- 1. FACEBOOK-STYLE STORIES BAR (Historias de Paseo Aranjuez) -->
      <section class="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs">
        <div class="flex items-center justify-between mb-2 px-1">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-amber-500 animate-ping"></span>
            Historias & Promos del Paseo
          </span>
          <span class="text-[10px] text-slate-400 font-bold">Desliza &rarr;</span>
        </div>

        <div class="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
          @for (story of stories; track story.id) {
            <button
              type="button"
              (click)="openStory(story)"
              class="btn-press flex flex-col items-center gap-1.5 shrink-0 snap-start focus:outline-none group cursor-pointer"
            >
              <!-- Story Avatar with Vibrant Instagram/Facebook Gradient Ring -->
              <div class="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 group-hover:scale-105 transition-transform duration-150 shadow-xs">
                <div class="size-15 rounded-full overflow-hidden bg-white p-[2px]">
                  <img
                    [src]="story.avatarUrl"
                    [alt]="story.storeName"
                    class="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
                <span class="absolute -bottom-1 -right-0.5 text-[10px] bg-slate-900 text-white font-black px-1.5 py-0.2 rounded-full border-2 border-white tabular-nums shadow-xs">
                  {{ story.piso.replace('Piso ', 'P') }}
                </span>
              </div>
              <span class="text-[11px] font-bold text-slate-800 text-center w-17 truncate leading-tight tracking-tight">
                {{ story.storeName }}
              </span>
            </button>
          }
        </div>
      </section>

      <!-- 2. QUICK SEARCH BAR (Redirige a catálogo de productos) -->
      <section class="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 shadow-xs inner-border-subtle">
            PY
          </div>
          <div class="flex-1 relative">
            <input
              type="text"
              [(ngModel)]="quickSearchText"
              (keydown.enter)="handleQuickSearch()"
              placeholder="¿Qué producto buscas en el Paseo?"
              class="w-full h-10 px-4 text-xs bg-slate-100 hover:bg-slate-50 focus:bg-white rounded-full border border-slate-200/80 focus:border-amber-500 focus:outline-none transition-colors placeholder:text-slate-400 font-medium"
            />
          </div>
          <button
            type="button"
            (click)="handleQuickSearch()"
            class="btn-press size-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer inner-border-subtle"
            title="Buscar productos"
          >
            <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <!-- Quick Filter Shortcuts (Direct catalog navigation) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <a
            routerLink="/cliente/productos"
            [queryParams]="{ categoria: 'electronica' }"
            class="btn-press px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold text-[11px] whitespace-nowrap border border-slate-200/60 cursor-pointer"
          >
            🎧 Audífonos bluetooth
          </a>
          <a
            routerLink="/cliente/productos"
            [queryParams]="{ categoria: 'gastronomia' }"
            class="btn-press px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold text-[11px] whitespace-nowrap border border-slate-200/60 cursor-pointer"
          >
            🍔 Almuerzo Piso 3
          </a>
          <a
            routerLink="/cliente/tiendas"
            [queryParams]="{ piso: 'Piso 4' }"
            class="btn-press px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-semibold text-[11px] whitespace-nowrap border border-slate-200/60 cursor-pointer"
          >
            🍷 Terraza El Cuarto
          </a>
          <div
            class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px] whitespace-nowrap border border-indigo-200/80"
          >
            🚗 2h Parqueo Gratis
          </div>
        </div>
      </section>

      <!-- 3. RUBROS & CATEGORÍAS RÁPIDAS -->
      <section class="space-y-2">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-500">Pisos Comerciales</h3>
          <a routerLink="/cliente/tiendas" class="text-xs font-bold text-amber-700 hover:underline">Ver todas</a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-4 gap-2">
            @for (i of [1,2,3,4]; track i) {
              <div class="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-4 gap-2">
            @for (cat of categories(); track cat.id) {
              <a
                [routerLink]="['/cliente/tiendas']"
                [queryParams]="{ categoria: cat.id }"
                class="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition text-center group active:scale-95"
              >
                <span class="text-2xl mb-1 group-hover:scale-110 transition-transform">{{ cat.icono }}</span>
                <span class="text-[10px] font-bold text-slate-800 leading-tight line-clamp-1">
                  {{ cat.nombre }}
                </span>
              </a>
            }
          </div>
        }
      </section>

      <!-- SECCIÓN DESTACADA: VENTA DE TODOS LOS PRODUCTOS JUNTOS -->
      <section class="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-4 text-white shadow-md space-y-3 border border-amber-500/30">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="size-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
              🛍️
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-black text-sm text-white leading-tight">Venta de Todos los Productos</h3>
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">TODAS LAS TIENDAS</span>
              </div>
              <p class="text-[10px] text-slate-300">Explora más de 30 productos juntos en un solo lugar</p>
            </div>
          </div>
          <a
            routerLink="/cliente/productos"
            class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition shrink-0"
          >
            Ver Todo &rarr;
          </a>
        </div>

        <!-- 3 Highlighted Cards from different stores/floors -->
        <div class="grid grid-cols-3 gap-2 pt-1">
          <a routerLink="/cliente/productos" class="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition flex flex-col justify-between group">
            <div>
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" class="w-full h-14 object-cover rounded-lg bg-white" />
              <p class="text-[10px] font-bold text-white truncate mt-1">Sony WH-CH520</p>
              <p class="text-[9px] text-amber-300">Piso 2 &middot; Bs. 250</p>
            </div>
          </a>

          <a routerLink="/cliente/productos" class="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition flex flex-col justify-between group">
            <div>
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300" class="w-full h-14 object-cover rounded-lg bg-white" />
              <p class="text-[10px] font-bold text-white truncate mt-1">Bacon Smash Burger</p>
              <p class="text-[9px] text-amber-300">Piso 3 &middot; Bs. 45</p>
            </div>
          </a>

          <a routerLink="/cliente/productos" class="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition flex flex-col justify-between group">
            <div>
              <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=300" class="w-full h-14 object-cover rounded-lg bg-white" />
              <p class="text-[10px] font-bold text-white truncate mt-1">Ojo de Bife 400g</p>
              <p class="text-[9px] text-amber-300">Piso 4 &middot; Bs. 95</p>
            </div>
          </a>
        </div>
      </section>

      <!-- 4. FACEBOOK-STYLE MALL SOCIAL FEED (Publicaciones con interacción) -->
      <section class="space-y-3.5">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>📰 Novedades en Directo del Paseo</span>
          </h3>
          <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ● Hoy Abierto 10-22h
          </span>
        </div>

        <!-- POST 1: AUDÍFONOS SONY -->
        @for (post of feedPosts(); track post.id) {
          <article class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-3">
            <!-- Post Header -->
            <div class="p-3.5 pb-0 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <img
                  [src]="post.avatarUrl"
                  [alt]="post.storeName"
                  class="size-10 rounded-full object-cover border border-slate-200 shrink-0"
                  loading="lazy"
                />
                <div>
                  <div class="flex items-center gap-1.5">
                    <h4 class="font-bold text-xs text-slate-900 leading-none">{{ post.storeName }}</h4>
                    <span class="size-1 rounded-full bg-slate-400"></span>
                    <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {{ post.piso }} &middot; {{ post.local }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 mt-0.5 leading-none">{{ post.timeAgo }} &middot; Paseo Aranjuez</p>
                </div>
              </div>

              <span class="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {{ post.badge }}
              </span>
            </div>

            <!-- Post Text Content -->
            <div class="px-3.5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {{ post.content }}
            </div>

            <!-- Embedded Product Card if any -->
            @if (post.product) {
              <div class="card-press mx-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                <img
                  [src]="post.product.imagen_url"
                  [alt]="post.product.nombre"
                  class="size-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                  loading="lazy"
                />
                <div class="min-w-0 flex-1">
                  <h5 class="font-bold text-xs text-slate-900 truncate leading-tight">{{ post.product.nombre }}</h5>
                  <p class="text-[11px] text-slate-500 tabular-nums">Stock: {{ post.product.stock }} unids</p>
                  <span class="text-xs font-black text-amber-700 tabular-nums">Bs. {{ post.product.precio.toFixed(2) }}</span>
                </div>
                <button
                  type="button"
                  (click)="addProductToCart(post.product)"
                  class="btn-press px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer shrink-0 inner-border-subtle"
                >
                  + Pedir
                </button>
              </div>
            }

            <!-- Facebook-Style Reaction Bar -->
            <div class="px-3.5 pt-2 pb-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <!-- Like button -->
              <button
                type="button"
                (click)="toggleLike(post)"
                [class.text-rose-600]="post.isLiked"
                class="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
              >
                <span class="transition-transform duration-150" [class.scale-125]="post.isLiked">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                <span class="text-[11px] tabular-nums">{{ post.likes }} Me gusta</span>
              </button>

              <!-- Retiro QR Info Badge -->
              <span class="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                🚗 Retiro QR + 2h Parqueo
              </span>
            </div>
          </article>
        }
        </section>
      </div>

      <!-- Right Column: Desktop & Tablet Mall Navigator (Visible on lg+ screens) -->
      <aside class="hidden lg:block lg:col-span-4 space-y-5">
        
        <!-- Mall Level Guide Card -->
        <div class="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-black text-sm text-slate-900 leading-tight">Guía de Pisos</h3>
              <p class="text-[11px] text-slate-500">Paseo Aranjuez &middot; Cochabamba</p>
            </div>
            <a routerLink="/cliente/tiendas" class="text-xs font-bold text-amber-700 hover:underline">Ver mapa &rarr;</a>
          </div>

          <div class="space-y-2.5 text-xs">
            <a routerLink="/cliente/tiendas" [queryParams]="{ piso: 'Piso 1' }" class="p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 flex items-center gap-3 transition group">
              <span class="size-9 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-base">👗</span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Piso 1: Moda & Joyería</p>
                <p class="text-[11px] text-slate-500">Boutiques, vestidos de diseñador, plata y lino</p>
              </div>
            </a>

            <a routerLink="/cliente/tiendas" [queryParams]="{ piso: 'Piso 2' }" class="p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 flex items-center gap-3 transition group">
              <span class="size-9 rounded-xl bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center text-base">🎧</span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Piso 2: Tecnología & Audio</p>
                <p class="text-[11px] text-slate-500">Sony, Xiaomi, Apple &middot; Audífonos Bluetooth</p>
              </div>
            </a>

            <a routerLink="/cliente/tiendas" [queryParams]="{ piso: 'Piso 3' }" class="p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 flex items-center gap-3 transition group">
              <span class="size-9 rounded-xl bg-orange-100 text-orange-900 font-bold flex items-center justify-center text-base">🍔</span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Piso 3: Mercado Gastronómico</p>
                <p class="text-[11px] text-slate-500">Burger Craft, Pique Macho, Pizzas y Sky Games</p>
              </div>
            </a>

            <a routerLink="/cliente/tiendas" [queryParams]="{ piso: 'Piso 4' }" class="p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 flex items-center gap-3 transition group">
              <span class="size-9 rounded-xl bg-rose-100 text-rose-900 font-bold flex items-center justify-center text-base">🍷</span>
              <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Piso 4: Terraza El Cuarto</p>
                <p class="text-[11px] text-slate-500">Cortes a las brasas, tablas gourmet y mirador</p>
              </div>
            </a>
          </div>
        </div>

        <!-- 2 Hours Free Parking Card -->
        <div class="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 shadow-sm border border-indigo-800/50 space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🚗</span>
            <span class="text-xs font-black text-amber-400 uppercase tracking-wide">Parqueo Subterráneo</span>
          </div>
          <h4 class="text-sm font-bold text-white">2 Horas Libres por Consumo</h4>
          <p class="text-xs text-slate-300 leading-relaxed">
            Compra en PaseoYa y al retirar en el local se emite tu ticket digital con código de barrera.
          </p>
          <div class="pt-1 text-[11px] text-indigo-300">
            Ingreso por calle Pantaleón Dalence.
          </div>
        </div>

        <!-- Desktop Information Widget -->
        <div class="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-3xl p-5 shadow-sm space-y-2.5">
          <div class="flex items-center gap-2">
            <span class="size-8 rounded-full bg-slate-950 text-amber-400 font-black text-xs flex items-center justify-center">PY</span>
            <div>
              <h4 class="text-xs font-black text-slate-950 uppercase tracking-wider">Centro Comercial Paseo Aranjuez</h4>
              <p class="text-[10px] text-amber-950 font-semibold">Cochabamba &middot; Bolivia</p>
            </div>
          </div>
          <div class="p-3 bg-slate-950/10 rounded-xl text-xs text-slate-950 font-medium leading-relaxed">
            Explora 4 pisos de moda, tecnología y gastronomía con 2 horas de parqueo subterráneo gratuito.
          </div>
        </div>
      </aside>
    </div>

    <!-- 5. INTERACTIVE STORY VIEWER MODAL -->
      @if (activeStory()) {
        <div
          class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200"
          (click)="closeStory()"
        >
          <div
            class="relative w-full max-w-sm bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            (click)="$event.stopPropagation()"
          >
            <!-- Progress Bar -->
            <div class="absolute top-3 inset-x-4 z-20 h-1 bg-white/30 rounded-full overflow-hidden">
              <div class="h-full bg-amber-400 w-3/4 animate-pulse"></div>
            </div>

            <!-- Top Header in Story -->
            <div class="absolute top-6 inset-x-4 z-20 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <img [src]="activeStory()!.avatarUrl" class="size-8 rounded-full border border-white" />
                <div>
                  <p class="font-bold text-xs leading-none">{{ activeStory()!.storeName }}</p>
                  <p class="text-[10px] text-slate-300 leading-none mt-0.5">{{ activeStory()!.piso }} &middot; Paseo Aranjuez</p>
                </div>
              </div>
              <button (click)="closeStory()" class="text-white hover:text-amber-400 text-base p-1">✕</button>
            </div>

            <!-- Story Image -->
            <div class="relative flex-1 min-h-[300px] overflow-hidden bg-slate-950">
              <img [src]="activeStory()!.imageUrl" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>
            </div>

            <!-- Story Content Bottom Overlay -->
            <div class="p-5 bg-slate-950 space-y-3 z-10">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {{ activeStory()!.tagline }}
                </span>
                <h3 class="text-base font-black text-white mt-1.5">{{ activeStory()!.title }}</h3>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ activeStory()!.highlightText }}</p>
              </div>

              <!-- Quick action in story -->
              <div class="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  (click)="closeStory()"
                  class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  stores = signal<Store[]>([]);
  loading = signal<boolean>(true);
  quickSearchText = '';
  activeStory = signal<MallStory | null>(null);

  // Facebook-Style Stories
  stories: MallStory[] = [
    {
      id: 'story-mall',
      storeName: 'Paseo Aranjuez',
      piso: 'Pisos 1-4',
      avatarUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=160&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80',
      title: '🚗 2 Horas de Parqueo Gratis',
      tagline: 'Beneficio Oficial',
      highlightText: 'Realiza tu compra en PaseoYa y retira en mostrador con tu código QR para desbloquear 2 horas de parqueo subterráneo gratuito.',
      queryPrompt: '¿Cómo funciona el parqueo gratis en Paseo Aranjuez?',
    },
    {
      id: 'story-sony',
      storeName: 'Sony Store',
      piso: 'Piso 2',
      avatarUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      title: '🎧 Audífonos Sony WH-CH520',
      tagline: 'Local 215 &middot; Tech',
      highlightText: 'Audio inalámbrico con 50 horas de batería por Bs. 250.00. Retiro express en 15 minutos en el Piso 2.',
      queryPrompt: 'Ver Sony Store y audífonos disponibles',
    },
    {
      id: 'story-xiaomi',
      storeName: 'Xiaomi Store',
      piso: 'Piso 2',
      avatarUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=160&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      title: '📱 Redmi Buds 4 Active',
      tagline: 'Local 208 &middot; Mejor Precio',
      highlightText: 'Los audífonos bluetooth más accesibles del mall por solo Bs. 180.00. Calidad de bajos superior.',
      queryPrompt: 'Comparar audífonos bluetooth en Piso 2',
    },
    {
      id: 'story-burger',
      storeName: 'Burger Craft',
      piso: 'Piso 3',
      avatarUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=160&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      title: '🍔 Hamburguesas Artesanales',
      tagline: 'Local 302 &middot; Mercado Gastronómico',
      highlightText: 'Pan brioche artesanal, doble queso cheddar y carne 100% de res. ¡Pide y retira sin colas en Piso 3!',
      queryPrompt: '¿Qué comer en Piso 3 Mercado Gastronómico?',
    },
    {
      id: 'story-el-cuarto',
      storeName: 'El Cuarto',
      piso: 'Piso 4',
      avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      title: '🍷 Terraza Gourmet & Carnes',
      tagline: 'Piso 4 &middot; Vista Panorámica',
      highlightText: 'Cortes premium a las brasas, tablas de quesos y vinos de altura con la mejor vista de Cochabamba.',
      queryPrompt: 'Restaurantes en Terraza Piso 4',
    },
    {
      id: 'story-games',
      storeName: 'Sky Games',
      piso: 'Piso 3',
      avatarUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&auto=format&fit=crop&q=80',
      title: '🕹️ Arcades & Diversión',
      tagline: 'Local 315 &middot; Ocio Familiar',
      highlightText: 'Simuladores y juegos arcade junto al patio de comidas de Paseo Aranjuez.',
      queryPrompt: '¿Qué locales de juegos hay en Paseo Aranjuez?',
    },
  ];

  // Facebook-Style Feed Posts
  feedPosts = signal<FeedPost[]>([
    {
      id: 'post-1',
      storeName: 'Sony Store Cochabamba',
      piso: 'Piso 2',
      local: 'Local 215',
      avatarUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&auto=format&fit=crop&q=80',
      timeAgo: 'Hace 25 min',
      badge: '🔥 Oferta Tech',
      content: '¿Buscando audífonos bluetooth para entrenar o trabajar? Ven al Piso 2 y llévate los Sony WH-CH520 a solo Bs. 250.00. 🎧\n\nAl retirar en nuestro mostrador con tu código QR obtienes automáticamente 2 horas de parqueo subterráneo gratis.',
      product: {
        id: '10000000-0000-0000-0000-000000000002',
        nombre: 'Audífonos Bluetooth Sony WH-CH520',
        precio: 250.0,
        store_id: 'a0000000-0000-0000-0000-000000000001',
        imagen_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        stock: 14,
      },
      likes: 42,
      isLiked: false,
      queryPrompt: '🎧 Comparar audífonos bluetooth',
    },
    {
      id: 'post-2',
      storeName: 'Burger Craft Aranjuez',
      piso: 'Piso 3',
      local: 'Local 302',
      avatarUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=160&auto=format&fit=crop&q=80',
      timeAgo: 'Hace 1 hora',
      badge: '🍔 Mercado Gastronómico',
      content: '¡Sabor auténtico en el Piso 3! Nuestra Burger Doble Queso y Tocino artesanal ya está lista para retiro express. 🍟🧀 Pídela desde PaseoYa y recógela caliente sin hacer fila.',
      product: {
        id: '10000000-0000-0000-0000-000000000009',
        nombre: 'Hamburguesa Doble Queso & Tocino',
        precio: 45.0,
        store_id: 'a0000000-0000-0000-0000-000000000004',
        imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        stock: 30,
      },
      likes: 67,
      isLiked: true,
      queryPrompt: '🍔 ¿Qué comer en Piso 3?',
    },
    {
      id: 'post-3',
      storeName: 'Terraza Gourmet El Cuarto',
      piso: 'Piso 4',
      local: 'Local 401',
      avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80',
      timeAgo: 'Hace 2 horas',
      badge: '🍷 Terraza Gourmet',
      content: 'Disfruta la tarde en la terraza más exclusiva de Cochabamba. Cortes a la parrilla, tablas de jamón serrano y vinos de altura con vista panorámica. ¡Te esperamos en el Piso 4!',
      likes: 51,
      isLiked: false,
      queryPrompt: '🍷 Restaurantes en Terraza Piso 4',
    },
  ]);

  async ngOnInit(): Promise<void> {
    try {
      const [cats, strList] = await Promise.all([
        this.catalogService.getCategories(),
        this.catalogService.getStores(),
      ]);
      this.categories.set(cats);
      this.stores.set(strList);
    } finally {
      this.loading.set(false);
    }
  }

  openStory(story: MallStory): void {
    this.activeStory.set(story);
  }

  closeStory(): void {
    this.activeStory.set(null);
  }

  handleQuickSearch(): void {
    const text = this.quickSearchText.trim();
    if (!text) return;
    this.quickSearchText = '';
    this.router.navigate(['/cliente/productos'], { queryParams: { q: text } });
  }

  toggleLike(post: FeedPost): void {
    this.feedPosts.update((list) =>
      list.map((p) => {
        if (p.id === post.id) {
          const isLiked = !p.isLiked;
          const likes = isLiked ? p.likes + 1 : p.likes - 1;
          return { ...p, isLiked, likes };
        }
        return p;
      })
    );
  }

  addProductToCart(product: any): void {
    const fullProd: Product = {
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock,
      store_id: product.store_id,
      imagen_url: product.imagen_url,
      activo: true,
    };
    const res = this.cartService.addItem(fullProd);
    if (res.success) {
      this.toastService.show(`"${product.nombre}" agregado al carrito`, 'success');
    } else {
      this.toastService.show(res.message || 'Error al agregar', 'error');
    }
  }
}
