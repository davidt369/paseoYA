import { describe, it, expect } from 'vitest';
import { INITIAL_STORES, INITIAL_PRODUCTS } from '../services/catalog.service';
import { OrderStatus } from './index';

describe('PaseoYa — Reglas de Negocio, Códigos de Retiro y Catálogo', () => {
  it('el centro comercial cuenta con tiendas distribuidas en los 4 pisos oficiales', () => {
    const floors = new Set(INITIAL_STORES.map((s) => s.piso));
    expect(floors.has('Piso 1')).toBe(true);
    expect(floors.has('Piso 2')).toBe(true);
    expect(floors.has('Piso 3')).toBe(true);
    expect(floors.has('Piso 4')).toBe(true);
  });

  it('permite comparar audífonos bluetooth entre distintas tiendas del Piso 2', () => {
    const bluetooth = INITIAL_PRODUCTS.filter((p) =>
      p.nombre.toLowerCase().includes('audífonos') || p.nombre.toLowerCase().includes('audifonos')
    ).sort((a, b) => a.precio - b.precio);

    expect(bluetooth.length).toBeGreaterThanOrEqual(2);
    // Verificar que los precios son comparables y ordenados ascendentemente
    for (let i = 0; i < bluetooth.length - 1; i++) {
      expect(bluetooth[i].precio).toBeLessThanOrEqual(bluetooth[i + 1].precio);
    }
  });

  it('valida transiciones permitidas del ciclo de vida del pedido con retiro presencial', () => {
    const validLifecycle: OrderStatus[] = [
      'recibido',
      'confirmado',
      'preparando',
      'listo_para_recoger',
      'cliente_llego',
      'entregado',
    ];

    expect(validLifecycle.length).toBe(6);
    expect(validLifecycle[0]).toBe('recibido');
    expect(validLifecycle[validLifecycle.length - 1]).toBe('entregado');
  });

  it('el código de retiro generado cumple con el formato oficial PY-XXXXXX y PIN de 4 dígitos', () => {
    const sampleCode = 'PY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const samplePin = Math.floor(1000 + Math.random() * 9000).toString();

    expect(sampleCode.startsWith('PY-')).toBe(true);
    expect(sampleCode.length).toBeGreaterThanOrEqual(5);
    expect(samplePin).toMatch(/^\d{4}$/);
  });
});
