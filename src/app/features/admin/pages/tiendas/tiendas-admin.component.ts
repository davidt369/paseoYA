import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Store, Category } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-tiendas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Gestión de Tiendas & Locales
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Directorio comercial y asignación de locales físicos en Paseo Aranjuez.
          </p>
        </div>

        <app-button size="md" (clicked)="openCreateModal()">
          + Agregar Nueva Tienda
        </app-button>
      </div>

      <!-- Floor Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        @for (f of ['Todos', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4']; track f) {
          <button
            type="button"
            (click)="selectedFloor.set(f)"
            [class]="selectedFloor() === f ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-700 border border-slate-200'"
            class="px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer touch-target"
          >
            {{ f }}
          </button>
        }
      </div>

      <!-- Create / Edit Store Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-bold text-base text-slate-900">
                {{ editingStore() ? 'Editar Tienda' : 'Registrar Nueva Tienda en Paseo Aranjuez' }}
              </h3>
              <button type="button" (click)="closeModal()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form (ngSubmit)="saveStore()" class="space-y-3.5 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1" for="storeName">Nombre del Local / Marca</label>
                <input
                  id="storeName"
                  type="text"
                  [(ngModel)]="formData.nombre"
                  name="nombre"
                  required
                  class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Ej: Samsung Experience Store"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1" for="storePiso">Piso</label>
                  <select
                    id="storePiso"
                    [(ngModel)]="formData.piso"
                    name="piso"
                    class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  >
                    <option value="Piso 1">Piso 1 (Moda, Joyería, Belleza)</option>
                    <option value="Piso 2">Piso 2 (Tecnología, Calzado, Deporte)</option>
                    <option value="Piso 3">Piso 3 (Mercado Gastronómico, Juegos)</option>
                    <option value="Piso 4">Piso 4 (Terraza Gourmet El Cuarto)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1" for="storeLocal">Número de Local</label>
                  <input
                    id="storeLocal"
                    type="text"
                    [(ngModel)]="formData.local"
                    name="local"
                    required
                    class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="Ej: Local 204"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1" for="storeRubro">Rubro / Categoría</label>
                  <input
                    id="storeRubro"
                    type="text"
                    [(ngModel)]="formData.rubro"
                    name="rubro"
                    required
                    class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="Ej: Tecnología y Celulares"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1" for="storeSector">Sector / Ala</label>
                  <input
                    id="storeSector"
                    type="text"
                    [(ngModel)]="formData.sector"
                    name="sector"
                    class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="Ej: Plaza Central"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1" for="horarioSemana">Horario Lun-Sáb</label>
                  <input
                    id="horarioSemana"
                    type="text"
                    [(ngModel)]="formData.horario_semana"
                    name="horario_semana"
                    class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="10:00 - 22:00"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1" for="horarioDom">Horario Dom/Feriado</label>
                  <input
                    id="horarioDom"
                    type="text"
                    [(ngModel)]="formData.horario_domingo_feriado"
                    name="horario_domingo_feriado"
                    class="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="12:00 - 22:00"
                  />
                </div>
              </div>

              <div class="pt-2 flex items-center justify-end gap-2">
                <app-button variant="outline" size="sm" type="button" (clicked)="closeModal()">
                  Cancelar
                </app-button>
                <app-button variant="primary" size="sm" type="submit" [disabled]="!formData.nombre || !formData.local">
                  Guardar Tienda
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Stores Table / Cards -->
      <div class="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div class="divide-y divide-slate-100">
          @for (store of filteredStores(); track store.id) {
            <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-3">
                <img
                  [src]="store.logo_url"
                  [alt]="store.nombre"
                  class="size-12 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {{ store.piso }}
                    </span>
                    <span class="text-[10px] font-medium text-slate-500">
                      {{ store.local }}
                    </span>
                    <span class="size-1.5 rounded-full" [class]="store.activo ? 'bg-emerald-500' : 'bg-red-400'"></span>
                  </div>
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ store.nombre }}</h3>
                  <p class="text-[11px] text-slate-500 mt-0.5">{{ store.rubro }} &middot; Horario: {{ store.horario_semana }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="toggleStoreStatus(store)"
                  class="h-8 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer"
                  [class]="store.activo ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'"
                >
                  {{ store.activo ? 'Desactivar' : 'Activar' }}
                </button>

                <button
                  type="button"
                  (click)="openEditModal(store)"
                  class="h-8 px-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Editar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiendasAdminComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private toastService = inject(ToastService);

  stores = signal<Store[]>([]);
  selectedFloor = signal<string>('Todos');
  showModal = signal<boolean>(false);
  editingStore = signal<Store | null>(null);

  formData = {
    nombre: '',
    rubro: 'Tecnología y Celulares',
    piso: 'Piso 2',
    sector: 'Ala Norte',
    local: '',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
  };

  async ngOnInit(): Promise<void> {
    const list = await this.catalogService.getStores();
    this.stores.set(list);
  }

  filteredStores(): Store[] {
    const floor = this.selectedFloor();
    if (floor === 'Todos') return this.stores();
    return this.stores().filter((s) => s.piso === floor);
  }

  openCreateModal(): void {
    this.editingStore.set(null);
    this.formData = {
      nombre: '',
      rubro: 'Tecnología y Celulares',
      piso: 'Piso 2',
      sector: 'Plaza Central',
      local: '',
      horario_semana: '10:00 - 22:00',
      horario_domingo_feriado: '12:00 - 22:00',
    };
    this.showModal.set(true);
  }

  openEditModal(store: Store): void {
    this.editingStore.set(store);
    this.formData = {
      nombre: store.nombre,
      rubro: store.rubro,
      piso: store.piso,
      sector: store.sector || '',
      local: store.local,
      horario_semana: store.horario_semana,
      horario_domingo_feriado: store.horario_domingo_feriado,
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async saveStore(): Promise<void> {
    const editing = this.editingStore();
    if (editing) {
      await this.catalogService.updateStore(editing.id, this.formData);
      this.stores.set(this.catalogService.stores());
      this.toastService.success(`Tienda "${this.formData.nombre}" actualizada.`);
    } else {
      const newStore = await this.catalogService.addStore(this.formData);
      this.stores.set(this.catalogService.stores());
      this.toastService.success(`Tienda "${newStore.nombre}" registrada.`);
    }

    this.closeModal();
  }

  async toggleStoreStatus(store: Store): Promise<void> {
    const updated = !store.activo;
    await this.catalogService.updateStore(store.id, { activo: updated });
    this.stores.set(this.catalogService.stores());
    this.toastService.info(
      updated ? `"${store.nombre}" fue activada` : `"${store.nombre}" fue desactivada temporalmente`
    );
  }
}
