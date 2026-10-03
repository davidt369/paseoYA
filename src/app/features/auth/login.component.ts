import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-dvh flex flex-col justify-center px-4 py-8 bg-slate-50 safe-top safe-bottom">
      <div class="w-full max-w-sm mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <!-- Brand Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-xl tracking-tight shadow-xs mb-2">
            PY
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">PaseoYa</h1>
          <p class="text-xs text-slate-500 font-medium">Paseo Aranjuez &middot; Cochabamba</p>
        </div>

        <!-- Feedback Alert -->
        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2" role="alert">
            <svg class="size-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5" for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-slate-700" for="password">Contraseña</label>
            </div>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading() || !email || !password"
            class="w-full h-11 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition disabled:opacity-50 touch-target cursor-pointer"
          >
            @if (loading()) {
              <span class="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Ingresando...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>

        <div class="mt-5 text-center text-xs text-slate-500">
          ¿No tienes una cuenta?
          <a routerLink="/auth/register" class="font-bold text-slate-900 hover:underline ml-1">Regístrate</a>
        </div>

        <!-- 1-Tap Demo Switcher (Hackathon Demo) -->
        <div class="mt-6 pt-5 border-t border-slate-200">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Acceso Rápido para Demo (3 Roles)
          </p>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              (click)="quickLogin('cliente')"
              class="h-9 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-lg border border-slate-200 transition text-center px-1"
            >
              👤 Cliente
            </button>
            <button
              type="button"
              (click)="quickLogin('comercio')"
              class="h-9 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 rounded-lg border border-amber-200 transition text-center px-1"
            >
              🏪 Comercio
            </button>
            <button
              type="button"
              (click)="quickLogin('admin')"
              class="h-9 text-[11px] font-medium bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-purple-900 rounded-lg border border-purple-200 transition text-center px-1"
            >
              ⚙️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);

  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      const result = await this.authService.login(this.email, this.password);
      if (result.error) {
        this.errorMessage.set(result.error.message || 'Error al iniciar sesión');
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Error inesperado');
    } finally {
      this.loading.set(false);
    }
  }

  async quickLogin(role: UserRole): Promise<void> {
    this.errorMessage.set(null);
    this.loading.set(true);
    try {
      await this.authService.loginAsDemo(role);
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Error en acceso rápido');
    } finally {
      this.loading.set(false);
    }
  }
}
