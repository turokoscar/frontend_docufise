import { Component, input, output, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideCheck } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../../shared/components/ui/modal/modal.component';
import { UiInputComponent } from '../../../../../shared/components/ui/input/input.component';
import { UiTextareaComponent } from '../../../../../shared/components/ui/textarea/textarea.component';
import { UiButtonComponent } from '../../../../../shared/components/ui/button/button.component';

import { AreaSistema } from '../../../../../core/models/area.model';

@Component({
  selector: 'app-area-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    UiModalComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiButtonComponent
  ],
  providers: [
    provideIcons({ lucideBuilding2, lucideCheck })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-lg"
    >
      <div header class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <ng-icon name="lucideBuilding2" class="h-5 w-5 text-primary"></ng-icon>
        </div>
        <div>
          <h3 class="font-display text-lg font-bold">{{ area() ? 'Editar Área' : 'Nueva Área' }}</h3>
          <p class="text-xs text-muted-foreground font-body mt-0.5">
            {{ area() ? 'Editando área existente' : 'Complete los campos para registrar una nueva área' }}
          </p>
        </div>
      </div>

      <div body class="space-y-6">
        <app-ui-input 
          label="Nombre del Área" 
          placeholder="Ej: Dirección de Infraestructura"
          [(ngModel)]="nombre" 
          name="nombre"
        ></app-ui-input>
        
        <app-ui-textarea 
          label="Descripción / Función" 
          placeholder="Indique brevemente el propósito de esta unidad..."
          [(ngModel)]="descripcion" 
          name="descripcion"
        ></app-ui-textarea>

        <div class="flex items-center gap-3 p-1 group">
          <input 
            type="checkbox" 
            [(ngModel)]="activo" 
            name="activo" 
            id="area_activo" 
            class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          >
          <label for="area_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
            Habilitada para derivación de expedientes
          </label>
        </div>
      </div>

      <div footer class="flex justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button variant="primary" [loading]="isSaving()" (onClick)="save()">
          <ng-icon name="lucideCheck" class="mr-1"></ng-icon>
          {{ area() ? 'Actualizar' : 'Guardar' }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class AreaFormComponent {
  isOpen = input<boolean>(false);
  area = input<AreaSistema | null>(null);

  onClose = output<void>();
  onSaved = output<any>();

  isSaving = signal(false);
  nombre = model('');
  descripcion = model('');
  activo = model(true);

  save(): void {
    if (!this.nombre() || !this.descripcion()) {
      return;
    }

    const formData = {
      nombre: this.nombre(),
      descripcion: this.descripcion(),
      activo: this.activo()
    };

    this.onSaved.emit(formData);
  }

  close(): void {
    this.onClose.emit();
  }
}
