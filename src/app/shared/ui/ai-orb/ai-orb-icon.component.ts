import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

/**
 * Orbe vectorial de Inteligencia Artificial.
 * SVG 100% vectorial con gradiente radial, luz interior, rim light y aura animada.
 * Los identificadores de <defs> son únicos por instancia para evitar colisiones
 * al renderizar varios orbes en el mismo documento.
 */
@Component({
  selector: 'app-ai-orb-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="relative inline-flex items-center justify-center shrink-0"
      [style.width.px]="size()"
      [style.height.px]="size()"
    >
      @if (glow()) {
        <span class="orb-aura absolute inset-0 rounded-full" aria-hidden="true"></span>
      }

      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 48 48"
        fill="none"
        role="img"
        [attr.aria-label]="label()"
      >
        <title>{{ label() }}</title>

        <defs>
          <!-- Núcleo del orbe: cian -> índigo -> violeta -> tinta profunda -->
          <radialGradient [attr.id]="coreId()" cx="35%" cy="30%" r="78%">
            <stop offset="0%" stop-color="#a5f3fc" />
            <stop offset="22%" stop-color="#67e8f9" />
            <stop offset="48%" stop-color="#818cf8" />
            <stop offset="76%" stop-color="#7c3aed" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </radialGradient>

          <!-- Rim light diagonal -->
          <linearGradient [attr.id]="rimId()" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
            <stop offset="45%" stop-color="#ffffff" stop-opacity="0.05" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>

          <!-- Destello cálido inferior derecho -->
          <radialGradient [attr.id]="sparkId()" cx="70%" cy="76%" r="42%">
            <stop offset="0%" stop-color="#fcd34d" stop-opacity="0.85" />
            <stop offset="100%" stop-color="#fcd34d" stop-opacity="0" />
          </radialGradient>

          <filter [attr.id]="blurId()" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.7" />
          </filter>
        </defs>

        <!-- Resplandor exterior -->
        <circle
          cx="24"
          cy="24"
          r="14.5"
          fill="#6366f1"
          opacity="0.5"
          [attr.filter]="'url(#' + blurId() + ')'"
        />

        <!-- Cuerpo del orbe -->
        <circle cx="24" cy="24" r="14" [attr.fill]="'url(#' + coreId() + ')'" />

        <!-- Destello cálido -->
        <circle cx="24" cy="24" r="14" [attr.fill]="'url(#' + sparkId() + ')'" />

        <!-- Luz interior superior izquierda -->
        <ellipse
          cx="19.2"
          cy="17.8"
          rx="6.4"
          ry="4.4"
          fill="#ffffff"
          opacity="0.5"
          transform="rotate(-28 19.2 17.8)"
          [attr.filter]="'url(#' + blurId() + ')'"
        />

        <!-- Borde iluminado -->
        <circle
          cx="24"
          cy="24"
          r="14"
          [attr.stroke]="'url(#' + rimId() + ')'"
          stroke-width="1.5"
          fill="none"
        />

        <!-- Núcleo brillante -->
        <circle cx="24" cy="24" r="3" fill="#ffffff" opacity="0.92" />
        <circle cx="24" cy="24" r="1.5" fill="#ffffff" />
      </svg>
    </span>
  `,
})
export class AiOrbIconComponent {
  readonly size = input(40);
  readonly glow = input(true);
  readonly label = input('Asistente inteligente IA PaseoYa');

  private static seq = 0;
  private readonly uid = `ai-orb-${++AiOrbIconComponent.seq}`;

  readonly coreId = computed(() => `${this.uid}-core`);
  readonly rimId = computed(() => `${this.uid}-rim`);
  readonly sparkId = computed(() => `${this.uid}-spark`);
  readonly blurId = computed(() => `${this.uid}-blur`);
}