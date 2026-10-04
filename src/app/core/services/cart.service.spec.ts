import { describe, it, expect, beforeEach } from 'vitest';
import { CartService } from './cart.service';
import { Product } from '../models';

const mockProductA1: Product = {
  id: 'p-1',
  store_id: 'store-sony-01',
  nombre: 'Audífonos Sony WH-CH520',
  descripcion: 'Bluetooth 50h',
  precio: 250,
  stock: 5,
  activo: true,
};

const mockProductA2: Product = {
  id: 'p-2',
  store_id: 'store-sony-01',
  nombre: 'Parlante Sony XB100',
  descripcion: 'Extra Bass',
  precio: 380,
  stock: 2,
  activo: true,
};

const mockProductB1: Product = {
  id: 'p-3',
  store_id: 'store-burger-02',
  nombre: 'Hamburguesa Doble Queso',
  descripcion: 'Piso 3 Food court',
  precio: 45,
  stock: 10,
  activo: true,
};

describe('CartService — Reglas Críticas de Negocio PaseoYa', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    cart = new CartService();
    cart.clear();
  });

  it('permite agregar un producto y calcula subtotal y cantidad correctamente', () => {
    const res = cart.addItem(mockProductA1, 2);
    expect(res.success).toBe(true);
    expect(cart.totalItems()).toBe(2);
    expect(cart.subtotal()).toBe(500);
    expect(cart.storeId()).toBe('store-sony-01');
  });

  it('cumple la regla monotienda de PaseoYa: impide mezclar productos de tiendas distintas', () => {
    cart.addItem(mockProductA1, 1);
    const res = cart.addItem(mockProductB1, 1);

    expect(res.success).toBe(false);
    expect(res.message).toContain('otra tienda');
    expect(cart.totalItems()).toBe(1);
    expect(cart.subtotal()).toBe(250);
  });

  it('respeta el límite de stock disponible de la tienda', () => {
    const res = cart.addItem(mockProductA1, 10); // stock es 5
    expect(res.success).toBe(false);
    expect(res.message).toContain('Stock insuficiente');
    expect(cart.totalItems()).toBe(0);
  });

  it('actualiza cantidades y recalcula el subtotal acumulado', () => {
    cart.addItem(mockProductA1, 1);
    cart.addItem(mockProductA2, 1);

    expect(cart.totalItems()).toBe(2);
    expect(cart.subtotal()).toBe(630);

    cart.updateQuantity(mockProductA1.id, 3);
    expect(cart.totalItems()).toBe(4);
    expect(cart.subtotal()).toBe(3 * 250 + 380);
  });

  it('elimina un item y limpia el carrito correctamente', () => {
    cart.addItem(mockProductA1, 2);
    expect(cart.items().length).toBe(1);

    cart.removeItem(mockProductA1.id);
    expect(cart.items().length).toBe(0);
    expect(cart.totalItems()).toBe(0);
    expect(cart.subtotal()).toBe(0);
    expect(cart.storeId()).toBe(null);
  });
});
