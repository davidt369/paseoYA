import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/pedidos/pedidos-admin.component').then(m => m.PedidosAdminComponent),
      },
      {
        path: 'tiendas',
        loadComponent: () => import('./pages/tiendas/tiendas-admin.component').then(m => m.TiendasAdminComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios-admin.component').then(m => m.UsuariosAdminComponent),
      },
    ],
  },
];
