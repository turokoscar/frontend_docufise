import { Component, input, output, signal, effect } from '@angular/core';
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
      [paddingBody]="false"
    >
      <div header class="bg-primary -m-6 mb-0 p-8 text-primary-foreground text-center relative rounded-t-2xl">
        <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20 backdrop-blur-md">
          <ng-icon name="lucideBuilding2" class="text-3xl"></ng-icon>
        </div>
        <h3 class="font-display text-2xl font-extrabold tracking-tight">
          {{ area() ? 'Editar Área' : 'Nueva Área' }}
        </h3>
        <p class="text-white/70 text-sm font-body mt-2">Mantenimiento de dependencias institucionales</p>
      </div>

      <div body class="p-8 space-y-6">
        <div class="space-y-6">
          <app-ui-input 
            label="Nombre del Área" 
            placeholder="Ej: Dirección de Infraestructura"
            [(ngModel)]="formData.nombre" 
            name="nombre"
          ></app-ui-input>
          
          <app-ui-textarea 
            label="Descripción / Función" 
            placeholder="Indique brevemente el propósito de esta unidad..."
            [(ngModel)]="formData.descripcion" 
            name="descripcion"
            class="min-h-[120px]"
          ></app-ui-textarea>

          <div class="flex items-center gap-3 p-1 group">
            <input 
              type="checkbox" 
              [(ngModel)]="formData.activo" 
              name="activo" 
              id="area_activo" 
              class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-all"
            >
            <label for="area_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
              Habilitada para derivación de expedientes
            </label>
          </div>
        </div>
      </div>

      <div footer class="flex gap-3">
        <app-ui-button variant="outline" class="flex-1" (onClick)="close()">
          Cancelar
        </app-ui-button>
        <app-ui-button variant="primary" class="flex-1" [loading]="isSaving()" (onClick)="save()">
          <ng-icon name="lucideCheck" class="mr-1"></ng-icon>
          Guardar Área
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

  formData: any = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  constructor() {
    effect(() => {
      const a = this.area();
      if (a) {
        this.formData = {
          nombre: a.nombre,
          descripcion: a.descripcion,
          activo: a.activo
        };
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }

  resetForm(): void {
    this.formData = {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    if (!this.formData.nombre || !this.formData.descripcion) {
      return;
    }
    this.onSaved.emit(this.formData);
  }
}
