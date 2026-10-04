import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-dvh flex flex-col justify-center px-4 py-8 bg-slate-50 safe-top safe-bottom">
      <div class="w-full max-w-sm mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center size-11 rounded-xl bg-slate-900 text-white font-black text-lg mb-2">
            PY
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Crear Cuenta</h1>
          <p class="text-xs text-slate-500 font-medium">Marketplace Oficial &middot; Paseo Aranjuez</p>
        </div>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2" role="alert">
            <svg class="size-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        @if (successMessage()) {
          <div class="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2" role="alert">
            <svg class="size-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ successMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1" for="name">Nombre y Apellido</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="nombreCompleto"
              name="nombreCompleto"
              required
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              placeholder="Ej. Roberto Morales"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1" for="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1" for="telefono">WhatsApp / Celular</label>
            <input
              id="telefono"
              type="tel"
              [(ngModel)]="telefono"
              name="telefono"
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              placeholder="Ej. 76400000"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1" for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1" for="rol">Rol de Cuenta</label>
            <select
              id="rol"
              [(ngModel)]="rol"
              name="rol"
              class="w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            >
              <option value="cliente">Cliente (Comprar y retirar con QR)</option>
              <option value="comercio">Comercio (Tienda de Paseo Aranjuez)</option>
              <option value="admin">Administrador (Gestión general del Paseo)</option>
            </select>
          </div>

          <button
            type="submit"
            [disabled]="loading() || !email || !password || !nombreCompleto"
            class="w-full h-11 mt-1 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition disabled:opacity-50 touch-target cursor-pointer"
          >
            @if (loading()) {
              <span class="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Registrando...
            } @else {
              Registrarme
            }
          </button>
        </form>

        <div class="mt-5 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="font-bold text-slate-900 hover:underline ml-1">Inicia sesión</a>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  nombreCompleto = '';
  email = '';
  telefono = '';
  password = '';
  rol: UserRole = 'cliente';

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loading = signal<boolean>(false);

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    try {
      const result = await this.authService.register(
        this.email,
        this.password,
        this.nombreCompleto,
        this.rol,
        this.telefono
      );

      if (result.error) {
        this.errorMessage.set(result.error.message || 'Error al registrar usuario');
      } else {
        this.successMessage.set('Cuenta creada exitosamente. Redirigiendo...');
        setTimeout(() => {
          this.authService.redirectByRole(this.rol);
        }, 1000);
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Error inesperado');
    } finally {
      this.loading.set(false);
    }
  }
}
