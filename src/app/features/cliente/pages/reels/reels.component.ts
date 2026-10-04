import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Product } from '../../../../core/models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

interface MallReel {
  id: string;
  storeName: string;
  piso: string;
  local: string;
  avatarUrl: string;
  mediaUrl: string;
  title: string;
  description: string;
  audioTrack: string;
  likesCount: number;
  isLiked?: boolean;
  sharesCount: number;
  product?: {
    id: string;
    nombre: string;
    precio: number;
    store_id: string;
    imagen_url: string;
    stock: number;
  };
  queryPrompt: string;
}

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6 pb-16">
      
      <!-- Top Reels Header Banner -->
      <div class="bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 size-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 max-w-2xl space-y-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-rose-200 text-xs font-bold uppercase tracking-wider">
              <app-icon name="film" [size]="14" />
              PaseoYa Watch & Reels
            </span>
            <span class="text-xs font-black text-rose-300 bg-rose-950/70 border border-rose-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span class="size-2 rounded-full bg-rose-500 animate-ping"></span>
              En Directo
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Reels y Videos del Centro Comercial
          </h1>
          <p class="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Descubre tendencias en moda, lanzamientos de tecnología, recetas en vivo del Mercado Gastronómico y cortes de autor en la Terraza El Cuarto.
          </p>
        </div>
      </div>

      <!-- Floor Filter Pills -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          @for (f of ['Todos', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4']; track f) {
            <button
              type="button"
              (click)="selectedFloor.set(f)"
              [class]="selectedFloor() === f ? 'bg-slate-900 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
              class="px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer text-xs font-medium active:scale-95"
            >
              @if (f === 'Todos') {
                <app-icon name="fire" [size]="12" />
              }
              {{ f === 'Todos' ? 'Todos los Reels' : f }}
            </button>
          }
        </div>

        <span class="text-xs text-slate-500 font-semibold px-2">
          {{ filteredReels().length }} Videos
        </span>
      </div>

      <!-- Reels Responsive Grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (reel of filteredReels(); track reel.id; let idx = $index) {
          <div class="relative w-full h-[520px] rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl border border-slate-800 hover:border-rose-500/50 hover:shadow-2xl transition-all duration-300 group">
            <!-- Background Image / Media Simulation -->
            <div class="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
              <img
                [src]="reel.mediaUrl"
                [alt]="reel.title"
                class="w-full h-full object-cover opacity-90 scale-100 group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/95"></div>

              <!-- Top Reel Header -->
              <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <div class="flex items-center gap-2.5">
                  <img [src]="reel.avatarUrl" [alt]="reel.storeName" class="size-10 rounded-full border-2 border-white object-cover shadow-md" />
                  <div>
                    <h3 class="font-bold text-xs text-white leading-tight drop-shadow-md">{{ reel.storeName }}</h3>
                    <p class="text-[10px] text-amber-300 font-semibold leading-tight drop-shadow-md">
                      {{ reel.piso }} &middot; {{ reel.local }}
                    </p>
                  </div>
                </div>

                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-slate-200 border border-white/20">
                  Reel #{{ idx + 1 }}
                </span>
              </div>

              <!-- Floating Side Interaction Buttons (Facebook/Instagram Reels style) -->
              <div class="absolute right-3.5 bottom-24 flex flex-col items-center gap-4 z-20">
                <!-- Like Button -->
                <button
                  type="button"
                  (click)="toggleReelLike(reel)"
                  class="btn-press flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div
                    class="size-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors inner-border-subtle"
                    [class]="reel.isLiked ? 'bg-rose-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'"
                  >
                    <svg class="size-6 transition-transform duration-150" [class.scale-125]="reel.isLiked" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <span class="text-[11px] font-bold text-white drop-shadow-md tabular-nums">{{ reel.likesCount }}</span>
                </button>


                <!-- Share Button -->
                <button
                  type="button"
                  (click)="shareReel(reel)"
                  class="btn-press flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div class="size-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md inner-border-subtle">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span class="text-[11px] font-bold text-white drop-shadow-md tabular-nums">{{ reel.sharesCount }}</span>
                </button>
              </div>

              <!-- Bottom Overlay Details -->
              <div class="absolute bottom-4 inset-x-4 pr-16 z-10 space-y-2">
                <h4 class="font-black text-sm sm:text-base text-white leading-snug drop-shadow-md">
                  {{ reel.title }}
                </h4>
                <p class="text-xs text-slate-200 line-clamp-2 leading-relaxed drop-shadow-md">
                  {{ reel.description }}
                </p>

                <!-- Audio tag -->
                <div class="flex items-center gap-1.5 text-[11px] text-amber-300">
                  <app-icon name="music" [size]="12" />
                  <span class="truncate font-medium">{{ reel.audioTrack }}</span>
                </div>

                <!-- Attached Buyable Product Card inside Reel -->
                @if (reel.product) {
                  <div class="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 flex items-center justify-between gap-2.5 mt-2 shadow-xl inner-border-subtle">
                    <img [src]="reel.product.imagen_url" class="size-11 rounded-xl object-cover bg-white shrink-0" />
                    <div class="min-w-0 flex-1">
                      <p class="font-bold text-xs text-white truncate leading-tight">{{ reel.product.nombre }}</p>
                      <p class="text-xs font-black text-amber-400 tabular-nums">Bs. {{ reel.product.precio.toFixed(2) }}</p>
                    </div>
                    <button
                      type="button"
                      (click)="buyProduct(reel.product)"
                      class="btn-press px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer shrink-0 inner-border-subtle"
                    >
                      + Pedir
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReelsComponent {
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  selectedFloor = signal<string>('Todos');

  reels = signal<MallReel[]>([
    {
      id: 'reel-1',
      storeName: 'Sony Store Cochabamba',
      piso: 'Piso 2',
      local: 'Local 215',
      avatarUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      title: '🎧 Probando los Sony WH-CH520 en Piso 2',
      description: 'Sonido envolvente 360 Reality Audio y hasta 50 horas de música ininterrumpida. Disponible hoy para retiro con código QR.',
      audioTrack: 'Sony Soundscape &middot; Original Audio',
      likesCount: 142,
      isLiked: false,
      sharesCount: 38,
      product: {
        id: '10000000-0000-0000-0000-000000000002',
        nombre: 'Audífonos Bluetooth Sony WH-CH520',
        precio: 250.0,
        store_id: 'a0000000-0000-0000-0000-000000000001',
        imagen_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        stock: 14,
      },
      queryPrompt: 'Comparar audífonos bluetooth en Piso 2',
    },
    {
      id: 'reel-2',
      storeName: 'Burger Craft Aranjuez',
      piso: 'Piso 3',
      local: 'Local 302',
      avatarUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=160&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      title: '🍔 Preparando la Bacon Smash Burger al momento',
      description: 'Carne 100% de res smash, queso derretido y panceta ahumada en pan brioche artesanal. En el Mercado Gastronómico de Paseo Aranjuez.',
      audioTrack: 'Burger Beat &middot; Cochabamba Foodies',
      likesCount: 289,
      isLiked: true,
      sharesCount: 76,
      product: {
        id: '10000000-0000-0000-0000-000000000009',
        nombre: 'Hamburguesa Doble Queso & Tocino',
        precio: 45.0,
        store_id: 'a0000000-0000-0000-0000-000000000004',
        imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        stock: 30,
      },
      queryPrompt: '¿Qué comer en Piso 3 Mercado Gastronómico?',
    },
    {
      id: 'reel-3',
      storeName: 'Fuego & Corte Steakhouse',
      piso: 'Piso 4',
      local: 'Local 401',
      avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      title: '🥩 El corte perfecto: Ojo de Bife a la parrilla',
      description: '400 gramos de carne premium madurada a las brasas de quebracho. Degústalo en la Terraza Gourmet El Cuarto con vista panorámica.',
      audioTrack: 'Acoustic Sunset &middot; Terraza El Cuarto',
      likesCount: 310,
      isLiked: false,
      sharesCount: 92,
      product: {
        id: '10000000-0000-0000-0000-000000000015',
        nombre: 'Ojo de Bife a las Brasas (400g)',
        precio: 95.0,
        store_id: 'a0000000-0000-0000-0000-000000000006',
        imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        stock: 12,
      },
      queryPrompt: 'Ver carnes y restaurantes en Piso 4 Terraza El Cuarto',
    },
    {
      id: 'reel-4',
      storeName: 'Xiaomi Mi Store',
      piso: 'Piso 2',
      local: 'Local 208',
      avatarUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=160&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      title: '📱 Unboxing Redmi Buds 4 Active (Bs. 180)',
      description: 'Los audífonos bluetooth más vendidos por relación calidad-precio. Control táctil y resistencia al agua IPX4.',
      audioTrack: 'Xiaomi Tech Beat &middot; Unboxing Trend',
      likesCount: 198,
      isLiked: false,
      sharesCount: 45,
      queryPrompt: '¿Dónde queda Xiaomi Mi Store en Paseo Aranjuez?',
    },
  ]);

  readonly filteredReels = computed(() => {
    const floor = this.selectedFloor();
    if (floor === 'Todos') {
      return this.reels();
    }
    return this.reels().filter((r) => r.piso === floor);
  });

  toggleReelLike(reel: MallReel): void {
    this.reels.update((list) =>
      list.map((r) => {
        if (r.id === reel.id) {
          const isLiked = !r.isLiked;
          const likesCount = isLiked ? r.likesCount + 1 : r.likesCount - 1;
          return { ...r, isLiked, likesCount };
        }
        return r;
      })
    );
  }

  shareReel(reel: MallReel): void {
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        text: `${reel.title} en ${reel.storeName} (${reel.piso}) - Paseo Aranjuez`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      this.toastService.show('Enlace copiado para compartir el Reel', 'info');
    }
  }

  buyProduct(product: any): void {
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
