import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900">
      <header class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold">Administración Paseo Aranjuez</h1>
          <p class="text-xs text-slate-400">Supervisión integral de ventas, pedidos y comercios</p>
        </div>
      </header>
      <main class="max-w-6xl mx-auto p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}
