import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, IconComponent],
  template: `
    <div class="min-h-dvh flex flex-col md:flex-row bg-slate-100 text-slate-900 select-none">
      <app-toast />

      <!-- MOBILE TOP HEADER BAR -->
      <header class="md:hidden bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            PA
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm tracking-tight text-white">Paseo Aranjuez</span>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-900 text-purple-300 border border-purple-700/50">ADMIN</span>
            </div>
            <p class="text-[10px] text-slate-400">Master Control</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="toggleMobileMenu()"
            class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 focus:outline-none"
            aria-label="Abrir menú de navegación"
          >
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (isMobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </header>

      <!-- MOBILE HORIZONTAL QUICK SCROLL TABS -->
      <nav class="md:hidden bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs sticky top-[53px] z-20">
        <a
          routerLink="/admin"
          [routerLinkActiveOptions]="{ exact: true }"
          routerLinkActive="bg-purple-600 text-white font-bold"
          class="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1"
        >
          <app-icon name="chart-bar" [size]="12" />
          <span>Dashboard</span>
        </a>
        <a
          routerLink="/admin/pedidos"
          routerLinkActive="bg-purple-600 text-white font-bold"
          class="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1"
        >
          <app-icon name="package" [size]="12" />
          <span>Supervisión Pedidos</span>
        </a>
        <a
          routerLink="/admin/tiendas"
          routerLinkActive="bg-purple-600 text-white font-bold"
          class="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1"
        >
          <app-icon name="store" [size]="12" />
          <span>Tiendas & Pisos</span>
        </a>
        <a
          routerLink="/admin/usuarios"
          routerLinkActive="bg-purple-600 text-white font-bold"
          class="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1"
        >
          <app-icon name="users" [size]="12" />
          <span>Usuarios & Roles</span>
        </a>
      </nav>

      <!-- MOBILE SLIDE-OUT MENU OVERLAY -->
      @if (isMobileMenuOpen()) {
        <div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" (click)="closeMobileMenu()">
          <div class="w-72 h-full bg-slate-900 text-white p-5 flex flex-col justify-between" (click)="$event.stopPropagation()">
            <div class="space-y-6">
              <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="size-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center">
                    PA
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-white">Paseo Aranjuez</h3>
                    <p class="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Panel de Administración</p>
                  </div>
                </div>
                <button (click)="closeMobileMenu()" class="text-slate-400 hover:text-white p-1 flex items-center justify-center">
                  <app-icon name="x" [size]="18" />
                </button>
              </div>

              <!-- Menu Items Grouped -->
              <div class="space-y-4">
                <div>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">Operaciones & Analítica</span>
                  <div class="mt-1 space-y-1">
                    <a
                      routerLink="/admin"
                      [routerLinkActiveOptions]="{ exact: true }"
                      routerLinkActive="bg-purple-600 text-white font-bold"
                      (click)="closeMobileMenu()"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      <app-icon name="chart-bar" [size]="18" class="text-purple-400" />
                      <div>
                        <div class="font-bold">Dashboard Ejecutivo</div>
                        <div class="text-[10px] text-slate-400">KPIs, ventas y métricas globales</div>
                      </div>
                    </a>
                    <a
                      routerLink="/admin/pedidos"
                      routerLinkActive="bg-purple-600 text-white font-bold"
                      (click)="closeMobileMenu()"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      <app-icon name="package" [size]="18" class="text-purple-400" />
                      <div>
                        <div class="font-bold">Supervisión de Pedidos</div>
                        <div class="text-[10px] text-slate-400">Auditoría en tiempo real y PIN</div>
                      </div>
                    </a>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">Infraestructura & Acceso</span>
                  <div class="mt-1 space-y-1">
                    <a
                      routerLink="/admin/tiendas"
                      routerLinkActive="bg-purple-600 text-white font-bold"
                      (click)="closeMobileMenu()"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      <app-icon name="store" [size]="18" class="text-purple-400" />
                      <div>
                        <div class="font-bold">Tiendas & Locales</div>
                        <div class="text-[10px] text-slate-400">Directorio por Pisos 1 al 4</div>
                      </div>
                    </a>
                    <a
                      routerLink="/admin/usuarios"
                      routerLinkActive="bg-purple-600 text-white font-bold"
                      (click)="closeMobileMenu()"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      <app-icon name="users" [size]="18" class="text-purple-400" />
                      <div>
                        <div class="font-bold">Usuarios & Roles</div>
                        <div class="text-[10px] text-slate-400">Control de permisos y comercios</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Footer Profile -->
            <div class="pt-4 border-t border-slate-800 space-y-3">
              <div class="flex items-center gap-2.5 px-2">
                <div class="size-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-purple-400 text-xs">
                  AD
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-white truncate">{{ authService.profile()?.nombre_completo || 'Administrador' }}</p>
                  <p class="text-[10px] text-slate-400">admin&#64;paseo.bo</p>
                </div>
              </div>
              <button
                type="button"
                (click)="authService.logout()"
                class="w-full py-2 bg-slate-800 hover:bg-rose-900/40 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      }

      <!-- DESKTOP DEDICATED SIDEBAR (Fixed & Structured) -->
      <aside class="hidden md:flex flex-col w-68 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen select-none">
        
        <!-- Brand Header -->
        <div class="p-5 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <img
              src="/logo-blanco.png"
              alt="Paseo Aranjuez"
              class="h-9 w-auto max-w-[130px] object-contain"
            />
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900 text-purple-300 border border-purple-700/60 uppercase">
              Admin
            </span>
          </div>
        </div>

        <!-- Grouped Navigation Links -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          
          <!-- Group 1: Operaciones & KPIs -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3">
              Analítica & Métricas
            </span>
            <div class="space-y-1">
              <a
                routerLink="/admin"
                [routerLinkActiveOptions]="{ exact: true }"
                routerLinkActive="bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <app-icon name="chart-bar" [size]="18" class="text-purple-400 group-hover:scale-110 transition-transform" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs">Dashboard Ejecutivo</div>
                  <div class="text-[10px] opacity-75 font-normal truncate">KPIs, ventas y retiros</div>
                </div>
              </a>

              <a
                routerLink="/admin/pedidos"
                routerLinkActive="bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <app-icon name="package" [size]="18" class="text-purple-400 group-hover:scale-110 transition-transform" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs">Supervisión de Pedidos</div>
                  <div class="text-[10px] opacity-75 font-normal truncate">Auditoría en vivo y PIN</div>
                </div>
              </a>
            </div>
          </div>

          <!-- Group 2: Directorio & Espacios Físicos -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3">
              Infraestructura Física
            </span>
            <div class="space-y-1">
              <a
                routerLink="/admin/tiendas"
                routerLinkActive="bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <app-icon name="store" [size]="18" class="text-purple-400 group-hover:scale-110 transition-transform" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs">Tiendas & Locales</div>
                  <div class="text-[10px] opacity-75 font-normal truncate">Pisos 1, 2, 3 y 4</div>
                </div>
              </a>
            </div>
          </div>

          <!-- Group 3: Seguridad & Usuarios -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3">
              Seguridad & Accesos
            </span>
            <div class="space-y-1">
              <a
                routerLink="/admin/usuarios"
                routerLinkActive="bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition group"
              >
                <app-icon name="users" [size]="18" class="text-purple-400 group-hover:scale-110 transition-transform" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs">Usuarios & Roles</div>
                  <div class="text-[10px] opacity-75 font-normal truncate">Comercios, clientes, admin</div>
                </div>
              </a>
            </div>
          </div>

          <!-- Quick Switcher to test other roles -->
          <div class="pt-2 border-t border-slate-800 space-y-1.5">
            <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3">
              Accesos Rápidos Demo
            </span>
            <a
              routerLink="/cliente"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
            >
              <app-icon name="shopping-bag" [size]="15" />
              <span>Ver App de Clientes</span>
            </a>
            <a
              routerLink="/comercio/pedidos"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
            >
              <app-icon name="camera" [size]="15" />
              <span>Escanear QR de Retiro</span>
            </a>
          </div>
        </nav>

        <!-- Sidebar Footer with User Details & Logout -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/80">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="size-8 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center font-bold text-purple-300 text-xs shrink-0">
                AD
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-white truncate">{{ authService.profile()?.nombre_completo || 'Administrador' }}</p>
                <p class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En línea
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="authService.logout()"
              class="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              title="Cerrar sesión de Administrador"
            >
              <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT VIEW WITH BREADCRUMB HEADER -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Sub-Header Bar (Desktop Breadcrumb & Context) -->
        <div class="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 shadow-2xs">
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-slate-500">Paseo Aranjuez</span>
            <span class="text-slate-300">/</span>
            <span class="font-bold text-purple-700">Administración General</span>
            <span class="text-slate-300">/</span>
            <span class="font-semibold text-slate-800 capitalize">{{ currentSectionName() }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span class="size-2 rounded-full bg-emerald-500"></span>
              Paseo Aranjuez Operativo (Av. América & Pantaleón Dalence)
            </span>
          </div>
        </div>

        <!-- Routed Component Content Area -->
        <main class="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isMobileMenuOpen = signal<boolean>(false);
  currentSectionName = signal<string>('Dashboard General');

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSectionName();
      });
    this.updateSectionName();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  private updateSectionName(): void {
    const url = this.router.url;
    if (url.includes('/admin/pedidos')) {
      this.currentSectionName.set('Supervisión de Pedidos');
    } else if (url.includes('/admin/tiendas')) {
      this.currentSectionName.set('Gestión de Tiendas & Locales');
    } else if (url.includes('/admin/usuarios')) {
      this.currentSectionName.set('Usuarios & Roles');
    } else {
      this.currentSectionName.set('Dashboard Ejecutivo');
    }
  }
}
