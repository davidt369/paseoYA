import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AuthService, DEMO_USERS } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Profile, UserRole, Category } from '../../../../core/models';
@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-xl md:text-2xl font-black tracking-tight text-slate-900">
          Usuarios, Roles & Categorías
        </h1>
        <p class="text-xs text-slate-500">
          Administración de cuentas con acceso al sistema y taxonomía de Paseo Aranjuez.
        </p>
      </div>

      <!-- Users Section -->
      <section class="space-y-3">
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
          Usuarios Registrados en el Sistema
        </h2>

        <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div class="divide-y divide-slate-100">
            @for (u of users(); track u.id) {
              <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 text-sm">{{ u.nombre_completo }}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                          [class]="getRoleBadgeClasses(u.rol)">
                      {{ u.rol }}
                    </span>
                  </div>
                  <p class="text-slate-500">{{ u.email }} &middot; Cel: {{ u.telefono || 'No registrado' }}</p>
                  @if (u.store_id) {
                    <p class="text-[11px] text-amber-700 font-semibold">
                      🏪 Vinculado a: {{ getStoreName(u.store_id) }}
                    </p>
                  }
                </div>

                <!-- Role Switcher -->
                <div class="flex items-center gap-2">
                  <label class="text-[11px] text-slate-400 font-medium" [for]="'roleSelect-' + u.id">Rol:</label>
                  <select
                    [id]="'roleSelect-' + u.id"
                    [ngModel]="u.rol"
                    (ngModelChange)="changeUserRole(u, $event)"
                    class="h-8 px-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="comercio">Comercio</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="space-y-3 pt-4 border-t border-slate-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-black uppercase tracking-wider text-slate-500">
            Rubros y Categorías del Centro Comercial
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (cat of categories(); track cat.id) {
            <div class="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <span class="text-2xl">{{ cat.icono }}</span>
              <div class="min-w-0">
                <h3 class="text-xs font-bold text-slate-900 truncate">{{ cat.nombre }}</h3>
                <p class="text-[10px] text-slate-500 line-clamp-1">{{ cat.descripcion }}</p>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosAdminComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private toastService = inject(ToastService);

  users = signal<Profile[]>([]);
  categories = signal<Category[]>([]);

  ngOnInit(): void {
    // Populate demo user accounts list
    const list: Profile[] = Object.values(DEMO_USERS).map((d) => d.profile);
    this.users.set(list);
    this.categories.set(this.catalogService.categories());
  }

  getRoleBadgeClasses(rol: UserRole): string {
    switch (rol) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'comercio':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      case 'cliente':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  getStoreName(storeId: string): string {
    const s = this.catalogService.stores().find((st) => st.id === storeId);
    return s ? `${s.nombre} (${s.piso}, ${s.local})` : 'Local Asociado';
  }

  changeUserRole(u: Profile, newRole: UserRole): void {
    this.users.update((list) =>
      list.map((item) => (item.id === u.id ? { ...item, rol: newRole } : item))
    );
    this.toastService.success(`Rol de ${u.nombre_completo} actualizado a: ${newRole}`);
  }
}
