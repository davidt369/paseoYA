import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt = signal<any>(null);
  readonly isInstalled = signal<boolean>(false);
  readonly isMobile = signal<boolean>(false);
  readonly showGuideModal = signal<boolean>(false);
  readonly hasPrompt = computed(() => this.deferredPrompt() !== null);

  constructor() {
    this.checkEnvironment();
    this.initListeners();
  }

  private checkEnvironment(): void {
    if (typeof window === 'undefined') return;

    // Detect if device is phone/tablet (avoid showing install prompt on desktop PC / Mac)
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const hasTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 1024;
    this.isMobile.set(isMobileUA || (hasTouchScreen && isSmallScreen));

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    this.isInstalled.set(Boolean(isStandalone));
  }

  private initListeners(): void {
    if (typeof window === 'undefined') return;

    // Check if prompt was already captured by early script in index.html
    if ((window as any).deferredPwaPrompt) {
      this.deferredPrompt.set((window as any).deferredPwaPrompt);
    }

    window.addEventListener('pwa-prompt-ready', () => {
      if ((window as any).deferredPwaPrompt) {
        this.deferredPrompt.set((window as any).deferredPwaPrompt);
      }
    });

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      this.deferredPrompt.set(e);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.deferredPrompt.set(null);
      (window as any).deferredPwaPrompt = null;
      this.showGuideModal.set(false);
      console.log('PaseoYa PWA successfully installed');
    });
  }

  async installPwa(): Promise<'accepted' | 'dismissed' | 'manual_guide'> {
    // 1. Obtener el evento prompt nativo del servicio o del scope global inmediato
    const promptEvent = this.deferredPrompt() || (typeof window !== 'undefined' ? (window as any).deferredPwaPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          this.deferredPrompt.set(null);
          if (typeof window !== 'undefined') (window as any).deferredPwaPrompt = null;
          this.isInstalled.set(true);
          this.showGuideModal.set(false);
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Error launching native PWA install prompt:', err);
      }
    }

    // 2. Si el navegador no permite el prompt automático (ej: iOS Safari o cuando el usuario ya lo cerró)
    this.showGuideModal.set(true);
    return 'manual_guide';
  }

  openGuide(): void {
    this.showGuideModal.set(true);
  }

  closeGuide(): void {
    this.showGuideModal.set(false);
  }
}
