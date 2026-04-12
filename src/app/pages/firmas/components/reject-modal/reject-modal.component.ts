import { Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert, lucideX, lucideInfo } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { UiButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiTextareaComponent } from '../../../../shared/components/ui/textarea/textarea.component';

import { Firma } from '../../../../core/models/firma.model';
import { FirmaService } from '../../../../core/services/firma.service';

@Component({
  selector: 'app-reject-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    UiModalComponent,
    UiButtonComponent,
    UiTextareaComponent
  ],
  providers: [
    provideIcons({ lucideTriangleAlert, lucideX, lucideInfo })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-md"
      [paddingBody]="false"
    >
      <div header class="bg-gradient-to-r from-destructive to-destructive/80 -m-6 mb-0 p-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md">
            <ng-icon name="lucideTriangleAlert" class="text-2xl text-white"></ng-icon>
          </div>
          <div>
            <h3 class="font-display text-xl font-bold text-white">Rechazar Firma</h3>
            <p class="text-xs text-white/80 font-body">Indique el motivo de la observación</p>
          </div>
        </div>
      </div>

      <div body class="p-6 space-y-6">
        <div class="bg-destructive/5 rounded-xl p-4 border border-destructive/10">
          <p class="text-[10px] font-ui text-destructive uppercase tracking-wider mb-1">Documento a Rechazar</p>
          <p class="font-display font-bold text-foreground">{{ firma()?.documentoNumeracion }}</p>
        </div>

        <app-ui-textarea 
          label="Motivo del Rechazo" 
          placeholder="Describa brevemente por qué rechaza el documento..."
          [value]="motivoRechazo()"
          [className]="'focus:border-destructive focus:ring-destructive/10'"
          (onValueChange)="motivoRechazo.set($event)"
        ></app-ui-textarea>
      </div>

      <div footer class="flex items-center justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button 
          variant="destructive" 
          [disabled]="!isValid()"
          (onClick)="confirm()"
        >
          Confirmar Rechazo
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class RejectModalComponent {
  private firmaService = inject(FirmaService);

  isOpen = input<boolean>(false);
  firma = input<Firma | null>(null);

  onClose = output<void>();
  onRejected = output<void>();

  motivoRechazo = signal('');
  isValid = computed(() => this.motivoRechazo().trim().length > 0);

  close(): void {
    this.motivoRechazo.set('');
    this.onClose.emit();
  }

  confirm(): void {
    const f = this.firma();
    if (!f || !this.isValid()) return;

    this.firmaService.rechazar(f.id, this.motivoRechazo().trim());
    this.onRejected.emit();
    this.close();
  }
}
