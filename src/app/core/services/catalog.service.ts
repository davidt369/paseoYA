import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Category, Store, Product, Order, OrderStatus } from '../models';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-tec', nombre: 'Tecnología y Celulares', descripcion: 'Smartphones, audio, laptops y accesorios', icono: '🎧', orden: 1 },
  { id: 'cat-gas', nombre: 'Mercado Gastronómico', descripcion: 'Comida rápida, tradicional y cafeterías en Piso 3', icono: '🍔', orden: 2 },
  { id: 'cat-ter', nombre: 'Terraza Gourmet El Cuarto', descripcion: 'Restaurantes de autor y carnes premium en Piso 4', icono: '🍷', orden: 3 },
  { id: 'cat-mod', nombre: 'Moda y Ropa Exclusiva', descripcion: 'Tendencias urbanas, alta costura y casual', icono: '👗', orden: 4 },
  { id: 'cat-cal', nombre: 'Calzado y Marroquinería', descripcion: 'Zapatos de diseñador, cuero y sneakers', icono: '👟', orden: 5 },
  { id: 'cat-joy', nombre: 'Joyería y Relojes', descripcion: 'Plata, oro y accesorios de prestigio en Piso 1', icono: '💍', orden: 6 },
  { id: 'cat-gam', nombre: 'Sky Games y Ocio', descripcion: 'Entretenimiento familiar y arcades en Piso 3', icono: '🕹️', orden: 7 },
];

export const INITIAL_STORES: Store[] = [
  // Piso 2 - Tecnología (3 tiendas con Audífonos Bluetooth para comparación)
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'cat-tec',
    nombre: 'Sony Store Cochabamba',
    rubro: 'Tecnología y Celulares',
    piso: 'Piso 2',
    sector: 'Ala Norte',
    local: 'Local 215',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '71798765',
    logo_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    category_id: 'cat-tec',
    nombre: 'Xiaomi Mi Store Aranjuez',
    rubro: 'Tecnología y Celulares',
    piso: 'Piso 2',
    sector: 'Plaza Central',
    local: 'Local 208',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '72234567',
    logo_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    category_id: 'cat-tec',
    nombre: 'iShop Apple Authorized Reseller',
    rubro: 'Tecnología y Celulares',
    piso: 'Piso 2',
    sector: 'Ala Sur',
    local: 'Local 222',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '73345678',
    logo_url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  // Piso 3 - Mercado Gastronómico
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    category_id: 'cat-gas',
    nombre: 'Burger Craft Aranjuez',
    rubro: 'Mercado Gastronómico',
    piso: 'Piso 3',
    sector: 'Food Court Central',
    local: 'Local 302',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '74456789',
    logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    category_id: 'cat-gas',
    nombre: 'Café & Dulces Gourmet',
    rubro: 'Mercado Gastronómico',
    piso: 'Piso 3',
    sector: 'Isla Gastronómica',
    local: 'Isla 310',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '75567890',
    logo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    category_id: 'cat-gas',
    nombre: 'Tradición Valluna',
    rubro: 'Mercado Gastronómico',
    piso: 'Piso 3',
    sector: 'Food Court Central',
    local: 'Local 306',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '76678901',
    logo_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  // Piso 4 - Terraza Gourmet "El Cuarto"
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    category_id: 'cat-ter',
    nombre: 'Fuego & Corte Steakhouse',
    rubro: 'Terraza Gourmet El Cuarto',
    piso: 'Piso 4',
    sector: 'Terraza Panorámica',
    local: 'Local 401',
    horario_semana: '12:00 - 23:00',
    horario_domingo_feriado: '12:00 - 23:00',
    telefono: '77789012',
    logo_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
  // Piso 1 - Moda & Joyería
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    category_id: 'cat-mod',
    nombre: 'Boutique Aranjuez Chic',
    rubro: 'Moda y Ropa Exclusiva',
    piso: 'Piso 1',
    sector: 'Hall Principal',
    local: 'Local 104',
    horario_semana: '10:00 - 22:00',
    horario_domingo_feriado: '12:00 - 22:00',
    telefono: '78890123',
    logo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=160&auto=format&fit=crop&q=80',
    portada_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&auto=format&fit=crop&q=80',
    activo: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Audífonos Bluetooth en Piso 2 - Tienda 1: Sony Store (Bs. 250)
  {
    id: 'p-sony-01',
    store_id: 'a0000000-0000-0000-0000-000000000001',
    nombre: 'Audífonos Bluetooth Sony WH-CH520',
    descripcion: 'Batería de 50 horas, carga rápida, sonido nítido con DSEE y conexión multipunto.',
    precio: 250,
    stock: 12,
    imagen_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    categoria: 'Audio',
    activo: true,
  },
  {
    id: 'p-sony-02',
    store_id: 'a0000000-0000-0000-0000-000000000001',
    nombre: 'Parlante Inalámbrico Sony SRS-XB100',
    descripcion: 'Compacto, resistente al agua y polvo IP67, bajos potentes Sound Diffusion Processor.',
    precio: 380,
    stock: 8,
    imagen_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80',
    categoria: 'Audio',
    activo: true,
  },
  // Audífonos Bluetooth en Piso 2 - Tienda 2: Xiaomi (Bs. 180)
  {
    id: 'p-xiaomi-01',
    store_id: 'a0000000-0000-0000-0000-000000000002',
    nombre: 'Audífonos Bluetooth Xiaomi Redmi Buds 4 Active',
    descripcion: 'Driver dinámico de 12 mm, cancelación de ruido para llamadas y Bluetooth 5.3.',
    precio: 180,
    stock: 25,
    imagen_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    categoria: 'Audio',
    activo: true,
  },
  {
    id: 'p-xiaomi-02',
    store_id: 'a0000000-0000-0000-0000-000000000002',
    nombre: 'Smartwatch Xiaomi Redmi Watch 3 Active',
    descripcion: 'Pantalla LCD de 1.83", más de 100 modos deportivos, llamadas Bluetooth.',
    precio: 290,
    stock: 14,
    imagen_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=80',
    categoria: 'Wearables',
    activo: true,
  },
  // Audífonos Bluetooth en Piso 2 - Tienda 3: iShop (Bs. 320)
  {
    id: 'p-ishop-01',
    store_id: 'a0000000-0000-0000-0000-000000000003',
    nombre: 'Audífonos Bluetooth Beats Flex Wireless',
    descripcion: 'Chip Apple W1, hasta 12 horas de audio continuo, controles integrados y cable antienredos.',
    precio: 320,
    stock: 10,
    imagen_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
    categoria: 'Audio',
    activo: true,
  },
  // Gastronomía Piso 3 - Burger Craft
  {
    id: 'p-burg-01',
    store_id: 'a0000000-0000-0000-0000-000000000004',
    nombre: 'Hamburguesa Doble Queso Aranjuez Burger',
    descripcion: 'Doble medallón 200g de carne de res, queso cheddar fundido, tocino crocante y papas rústicas.',
    precio: 45,
    stock: 40,
    imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    categoria: 'Hamburguesas',
    activo: true,
  },
  {
    id: 'p-burg-02',
    store_id: 'a0000000-0000-0000-0000-000000000004',
    nombre: 'Combo Smash Bacon Clásica',
    descripcion: 'Hamburguesa smash, cebolla caramelizada, salsa especial de la casa + gaseosa fría.',
    precio: 38,
    stock: 35,
    imagen_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    categoria: 'Hamburguesas',
    activo: true,
  },
  // Bebidas y Café Piso 3
  {
    id: 'p-caf-01',
    store_id: 'a0000000-0000-0000-0000-000000000005',
    nombre: 'Iced Caramel Macchiato 16oz',
    descripcion: 'Espresso selecto de altura, leche cremosa fría y sirope de caramelo artesanal.',
    precio: 22,
    stock: 50,
    imagen_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    categoria: 'Bebidas',
    activo: true,
  },
  {
    id: 'p-caf-02',
    store_id: 'a0000000-0000-0000-0000-000000000005',
    nombre: 'Limonada de Frutos Rojos',
    descripcion: 'Refrescante limonada natural con macerado de arándanos y frutillas frescas.',
    precio: 16,
    stock: 60,
    imagen_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    categoria: 'Bebidas',
    activo: true,
  },
  // Tradición Valluna Piso 3
  {
    id: 'p-trad-01',
    store_id: 'a0000000-0000-0000-0000-000000000006',
    nombre: 'Pique Macho Especial Cochabambino',
    descripcion: 'Lomo tierno saltado con salchichas, huevo duro, papas fritas y rodajas de locoto.',
    precio: 52,
    stock: 30,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    categoria: 'Comida Tradicional',
    activo: true,
  },
  // Terraza Piso 4 - Fuego & Corte
  {
    id: 'p-fuego-01',
    store_id: 'a0000000-0000-0000-0000-000000000007',
    nombre: 'Ojo de Bife Premium 400g',
    descripcion: 'Corte madurado a las brasas de quebracho, servido con puré trufado y vegetales grillados.',
    precio: 95,
    stock: 20,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    categoria: 'Carnes Premium',
    activo: true,
  },
  // Moda Piso 1
  {
    id: 'p-moda-01',
    store_id: 'a0000000-0000-0000-0000-000000000008',
    nombre: 'Camisa Lino Premium Unisex',
    descripcion: '100% lino natural, corte relajado, fresca y elegante para el clima de Cochabamba.',
    precio: 195,
    stock: 15,
    imagen_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80',
    categoria: 'Moda',
    activo: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private supabase = inject(SupabaseService);
  private authService = inject(AuthService);

  // In-memory signals to ensure instantaneous reactive state
  readonly categories = signal<Category[]>(INITIAL_CATEGORIES);
  readonly stores = signal<Store[]>(INITIAL_STORES);
  readonly products = signal<Product[]>(INITIAL_PRODUCTS);
  readonly orders = signal<Order[]>([]);

  constructor() {
    this.hydrateStoresWithTienda();
    this.loadOrdersFromStorage();
    this.loadOrders();
    this.initOrdersRealtime();
  }

  private hydrateStoresWithTienda(): void {
    const storeMap = new Map(INITIAL_STORES.map((s) => [s.id, s]));
    const hydrated = this.products().map((p) => ({
      ...p,
      tienda: storeMap.get(p.store_id),
    }));
    this.products.set(hydrated);
  }

  private loadOrdersFromStorage(): void {
    try {
      const saved = localStorage.getItem('PASEO_ORDERS');
      if (saved) {
        this.orders.set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading stored orders:', e);
    }
  }

  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem('PASEO_ORDERS', JSON.stringify(this.orders()));
    } catch (e) {
      console.warn('Error saving orders:', e);
    }
  }

  /**
   * Fetches real orders from Supabase database with joined store, profile and item details,
   * merging with local orders.
   */
  async loadOrders(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*, tienda:stores(*), cliente:profiles(*), items:order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const storeMap = new Map(this.stores().map((s) => [s.id, s]));
        const mappedOrders: Order[] = data.map((d: any) => ({
          id: d.id,
          cliente_id: d.cliente_id,
          store_id: d.store_id,
          estado: d.estado as OrderStatus,
          total: Number(d.total),
          pickup_code: d.pickup_code,
          pin_seguridad: d.pin_seguridad,
          ventana_retiro: d.ventana_retiro,
          nota: d.nota,
          created_at: d.created_at,
          updated_at: d.updated_at,
          tienda: d.tienda || storeMap.get(d.store_id),
          cliente: d.cliente,
          items: (d.items || []).map((it: any) => ({
            product_id: it.product_id,
            nombre_producto: it.nombre_producto,
            precio_unitario: Number(it.precio_unitario),
            cantidad: Number(it.cantidad),
            subtotal: Number(it.subtotal),
          })),
        }));

        const serverIds = new Set(mappedOrders.map((o) => o.id));
        const localOnly = this.orders().filter((o) => !serverIds.has(o.id));
        const merged = [...mappedOrders, ...localOnly];
        this.orders.set(merged);
        this.saveOrdersToStorage();
        return merged;
      }
    } catch (e) {
      console.warn('Error loading orders from Supabase:', e);
    }
    return this.orders();
  }

  private initOrdersRealtime(): void {
    try {
      this.supabase
        .channel('catalog-orders-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            this.loadOrders();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime catalog orders sync fallback:', e);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('orden', { ascending: true });
      if (!error && data && data.length > 0) {
        this.categories.set(data as Category[]);
        return data as Category[];
      }
    } catch (e) {
      // Fallback to initial
    }
    return this.categories();
  }

  async getStores(categoryId?: string): Promise<Store[]> {
    try {
      let query = this.supabase.from('stores').select('*').eq('activo', true);
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        this.stores.set(data as Store[]);
        return data as Store[];
      }
    } catch (e) {
      // Fallback
    }

    if (categoryId) {
      return this.stores().filter((s) => s.category_id === categoryId);
    }
    return this.stores();
  }

  async getStoreById(storeId: string): Promise<Store | undefined> {
    const local = this.stores().find((s) => s.id === storeId);
    if (local) return local;

    try {
      const { data } = await this.supabase.from('stores').select('*').eq('id', storeId).single();
      if (data) return data as Store;
    } catch (e) {}

    return undefined;
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('activo', true);
      if (!error && data && data.length > 0) {
        const store = await this.getStoreById(storeId);
        return data.map((p) => ({ ...p, tienda: store })) as Product[];
      }
    } catch (e) {}

    return this.products().filter((p) => p.store_id === storeId);
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    return this.products().find((p) => p.id === productId);
  }

  // GLOBAL SEARCH: Searches across all stores and compares price, availability, floor, and local
  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const storeMap = new Map(this.stores().map((s) => [s.id, s]));

    // Try Supabase first
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*, tienda:stores(*)')
        .ilike('nombre', `%${q}%`)
        .eq('activo', true);
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {}

    // Fallback in-memory search
    return this.products()
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
          (p.categoria && p.categoria.toLowerCase().includes(q))
      )
      .map((p) => ({
        ...p,
        tienda: p.tienda || storeMap.get(p.store_id),
      }))
      .sort((a, b) => a.precio - b.precio); // Sort by lowest price first for direct comparison!
  }

  // CREATE ORDER (via RPC or local fallback)
  async createOrder(
    storeId: string,
    items: { product: Product; quantity: number }[],
    ventanaRetiro: string,
    nota?: string
  ): Promise<{ success: boolean; orderId?: string; pickupCode?: string; pin?: string; total?: number; error?: string }> {
    const currentUser = this.authService.user();
    const clienteId = currentUser?.id || '11111111-1111-4111-a111-111111111111';

    const store = await this.getStoreById(storeId);
    if (!store) {
      return { success: false, error: 'Tienda no encontrada' };
    }

    const total = items.reduce((sum, item) => sum + item.product.precio * item.quantity, 0);
    const pickupCode = 'PY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ord-' + Math.random().toString(36).substring(2, 9);

    // Try Supabase RPC
    try {
      const rpcItems = items.map((i) => ({
        product_id: i.product.id,
        cantidad: i.quantity,
      }));

      const { data, error } = await this.supabase.rpc('crear_pedido', {
        p_store_id: storeId,
        p_items: rpcItems,
        p_ventana_retiro: ventanaRetiro,
        p_nota: nota || null,
      });

      if (!error && data?.success) {
        const serverOrder: Order = {
          id: data.order_id,
          cliente_id: clienteId,
          store_id: storeId,
          estado: 'recibido',
          total: Number(data.total) || total,
          pickup_code: data.pickup_code,
          pin_seguridad: data.pin_seguridad,
          ventana_retiro: ventanaRetiro,
          nota,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tienda: store,
          cliente: this.authService.profile() || undefined,
          items: items.map((i) => ({
            product_id: i.product.id,
            nombre_producto: i.product.nombre,
            precio_unitario: i.product.precio,
            cantidad: i.quantity,
            subtotal: i.product.precio * i.quantity,
            producto: i.product,
          })),
        };

        this.orders.update((list) => [serverOrder, ...list.filter((o) => o.id !== serverOrder.id)]);
        this.saveOrdersToStorage();
        this.loadOrders();

        return {
          success: true,
          orderId: data.order_id,
          pickupCode: data.pickup_code,
          pin: data.pin_seguridad,
          total: data.total,
        };
      }
    } catch (e) {
      console.warn('Supabase crear_pedido RPC fallback:', e);
    }

    // Local in-memory creation
    const newOrder: Order = {
      id: orderId,
      cliente_id: clienteId,
      store_id: storeId,
      estado: 'recibido',
      total,
      pickup_code: pickupCode,
      pin_seguridad: pin,
      ventana_retiro: ventanaRetiro,
      nota,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tienda: store,
      cliente: this.authService.profile() || undefined,
      items: items.map((i) => ({
        product_id: i.product.id,
        nombre_producto: i.product.nombre,
        precio_unitario: i.product.precio,
        cantidad: i.quantity,
        subtotal: i.product.precio * i.quantity,
        producto: i.product,
      })),
    };

    this.orders.update((list) => [newOrder, ...list]);
    this.saveOrdersToStorage();

    return {
      success: true,
      orderId,
      pickupCode,
      pin,
      total,
    };
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders().find((o) => o.id === orderId);
  }

  getClientOrders(clienteId?: string): Order[] {
    const list = this.orders();
    if (!clienteId) return list;
    return list.filter((o) => o.cliente_id === clienteId);
  }

  // Client updates: "cliente_llego"
  async notifyClientArrived(orderId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('cambiar_estado_pedido', {
        p_order_id: orderId,
        p_nuevo_estado: 'cliente_llego',
        p_nota: 'El cliente ha notificado su llegada al local del Paseo Aranjuez',
      });
      if (!error && data?.success) {
        this.updateLocalOrderStatus(orderId, 'cliente_llego');
        return true;
      }
    } catch (e) {}

    // Fallback update
    this.updateLocalOrderStatus(orderId, 'cliente_llego');
    return true;
  }

  updateLocalOrderStatus(orderId: string, nuevoEstado: OrderStatus): void {
    this.orders.update((list) =>
      list.map((o) => (o.id === orderId ? { ...o, estado: nuevoEstado, updated_at: new Date().toISOString() } : o))
    );
    this.saveOrdersToStorage();
  }

  getStoreOrders(storeId?: string): Order[] {
    const list = this.orders();
    if (!storeId) return list;
    return list.filter((o) => o.store_id === storeId);
  }

  async changeOrderStatus(
    orderId: string,
    nuevoEstado: OrderStatus,
    nota?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.rpc('cambiar_estado_pedido', {
        p_order_id: orderId,
        p_nuevo_estado: nuevoEstado,
        p_nota: nota || null,
      });

      if (!error && data?.success) {
        this.updateLocalOrderStatus(orderId, nuevoEstado);
        return { success: true };
      }
      if (error) {
        console.warn('RPC cambiar_estado_pedido error, applying fallback:', error.message);
      }
    } catch (e: any) {
      console.warn('RPC cambiar_estado_pedido fallback:', e);
    }

    this.updateLocalOrderStatus(orderId, nuevoEstado);
    return { success: true };
  }

  async validarRetiro(
    orderId: string,
    codigo: string
  ): Promise<{ success: boolean; parking?: any; error?: string }> {
    const cleanCode = codigo.trim().toUpperCase();

    try {
      const { data, error } = await this.supabase.rpc('validar_retiro', {
        p_order_id: orderId,
        p_codigo: cleanCode,
      });

      if (!error && data?.success) {
        this.updateLocalOrderStatus(orderId, 'entregado');
        return { success: true, parking: data.parking };
      }
      if (error) {
        console.warn('RPC validar_retiro error, attempting local validation:', error.message);
      }
    } catch (e: any) {
      console.warn('RPC validar_retiro fallback:', e);
    }

    // Local validation fallback
    const ord = this.getOrderById(orderId);
    if (!ord) {
      return { success: false, error: 'Pedido no encontrado' };
    }

    if (cleanCode !== ord.pickup_code.toUpperCase() && cleanCode !== ord.pin_seguridad) {
      return { success: false, error: 'Código o PIN incorrecto. Verifica el pase del cliente.' };
    }

    this.updateLocalOrderStatus(orderId, 'entregado');
    const parkingTicket = {
      codigo_qr: 'PARK-' + ord.pickup_code,
      horas_libres: 2,
      valido_hasta: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      mensaje: '¡Validación de parqueo subterráneo Paseo Aranjuez generada con 2 horas libres!',
    };

    return {
      success: true,
      parking: parkingTicket,
    };
  }

  async addProduct(product: Partial<Product>): Promise<Product> {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b' + Math.random().toString(36).substring(2, 10).padStart(35, '0');
    const store = await this.getStoreById(product.store_id || 'a0000000-0000-0000-0000-000000000001');

    const created: Product = {
      id: newId,
      store_id: product.store_id || 'a0000000-0000-0000-0000-000000000001',
      nombre: product.nombre || 'Nuevo Producto',
      descripcion: product.descripcion || '',
      precio: Number(product.precio) || 0,
      stock: Number(product.stock) || 0,
      imagen_url: product.imagen_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
      categoria: product.categoria || 'General',
      activo: product.activo ?? true,
      tienda: store,
    };

    try {
      const insertPayload = {
        id: created.id,
        store_id: created.store_id,
        nombre: created.nombre,
        descripcion: created.descripcion,
        precio: created.precio,
        stock: created.stock,
        imagen_url: created.imagen_url,
        categoria: created.categoria,
        activo: created.activo,
      };
      const { data, error } = await this.supabase.from('products').insert([insertPayload]).select().single();
      if (!error && data) {
        const prod = { ...data, tienda: store };
        this.products.update((list) => [prod, ...list.filter((p) => p.id !== prod.id)]);
        return prod;
      }
    } catch (e) {}

    this.products.update((list) => [created, ...list]);
    return created;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | undefined> {
    try {
      await this.supabase.from('products').update(updates).eq('id', productId);
    } catch (e) {}

    let updatedProd: Product | undefined;
    this.products.update((list) =>
      list.map((p) => {
        if (p.id === productId) {
          updatedProd = { ...p, ...updates };
          return updatedProd;
        }
        return p;
      })
    );

    return updatedProd;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await this.supabase.from('products').delete().eq('id', productId);
    } catch (e) {}

    this.products.update((list) => list.filter((p) => p.id !== productId));
    return true;
  }

  async addStore(storeData: Partial<Store>): Promise<Store> {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a' + Math.random().toString(36).substring(2, 10).padStart(35, '0');
    const newStore: Store = {
      id: newId,
      category_id: storeData.category_id || '11111111-c000-0000-0000-000000000001',
      nombre: storeData.nombre || 'Nueva Tienda',
      rubro: storeData.rubro || 'Comercio General',
      piso: storeData.piso || 'Piso 1',
      sector: storeData.sector || 'Plaza Central',
      local: storeData.local || 'Local 101',
      horario_semana: storeData.horario_semana || '10:00 - 22:00',
      horario_domingo_feriado: storeData.horario_domingo_feriado || '12:00 - 22:00',
      telefono: storeData.telefono || '70000000',
      logo_url: storeData.logo_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&auto=format&fit=crop&q=80',
      portada_url: storeData.portada_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      activo: storeData.activo ?? true,
    };

    try {
      const { data, error } = await this.supabase.from('stores').insert([newStore]).select().single();
      if (!error && data) {
        this.stores.update((list) => [data as Store, ...list.filter((s) => s.id !== data.id)]);
        return data as Store;
      }
    } catch (e) {}

    this.stores.update((list) => [newStore, ...list]);
    return newStore;
  }

  async updateStore(storeId: string, updates: Partial<Store>): Promise<Store | undefined> {
    try {
      await this.supabase.from('stores').update(updates).eq('id', storeId);
    } catch (e) {}

    let updatedStore: Store | undefined;
    this.stores.update((list) =>
      list.map((s) => {
        if (s.id === storeId) {
          updatedStore = { ...s, ...updates };
          return updatedStore;
        }
        return s;
      })
    );
    return updatedStore;
  }
}

