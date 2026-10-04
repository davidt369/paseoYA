import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

@Component({
  selector: 'app-pwa-install-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (pwaInstall.showGuideModal()) {
      <div
        class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        (click)="pwaInstall.closeGuide()"
      >
        <div
          class="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Close button -->
          <button
            type="button"
            (click)="pwaInstall.closeGuide()"
            class="absolute top-4 right-4 size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer text-sm font-bold"
            aria-label="Cerrar modal"
          >
            ✕
          </button>

          <!-- App Icon & Title Header -->
          <div class="flex items-center gap-3.5">
            <div class="h-14 w-18 rounded-2xl bg-slate-900 p-2 flex items-center justify-center shadow-md shrink-0 border border-slate-800">
              <img
                src="/logo-blanco.png"
                alt="Paseo Aranjuez"
                class="w-full h-full object-contain"
              />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-black text-base text-slate-900 leading-tight">Instalar PaseoYa</h3>
                <span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  PWA
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Acceso directo en tu teléfono sin abrir navegador</p>
            </div>
          </div>

          <!-- Direct Install Button if supported -->
          @if (pwaInstall.hasPrompt()) {
            <div class="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs">Instalación automática disponible</span>
                <span class="text-xs">⚡</span>
              </div>
              <button
                type="button"
                (click)="onDirectInstall()"
                class="w-full py-2.5 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📲</span>
                <span>Instalar Ahora Directamente</span>
              </button>
            </div>
          }

          <!-- Tabs for Android / iOS / PC -->
          <div class="space-y-3">
            <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              <button
                type="button"
                (click)="activeTab.set('android')"
                [class.bg-white]="activeTab() === 'android'"
                [class.text-slate-900]="activeTab() === 'android'"
                [class.shadow-xs]="activeTab() === 'android'"
                class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer"
              >
                🤖 Android
              </button>
              <button
                type="button"
                (click)="activeTab.set('ios')"
                [class.bg-white]="activeTab() === 'ios'"
                [class.text-slate-900]="activeTab() === 'ios'"
                [class.shadow-xs]="activeTab() === 'ios'"
                class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer"
              >
                🍎 iPhone / iPad
              </button>
              <button
                type="button"
                (click)="activeTab.set('pc')"
                [class.bg-white]="activeTab() === 'pc'"
                [class.text-slate-900]="activeTab() === 'pc'"
                [class.shadow-xs]="activeTab() === 'pc'"
                class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer"
              >
                💻 PC
              </button>
            </div>

            <!-- Tab Content: Android -->
            @if (activeTab() === 'android') {
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs text-slate-700">
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Abre el menú de Chrome tocando los <strong>tres puntos (⋮)</strong> en la esquina superior derecha.</p>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Toca la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</p>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Presiona <strong>"Instalar"</strong>. Se añadirá el ícono oficial de PaseoYa en tu pantalla de inicio.</p>
                </div>
              </div>
            }

            <!-- Tab Content: iOS -->
            @if (activeTab() === 'ios') {
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs text-slate-700">
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Toca el botón <strong>Compartir (icono cuadrado con flecha arriba 📤)</strong> en Safari.</p>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Desliza hacia abajo en las opciones y selecciona <strong>"Agregar al inicio"</strong>.</p>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Toca <strong>"Agregar"</strong> en la esquina superior derecha.</p>
                </div>
              </div>
            }

            <!-- Tab Content: PC / Mac -->
            @if (activeTab() === 'pc') {
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs text-slate-700">
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Busca el icono de instalación <strong>⬇️</strong> en el extremo derecho de la barra de direcciones de Chrome o Edge.</p>
                </div>
                <div class="flex items-start gap-2.5">
                  <span class="size-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Haz clic y confirma en <strong>"Instalar PaseoYa"</strong> para abrirlo en su propia ventana sin pestañas.</p>
                </div>
              </div>
            }
          </div>

          <!-- Benefits Footer -->
          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
            <div class="flex items-center gap-1.5">
              <span>⚡</span>
              <span>Carga instantánea</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span>🎫</span>
              <span>QR sin conexión</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span>🚗</span>
              <span>Ticket de parqueo</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span>🔔</span>
              <span>Avisos de retiro</span>
            </div>
          </div>

          <!-- Action Button -->
          <button
            type="button"
            (click)="pwaInstall.closeGuide()"
            class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstallModalComponent {
  pwaInstall = inject(PwaInstallService);
  activeTab = signal<'android' | 'ios' | 'pc'>('android');

  async onDirectInstall(): Promise<void> {
    await this.pwaInstall.installPwa();
  }
}
