import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/services/catalog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { Product } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StateMessageComponent } from '../../../../shared/ui/state/state-message.component';

@Component({
  selector: 'app-productos-comercio',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, StateMessageComponent],
  template: `
    <div class="space-y-5 pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-black tracking-tight text-slate-900">Catálogo & Stock</h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Gestiona la disponibilidad y precios de tus productos en PaseoYa.
          </p>
        </div>

        <app-button size="md" (clicked)="openCreateModal()">
          + Nuevo Producto
        </app-button>
      </div>

      <!-- Create / Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="font-bold text-base text-slate-900">
                {{ editingProduct() ? 'Editar Producto' : 'Crear Nuevo Producto' }}
              </h3>
              <button type="button" (click)="closeModal()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1" for="prodName">Nombre del Producto</label>
                <input
                  id="prodName"
                  type="text"
                  [(ngModel)]="formData.nombre"
                  name="nombre"
                  required
                  class="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Ej: Audífonos Bluetooth Pro"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1" for="prodDesc">Descripción</label>
                <textarea
                  id="prodDesc"
                  [(ngModel)]="formData.descripcion"
                  name="descripcion"
                  rows="2"
                  class="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Detalles, características y especificaciones"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1" for="prodPrecio">Precio (Bs.)</label>
                  <input
                    id="prodPrecio"
                    type="number"
                    step="0.5"
                    [(ngModel)]="formData.precio"
                    name="precio"
                    required
                    min="0"
                    class="w-full h-11 px-3 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1" for="prodStock">Stock Disponible</label>
                  <input
                    id="prodStock"
                    type="number"
                    [(ngModel)]="formData.stock"
                    name="stock"
                    required
                    min="0"
                    class="w-full h-11 px-3 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1" for="prodImg">URL de Imagen</label>
                <input
                  id="prodImg"
                  type="url"
                  [(ngModel)]="formData.imagen_url"
                  name="imagen_url"
                  class="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="https://..."
                />
              </div>

              <div class="pt-2 flex items-center justify-end gap-2">
                <app-button variant="outline" size="sm" type="button" (clicked)="closeModal()">
                  Cancelar
                </app-button>
                <app-button variant="primary" size="sm" type="submit" [disabled]="!formData.nombre || formData.precio <= 0">
                  Guardar Producto
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Products Table / List -->
      @if (products().length === 0) {
        <app-state-message
          type="empty"
          title="Sin productos registrados"
          message="Comienza agregando los artículos que tu tienda ofrece para retiro en Paseo Aranjuez."
          actionLabel="+ Agregar Primer Producto"
          (actionClicked)="openCreateModal()"
        />
      } @else {
        <div class="space-y-3">
          @for (prod of products(); track prod.id) {
            <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <!-- Info -->
              <div class="flex items-center gap-3.5">
                <img
                  [src]="prod.imagen_url"
                  [alt]="prod.nombre"
                  class="size-16 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          [class]="prod.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'">
                      {{ prod.activo ? 'Activo en Catálogo' : 'Pausado' }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">{{ prod.categoria || 'General' }}</span>
                  </div>
                  <h3 class="text-xs font-bold text-slate-900 line-clamp-1">{{ prod.nombre }}</h3>
                  <div class="flex items-center gap-3 mt-1 text-xs">
                    <span class="font-extrabold text-slate-900 tabular-nums">
                      Bs. {{ prod.precio | number:'1.2-2' }}
                    </span>
                    <span class="text-[11px]" [class]="prod.stock > 0 ? 'text-slate-600' : 'text-red-600 font-bold'">
                      Stock: <strong class="tabular-nums">{{ prod.stock }}</strong> u.
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Inline Actions -->
              <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <!-- Stock Controls -->
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="text-[11px] text-slate-400">Stock:</span>
                  <button
                    type="button"
                    (click)="adjustStock(prod, -1)"
                    [disabled]="prod.stock <= 0"
                    class="size-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span class="w-8 text-center font-mono font-bold tabular-nums text-xs">
                    {{ prod.stock }}
                  </span>
                  <button
                    type="button"
                    (click)="adjustStock(prod, 1)"
                    class="size-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <!-- Active Toggle -->
                <button
                  type="button"
                  (click)="toggleActive(prod)"
                  class="h-8 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer"
                  [class]="prod.activo ? 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'"
                >
                  {{ prod.activo ? 'Pausar' : 'Activar' }}
                </button>

                <!-- Edit Button -->
                <button
                  type="button"
                  (click)="openEditModal(prod)"
                  class="h-8 px-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Editar
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosComercioComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  products = signal<Product[]>([]);
  showModal = signal<boolean>(false);
  editingProduct = signal<Product | null>(null);

  formData = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagen_url: '',
    categoria: 'Audio',
  };

  async ngOnInit(): Promise<void> {
    await this.loadStoreProducts();
  }

  async loadStoreProducts(): Promise<void> {
    const storeId = this.authService.profile()?.store_id || 'a0000000-0000-0000-0000-000000000001';
    const list = await this.catalogService.getProductsByStore(storeId);
    this.products.set(list);
  }

  openCreateModal(): void {
    this.editingProduct.set(null);
    this.formData = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 10,
      imagen_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
      categoria: 'Audio',
    };
    this.showModal.set(true);
  }

  openEditModal(prod: Product): void {
    this.editingProduct.set(prod);
    this.formData = {
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      stock: prod.stock,
      imagen_url: prod.imagen_url || '',
      categoria: prod.categoria || 'Audio',
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async saveProduct(): Promise<void> {
    const storeId = this.authService.profile()?.store_id || 'a0000000-0000-0000-0000-000000000001';
    const editing = this.editingProduct();

    if (editing) {
      await this.catalogService.updateProduct(editing.id, {
        nombre: this.formData.nombre,
        descripcion: this.formData.descripcion,
        precio: Number(this.formData.precio),
        stock: Number(this.formData.stock),
        imagen_url: this.formData.imagen_url,
      });
      this.toastService.success('Producto actualizado exitosamente.');
    } else {
      await this.catalogService.addProduct({
        store_id: storeId,
        nombre: this.formData.nombre,
        descripcion: this.formData.descripcion,
        precio: Number(this.formData.precio),
        stock: Number(this.formData.stock),
        imagen_url: this.formData.imagen_url,
        categoria: this.formData.categoria,
        activo: true,
      });
      this.toastService.success('Nuevo producto agregado al catálogo.');
    }

    this.closeModal();
    await this.loadStoreProducts();
  }

  async adjustStock(prod: Product, delta: number): Promise<void> {
    const newStock = Math.max(0, prod.stock + delta);
    await this.catalogService.updateProduct(prod.id, { stock: newStock });
    this.products.update((list) =>
      list.map((p) => (p.id === prod.id ? { ...p, stock: newStock } : p))
    );
  }

  async toggleActive(prod: Product): Promise<void> {
    const newActive = !prod.activo;
    await this.catalogService.updateProduct(prod.id, { activo: newActive });
    this.products.update((list) =>
      list.map((p) => (p.id === prod.id ? { ...p, activo: newActive } : p))
    );
    this.toastService.info(
      newActive ? `"${prod.nombre}" ahora está activo` : `"${prod.nombre}" fue pausado`
    );
  }
}
