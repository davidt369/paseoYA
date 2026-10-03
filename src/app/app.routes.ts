import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'cliente',
    loadChildren: () => import('./features/cliente/cliente.routes').then(m => m.CLIENTE_ROUTES),
  },
  {
    path: 'comercio',
    loadChildren: () => import('./features/comercio/comercio.routes').then(m => m.COMERCIO_ROUTES),
    canActivate: [roleGuard(['comercio', 'admin'])],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [roleGuard(['admin'])],
  },
  {
    path: '',
    redirectTo: 'cliente',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'cliente',
  },
];
