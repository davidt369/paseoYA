import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

export type StateType = 'empty' | 'error' | 'loading';

@Component({
  selector: 'app-state-message',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
      @if (type() === 'loading') {
        <div class="size-10 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3"></div>
        <h4 class="text-sm font-bold text-slate-800">{{ title() || 'Cargando datos...' }}</h4>
        @if (message()) {
          <p class="text-xs text-slate-500 mt-1 max-w-xs">{{ message() }}</p>
        }
      }

      @if (type() === 'empty') {
        <div class="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl mb-3 text-slate-400">
          <app-icon [name]="icon() || 'search'" [size]="24" />
        </div>
        <h4 class="text-sm font-bold text-slate-800">{{ title() || 'No se encontraron resultados' }}</h4>
        @if (message()) {
          <p class="text-xs text-slate-500 mt-1 max-w-xs">{{ message() }}</p>
        }
        @if (actionLabel()) {
          <div class="mt-4">
            <app-button size="sm" (clicked)="actionClicked.emit()">
              {{ actionLabel() }}
            </app-button>
          </div>
        }
      }

      @if (type() === 'error') {
        <div class="size-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
          <app-icon name="alert-circle" [size]="24" />
        </div>
        <h4 class="text-sm font-bold text-slate-900">{{ title() || 'Ha ocurrido un problema' }}</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-xs">
          {{ message() || 'No se pudo completar la operación. Por favor intenta nuevamente.' }}
        </p>
        @if (actionLabel() || showRetry()) {
          <div class="mt-4">
            <app-button variant="outline" size="sm" (clicked)="actionClicked.emit()">
              {{ actionLabel() || 'Reintentar' }}
            </app-button>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateMessageComponent {
  type = input<StateType>('empty');
  title = input<string>('');
  message = input<string>('');
  icon = input<IconName>('search');
  actionLabel = input<string>('');
  showRetry = input<boolean>(true);

  actionClicked = output<void>();
}
