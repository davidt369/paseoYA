import { Routes } from '@angular/router';

export const COMERCIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/comercio-layout.component').then(m => m.ComercioLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/pedidos/pedidos.component').then(m => m.PedidosComercioComponent),
      },
      {
        path: 'validar',
        loadComponent: () => import('./pages/validar/validar-retiro.component').then(m => m.ValidarRetiroComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComercioComponent),
      },
      {
        path: 'ventas',
        loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComercioComponent),
      },
    ],
  },
];
