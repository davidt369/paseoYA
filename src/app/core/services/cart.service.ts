import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSignal = signal<CartItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();

  readonly storeId = computed<string | null>(() => {
    const list = this.itemsSignal();
    return list.length > 0 ? list[0].product.store_id : null;
  });

  readonly storeName = computed<string | null>(() => {
    const list = this.itemsSignal();
    return list.length > 0 && list[0].product.tienda ? list[0].product.tienda.nombre : null;
  });

  readonly totalItems = computed<number>(() => {
    return this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });

  readonly subtotal = computed<number>(() => {
    return this.itemsSignal().reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  });

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('PASEO_CART');
      if (saved) {
        this.itemsSignal.set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('PASEO_CART', JSON.stringify(this.itemsSignal()));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }

  addItem(product: Product, quantity = 1): { success: boolean; message?: string } {
    const current = this.itemsSignal();

    // PaseoYa Rule: "Un pedido por tienda"
    if (current.length > 0 && current[0].product.store_id !== product.store_id) {
      return {
        success: false,
        message: 'Tu carrito ya tiene productos de otra tienda. Solo puedes pedir de una tienda por orden para el retiro presencial.',
      };
    }

    const existingIdx = current.findIndex((i) => i.product.id === product.id);
    let updated: CartItem[];

    if (existingIdx > -1) {
      const newQty = current[existingIdx].quantity + quantity;
      if (newQty > product.stock) {
        return {
          success: false,
          message: `Stock insuficiente. Solo hay ${product.stock} disponibles.`,
        };
      }
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
    } else {
      if (quantity > product.stock) {
        return {
          success: false,
          message: `Stock insuficiente. Solo hay ${product.stock} disponibles.`,
        };
      }
      updated = [...current, { product, quantity }];
    }

    this.itemsSignal.set(updated);
    this.saveToStorage();
    return { success: true };
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const current = this.itemsSignal();
    const idx = current.findIndex((i) => i.product.id === productId);
    if (idx > -1) {
      const maxStock = current[idx].product.stock;
      const finalQty = Math.min(quantity, maxStock);
      const updated = [...current];
      updated[idx] = { ...updated[idx], quantity: finalQty };
      this.itemsSignal.set(updated);
      this.saveToStorage();
    }
  }

  removeItem(productId: string): void {
    const updated = this.itemsSignal().filter((i) => i.product.id !== productId);
    this.itemsSignal.set(updated);
    this.saveToStorage();
  }

  clear(): void {
    this.itemsSignal.set([]);
    this.saveToStorage();
  }
}
