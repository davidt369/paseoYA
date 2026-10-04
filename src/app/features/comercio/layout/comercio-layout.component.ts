import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';

@Component({
  selector: 'app-comercio-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="min-h-dvh flex bg-slate-100 text-slate-900 select-none">
      <app-toast />

      <!-- Sidebar Desktop & Collapsible Mobile Overlay -->
      <aside
        [class.translate-x-0]="isSidebarOpen()"
        [class.-translate-x-full]="!isSidebarOpen()"
        class="fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-xl md:shadow-none"
      >
        <div>
          <!-- Header Branding -->
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img
                src="/logo-blanco.png"
                alt="Paseo Aranjuez"
                class="h-9 w-auto max-w-[130px] object-contain"
              />
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">
                Comercio
              </span>
            </div>
            <button
              type="button"
              (click)="toggleSidebar()"
              class="md:hidden text-slate-400 hover:text-white p-1"
              aria-label="Cerrar panel"
            >
              ✕
            </button>
          </div>

          <!-- Store Info Pill -->
          <div class="mx-4 my-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p class="text-xs font-bold text-slate-200 truncate">
                {{ authService.profile()?.nombre_completo || 'Comercio Asociado' }}
              </p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Piso 2 &middot; Local L-215</p>
          </div>

          <!-- Navigation Links -->
          <nav class="px-3 space-y-1">
            <a
              routerLink="/comercio"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-slate-800 text-amber-400 font-bold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition touch-target"
            >
              <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Bandeja de Pedidos</span>
            </a>

            <a
              routerLink="/comercio/validar"
              routerLinkActive="bg-slate-800 text-amber-400 font-bold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition touch-target"
            >
              <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Escanear QR de Retiro</span>
            </a>

            <a
              routerLink="/comercio/productos"
              routerLinkActive="bg-slate-800 text-amber-400 font-bold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition touch-target"
            >
              <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Mis Productos & Stock</span>
            </a>

            <a
              routerLink="/comercio/ventas"
              routerLinkActive="bg-slate-800 text-amber-400 font-bold"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition touch-target"
            >
              <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Resumen de Ventas</span>
            </a>
          </nav>
        </div>

        <!-- Footer / Logout -->
        <div class="p-4 border-t border-slate-800">
          <button
            type="button"
            (click)="authService.logout()"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer touch-target"
          >
            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top bar for mobile menu toggle -->
        <header class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between md:hidden">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="toggleSidebar()"
              class="p-2 text-slate-700 hover:bg-slate-100 rounded-lg touch-target"
              aria-label="Abrir menú"
            >
              <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span class="font-bold text-sm text-slate-900">Panel Comercio</span>
          </div>
          <span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">Piso 2</span>
        </header>

        <main class="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComercioLayoutComponent {
  authService = inject(AuthService);
  isSidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update((val) => !val);
  }

  closeSidebarOnMobile(): void {
    this.isSidebarOpen.set(false);
  }
}
