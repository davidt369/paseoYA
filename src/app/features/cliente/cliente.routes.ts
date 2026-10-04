import { Routes } from '@angular/router';

export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/cliente-layout.component').then(m => m.ClienteLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'tiendas',
        loadComponent: () => import('./pages/tiendas/tiendas.component').then(m => m.TiendasComponent),
      },
      {
        path: 'tiendas/:id',
        loadComponent: () => import('./pages/tienda-detalle/tienda-detalle.component').then(m => m.TiendaDetalleComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos-catalogo/productos-catalogo.component').then(m => m.ProductosCatalogoComponent),
      },
      {
        path: 'reels',
        loadComponent: () => import('./pages/reels/reels.component').then(m => m.ReelsComponent),
      },
      {
        path: 'buscar',
        redirectTo: 'productos',
        pathMatch: 'full',
      },
      {
        path: 'carrito',
        loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent),
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./pages/pedido-detalle/pedido-detalle.component').then(m => m.PedidoDetalleComponent),
      },
    ],
  },
];
