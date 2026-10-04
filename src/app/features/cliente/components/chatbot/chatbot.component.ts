import { Component, ElementRef, ViewChild, inject, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../../core/services/chatbot.service';
import { CartService } from '../../../../core/services/cart.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { AiOrbIconComponent } from '../../../../shared/ui/ai-orb/ai-orb-icon.component';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, AiOrbIconComponent],
  template: `
    <!-- Chat Modal Window (Only launched via central IA button) -->
    @if (chatbot.isOpen()) {
      <div class="fixed inset-x-2 bottom-20 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-xl bg-slate-950/40 border border-white/10 flex items-center justify-center shrink-0">
              <app-ai-orb-icon [size]="30" [glow]="false" label="Asistente PaseoYa" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-bold text-sm tracking-tight text-white leading-tight">Asistente PaseoYa</h3>
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p class="text-[11px] text-slate-300">Paseo Aranjuez • En línea</p>
            </div>
          </div>
          <button
            (click)="chatbot.setOpen(false)"
            type="button"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            title="Cerrar chat"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-sm">
          @for (msg of chatbot.messages(); track msg.id) {
            @if (msg.sender === 'bot') {
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                  🤖
                </div>
                <div class="max-w-[85%] space-y-2">
                  <div class="bg-white p-3 rounded-2xl rounded-tl-sm shadow-xs border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                    {{ msg.text }}
                  </div>

                  <!-- Attached Products if any -->
                  @if (msg.products && msg.products.length > 0) {
                    <div class="space-y-1.5 pt-1">
                      <div class="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-1">Opciones en tiendas:</div>
                      @for (p of msg.products; track p.id) {
                        <div class="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-amber-400 transition-colors">
                          <img [src]="p.imagen_url" [alt]="p.nombre" class="w-11 h-11 object-cover rounded-lg bg-slate-100 shrink-0" />
                          <div class="min-w-0 flex-1">
                            <p class="font-bold text-xs text-slate-900 truncate">{{ p.nombre }}</p>
                            <p class="text-[11px] text-slate-500 truncate">{{ p.tienda?.nombre || 'Paseo Aranjuez' }} • {{ p.tienda?.piso || 'Tienda' }}</p>
                            <span class="text-xs font-black text-amber-700">Bs. {{ p.precio.toFixed(2) }}</span>
                          </div>
                          <button
                            (click)="addToCart(p)"
                            type="button"
                            class="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-[11px] rounded-lg shadow-xs transition-transform shrink-0"
                            title="Añadir al carrito"
                          >
                            + Pedir
                          </button>
                        </div>
                      }
                    </div>
                  }

                  <!-- Attached Suggestion Chips -->
                  @if (msg.suggestions && msg.suggestions.length > 0) {
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      @for (sug of msg.suggestions; track sug) {
                        <button
                          (click)="sendQuickPrompt(sug)"
                          type="button"
                          class="text-[11px] bg-white hover:bg-amber-50 text-amber-900 font-medium px-2.5 py-1 rounded-full border border-amber-200 hover:border-amber-400 transition-colors text-left"
                        >
                          {{ sug }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- User Message -->
              <div class="flex items-end justify-end gap-2">
                <div class="max-w-[80%] bg-amber-600 text-white p-3 rounded-2xl rounded-br-sm shadow-xs text-xs sm:text-[13px] leading-relaxed">
                  {{ msg.text }}
                </div>
              </div>
            }
          }

          <!-- Typing Indicator -->
          @if (chatbot.isTyping()) {
            <div class="flex items-center gap-2 text-slate-400 text-xs pl-2">
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span class="text-[11px] italic">Escribiendo respuesta...</span>
            </div>
          }
        </div>

        <!-- Footer Input Form -->
        <div class="p-2.5 bg-white border-t border-slate-200">
          <form (ngSubmit)="handleSend()" class="flex items-center gap-2">
            <input
              type="text"
              [(ngModel)]="userInput"
              name="userInput"
              placeholder="Ej: audífonos, comida piso 3, horarios..."
              class="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none transition-all"
              [disabled]="chatbot.isTyping()"
            />
            <button
              type="submit"
              [disabled]="!userInput.trim() || chatbot.isTyping()"
              class="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all active:scale-95 shrink-0"
              aria-label="Enviar mensaje"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
          <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
            <span>Paseo Aranjuez • Cochabamba</span>
            <span>Retiro exclusivo en tienda</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class ChatbotComponent {
  readonly chatbot = inject(ChatbotService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  userInput = '';

  constructor() {
    afterNextRender(() => {
      this.scrollToBottom();
    });
  }

  async handleSend(): Promise<void> {
    const text = this.userInput.trim();
    if (!text) return;
    this.userInput = '';
    await this.chatbot.sendMessage(text);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  async sendQuickPrompt(promptText: string): Promise<void> {
    await this.chatbot.sendMessage(promptText);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
    this.toastService.show(`"${product.nombre}" agregado al carrito`, 'success');
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
