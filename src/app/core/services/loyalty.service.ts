import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { LoyaltyAccount, PointTransaction, PointActivityType } from '../models';

const STORAGE_PREFIX = 'PASEO_LOYALTY_';

// Reglas de negocio del sistema de fidelización PaseoYa:
// 1. Tasa de conversión: 10 Puntos = 1 Bs de descuento.
// 2. Margen de descuento: Hasta el 10% del total de los productos de cada compra.
// 3. Ganancia de puntos:
//    - Compras: 1 punto por cada 1 Bs gastado.
//    - Código Referido usado por amigo: 100 puntos de bienvenida para ambos.
//    - Interacciones:
//      * Dar like a publicación / story / reel: 5 puntos
//      * Preguntar al asistente IA: 10 puntos
//      * Compartir catálogo: 15 puntos
export const POINTS_PER_BOLIVIANO_DISCOUNT = 10; // 10 pts = 1 Bs
export const MAX_DISCOUNT_PERCENTAGE = 0.10; // Máximo 10% por compra

@Injectable({
  providedIn: 'root',
})
export class LoyaltyService {
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  readonly account = signal<LoyaltyAccount>({
    cliente_id: 'default',
    puntos_totales: 150, // Puntos iniciales de bienvenida demo
    codigo_referido: 'PASEO-777',
    total_referidos: 0,
    historial: [
      {
        id: 'tx-welcome',
        cliente_id: 'default',
        puntos: 150,
        tipo: 'referido_canjeado',
        descripcion: 'Bono de bienvenida PaseoYa Club',
        created_at: new Date().toISOString(),
      },
    ],
  });

  readonly totalPoints = computed<number>(() => this.account().puntos_totales);
  readonly referralCode = computed<string>(() => this.account().codigo_referido);
  readonly totalReferrals = computed<number>(() => this.account().total_referidos);
  readonly history = computed<PointTransaction[]>(() => this.account().historial);

  // Equivalente en dinero (Bs.) disponible en puntos
  readonly availableBolivianos = computed<number>(() => {
    return Math.floor(this.totalPoints() / POINTS_PER_BOLIVIANO_DISCOUNT);
  });

  constructor() {
    this.loadAccount();
  }

  private getStorageKey(): string {
    const userId = this.authService.user()?.id || this.authService.profile()?.id || 'demo_guest';
    return `${STORAGE_PREFIX}${userId}`;
  }

  loadAccount(): void {
    const key = this.getStorageKey();
    const userId = this.authService.user()?.id || this.authService.profile()?.id || 'demo_guest';
    const userName = this.authService.profile()?.nombre_completo || 'PASEO';
    const generatedRef = (userName.replace(/\s+/g, '').substring(0, 5).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900));

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.account.set(parsed);
        return;
      }
    } catch (e) {
      console.warn('Error loading loyalty storage:', e);
    }

    // Default new account with starting welcome bonus
    const initial: LoyaltyAccount = {
      cliente_id: userId,
      puntos_totales: 150,
      codigo_referido: generatedRef,
      total_referidos: 0,
      historial: [
        {
          id: 'tx-' + Date.now(),
          cliente_id: userId,
          puntos: 150,
          tipo: 'referido_canjeado',
          descripcion: 'Bono de bienvenida PaseoYa Club (Puntos de fidelidad)',
          created_at: new Date().toISOString(),
        },
      ],
    };

    this.account.set(initial);
    this.saveAccount();
  }

  private saveAccount(): void {
    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(this.account()));
    } catch (e) {
      console.warn('Error saving loyalty storage:', e);
    }
  }

  /**
   * Calcula el descuento máximo permitido (hasta 10% del subtotal) y cuántos puntos se requieren
   */
  calculateDiscount(subtotal: number): {
    maxDiscountBs: number;
    maxPointsUsable: number;
    appliedDiscountBs: number;
    pointsNeeded: number;
  } {
    if (subtotal <= 0) {
      return { maxDiscountBs: 0, maxPointsUsable: 0, appliedDiscountBs: 0, pointsNeeded: 0 };
    }

    // Margen del 10% como máximo por producto / compra
    const maxDiscountBs = Number((subtotal * MAX_DISCOUNT_PERCENTAGE).toFixed(2));
    const maxPointsUsable = Math.floor(maxDiscountBs * POINTS_PER_BOLIVIANO_DISCOUNT);

    // Lo que el cliente realmente puede cubrir con su saldo de puntos
    const currentPts = this.totalPoints();
    const pointsNeeded = Math.min(currentPts, maxPointsUsable);
    const appliedDiscountBs = Number((pointsNeeded / POINTS_PER_BOLIVIANO_DISCOUNT).toFixed(2));

    return {
      maxDiscountBs,
      maxPointsUsable,
      appliedDiscountBs,
      pointsNeeded,
    };
  }

  /**
   * Otorga puntos por interacción con la plataforma (likes, stories, reels, consultas IA)
   */
  addInteractionPoints(tipo: PointActivityType, puntos: number, descripcion: string, showToast = true): void {
    const current = this.account();
    const newTx: PointTransaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      cliente_id: current.cliente_id,
      puntos,
      tipo,
      descripcion,
      created_at: new Date().toISOString(),
    };

    const updated: LoyaltyAccount = {
      ...current,
      puntos_totales: current.puntos_totales + puntos,
      historial: [newTx, ...current.historial],
    };

    this.account.set(updated);
    this.saveAccount();

    if (showToast) {
      this.toast.success(`¡+${puntos} Puntos ganados! ${descripcion}`);
    }
  }

  /**
   * Otorga puntos al completar una compra (1 punto por Bs gastado)
   */
  addPurchasePoints(orderId: string, totalBs: number): void {
    const earned = Math.max(5, Math.floor(totalBs));
    const current = this.account();
    const newTx: PointTransaction = {
      id: 'tx-' + Date.now(),
      cliente_id: current.cliente_id,
      puntos: earned,
      tipo: 'compra',
      descripcion: `Puntos ganados por compra #${orderId.substring(0, 8)}`,
      order_id: orderId,
      created_at: new Date().toISOString(),
    };

    const updated: LoyaltyAccount = {
      ...current,
      puntos_totales: current.puntos_totales + earned,
      historial: [newTx, ...current.historial],
    };

    this.account.set(updated);
    this.saveAccount();
    this.toast.success(`¡Sumaste +${earned} puntos por tu compra en el Paseo!`);
  }

  /**
   * Canjea puntos para aplicar descuento en el checkout
   */
  redeemPoints(pointsToRedeem: number, orderId?: string): boolean {
    const current = this.account();
    if (pointsToRedeem <= 0 || current.puntos_totales < pointsToRedeem) {
      return false;
    }

    const discountBs = (pointsToRedeem / POINTS_PER_BOLIVIANO_DISCOUNT).toFixed(2);
    const newTx: PointTransaction = {
      id: 'tx-' + Date.now(),
      cliente_id: current.cliente_id,
      puntos: -pointsToRedeem,
      tipo: 'descuento_aplicado',
      descripcion: `Descuento de Bs. ${discountBs} (10% max) en pedido`,
      order_id: orderId,
      created_at: new Date().toISOString(),
    };

    const updated: LoyaltyAccount = {
      ...current,
      puntos_totales: current.puntos_totales - pointsToRedeem,
      historial: [newTx, ...current.historial],
    };

    this.account.set(updated);
    this.saveAccount();
    return true;
  }

  /**
   * Canjear un código de referido de un amigo
   */
  applyReferralCode(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const current = this.account();

    if (!cleanCode) {
      return { success: false, message: 'Ingresa un código de referido válido.' };
    }

    if (cleanCode === current.codigo_referido.toUpperCase()) {
      return { success: false, message: 'No puedes usar tu propio código de referido.' };
    }

    // Verificar si ya canjeó antes este código
    const alreadyUsed = current.historial.some(
      (tx) => tx.tipo === 'referido_canjeado' && tx.descripcion.includes(cleanCode)
    );
    if (alreadyUsed) {
      return { success: false, message: 'Ya has utilizado este código de referido anteriormente.' };
    }

    // Otorga 100 puntos al usuario actual
    const bonus = 100;
    const newTx: PointTransaction = {
      id: 'tx-' + Date.now(),
      cliente_id: current.cliente_id,
      puntos: bonus,
      tipo: 'referido_canjeado',
      descripcion: `Bono por código referido de amigo: ${cleanCode}`,
      created_at: new Date().toISOString(),
    };

    const updated: LoyaltyAccount = {
      ...current,
      puntos_totales: current.puntos_totales + bonus,
      total_referidos: current.total_referidos + 1,
      historial: [newTx, ...current.historial],
    };

    this.account.set(updated);
    this.saveAccount();
    this.toast.success(`¡Código ${cleanCode} canjeado con éxito! Recibiste +${bonus} puntos.`);

    return {
      success: true,
      message: `¡Código válido! Recibiste ${bonus} puntos de fidelidad.`,
    };
  }
}
