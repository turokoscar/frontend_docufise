import { Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSend, lucideInfo, lucideX, lucideChevronDown, lucideCircleHelp } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { UiSelectComponent } from '../../../../shared/components/ui/select/select.component';
import { UiTextareaComponent } from '../../../../shared/components/ui/textarea/textarea.component';
import { UiButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { UiInputComponent } from '../../../../shared/components/ui/input/input.component';

import { Documento } from '../../../../core/models/documento.model';
import { UsuarioSistema } from '../../../../core/models/usuario.model';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ApiService } from '../../../../core/services/api.service';
import { DocumentoService } from '../../../../core/services/documento.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-derivacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    UiModalComponent,
    UiSelectComponent,
    UiTextareaComponent,
    UiButtonComponent,
    UiInputComponent
  ],
  providers: [
    provideIcons({ lucideSend, lucideInfo, lucideX, lucideChevronDown, lucideCircleHelp })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-md"
    >
      <div header class="flex items-center gap-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#E8F0FE]">
          <ng-icon name="lucideSend" class="h-6 w-6 text-[#2e5ba7]"></ng-icon>
        </div>
        <div>
          <h3 class="font-display text-xl font-bold text-[#0F172A]">Derivar Expediente</h3>
          <p class="text-sm text-muted-foreground font-body">Asignar expediente a un área y usuario destino</p>
        </div>
      </div>

      <div body class="space-y-6">
        <!-- Información del Expediente Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideInfo" class="text-muted-foreground text-[10px]"></ng-icon>
            <span class="text-[10px] font-ui font-bold text-muted-foreground uppercase tracking-widest">Información del Expediente</span>
          </div>
          <div class="bg-[#F1F5F9] rounded-xl p-4 border border-border/30">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-0.5">
                <p class="text-[9px] font-ui font-bold text-muted-foreground uppercase tracking-tight">Expediente</p>
                <p class="text-sm font-ui font-extrabold text-[#2e5ba7]">{{ documento()?.numeracion }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-[9px] font-ui font-bold text-muted-foreground uppercase tracking-tight">Tipo</p>
                <p class="text-sm font-body font-medium text-[#334155]">{{ documento()?.tipoDocumento }}</p>
              </div>
            </div>
          </div>
        </div>

        <hr class="border-border/50" />

        <!-- Destino Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideSend" class="text-[#2e5ba7] text-[10px]"></ng-icon>
            <span class="text-[10px] font-ui font-bold text-[#2e5ba7] uppercase tracking-widest">Destino de Derivación</span>
          </div>

          <app-ui-select 
            label="Área Destino" 
            [value]="areaId() || ''" 
            [required]="true"
            (onValueChange)="onAreaChange($event)"
          >
            <option value="">Seleccione área...</option>
            <option *ngFor="let area of catalogService.areas()" [value]="area.id">{{ area.nombre }}</option>
          </app-ui-select>

          <div class="space-y-1">
            <app-ui-select 
              label="Usuario Destino" 
              [value]="usuarioId() || ''" 
              [required]="true"
              [disabled]="!areaId() || isLoadingUsers()"
              (onValueChange)="usuarioId.set(+$event)"
            >
              <option value="">{{ isLoadingUsers() ? 'Cargando usuarios...' : 'Seleccione usuario...' }}</option>
              <option *ngFor="let u of usuariosDestino()" [value]="u.id">{{ u.nombreCompleto }}</option>
            </app-ui-select>
            <p *ngIf="!areaId()" class="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 mt-1 ml-1">
              <ng-icon name="lucideCircleHelp" class="text-xs"></ng-icon>
              Seleccione primero un área para ver los usuarios disponibles
            </p>
          </div>

          <app-ui-input 
            label="Enviado por" 
            [value]="authService.user()?.nombre || 'Usuario del Sistema'" 
            [disabled]="true"
          ></app-ui-input>

          <app-ui-textarea 
            label="Observaciones" 
            placeholder="Observaciones adicionales para el destinatario..."
            [value]="observaciones()"
            (onValueChange)="observaciones.set($event)"
          ></app-ui-textarea>
        </div>
      </div>

      <div footer class="flex items-center gap-3">
        <app-ui-button variant="outline" className="flex-1" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button 
          variant="primary" 
          className="flex-2" 
          [disabled]="!isValid()"
          (onClick)="confirm()"
        >
          <div class="flex items-center gap-2">
            <ng-icon name="lucideSend" class="h-4 w-4"></ng-icon>
            Confirmar Derivación
          </div>
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class DerivacionModalComponent {
  catalogService = inject(CatalogService);
  private apiService = inject(ApiService);
  private documentoService = inject(DocumentoService);
  authService = inject(AuthService);

  isOpen = input<boolean>(false);
  documento = input<Documento | null>(null);

  onClose = output<void>();
  onDerived = output<void>();

  // State
  areaId = signal<number | null>(null);
  usuarioId = signal<number | null>(null);
  observaciones = signal('');
  usuariosDestino = signal<UsuarioSistema[]>([]);
  isLoadingUsers = signal(false);

  isValid = computed(() => !!this.areaId() && !!this.usuarioId());

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        this.reset();
      }
    }, { allowSignalWrites: true });
  }

  onAreaChange(val: string): void {
    const id = Number(val);
    this.areaId.set(id);
    this.usuarioId.set(null);
    this.usuariosDestino.set([]);

    if (id) {
      this.isLoadingUsers.set(true);
      this.apiService.getUsuarios(id).subscribe({
        next: (users) => {
          this.usuariosDestino.set(users);
          this.isLoadingUsers.set(false);
        },
        error: () => this.isLoadingUsers.set(false)
      });
    }
  }

  reset(): void {
    this.areaId.set(null);
    this.usuarioId.set(null);
    this.observaciones.set('');
    this.usuariosDestino.set([]);
  }

  close(): void {
    this.onClose.emit();
  }

  confirm(): void {
    if (!this.isValid()) return;
    
    const doc = this.documento();
    if (!doc) return;

    this.documentoService.derivar(
      doc.id,
      this.areaId()!,
      this.usuarioId()!,
      this.authService.user()?.id
    );
    this.onDerived.emit();
    this.close();
  }
}
