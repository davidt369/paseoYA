import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-comercio',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900">
      <header class="bg-white border-b border-slate-200 px-4 py-3">
        <h1 class="text-lg font-bold text-slate-900">Panel del Comercio</h1>
        <p class="text-xs text-slate-500">Gestión de productos y validación de pedidos</p>
      </header>
      <main class="max-w-4xl mx-auto p-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComercioComponent {}
