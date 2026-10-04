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

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent browser default mini-infobar on mobile Chrome
      e.preventDefault();
      this.deferredPrompt.set(e);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.deferredPrompt.set(null);
      this.showGuideModal.set(false);
      console.log('PaseoYa PWA successfully installed');
    });
  }

  async installPwa(): Promise<'accepted' | 'dismissed' | 'manual_guide'> {
    const promptEvent = this.deferredPrompt();

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          this.deferredPrompt.set(null);
          this.isInstalled.set(true);
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Error during PWA install prompt:', err);
      }
    }

    // If native prompt is not available (e.g. iOS Safari, prompt already used, or browser doesn't support beforeinstallprompt)
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
