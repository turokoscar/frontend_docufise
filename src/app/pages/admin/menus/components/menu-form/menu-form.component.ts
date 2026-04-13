import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLayoutList, lucideCheck } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../../shared/components/ui/modal/modal.component';
import { UiInputComponent } from '../../../../../shared/components/ui/input/input.component';
import { UiButtonComponent } from '../../../../../shared/components/ui/button/button.component';

import { MenuSistema } from '../../../../../core/models/menu.model';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    UiModalComponent,
    UiInputComponent,
    UiButtonComponent
  ],
  providers: [
    provideIcons({ lucideLayoutList, lucideCheck })
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
          <ng-icon [name]="formData.icono || 'lucideLayoutList'" class="text-3xl"></ng-icon>
        </div>
        <h3 class="font-display text-2xl font-extrabold tracking-tight">
          {{ menu() ? 'Editar Navegación' : 'Nueva Opción' }}
        </h3>
        <p class="text-white/70 text-sm font-body mt-2">Personalización de rutas y componentes base</p>
      </div>

      <div body class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-ui-input 
            label="Nombre Visible" 
            placeholder="Ej: Reportes Ejecutivos"
            [(ngModel)]="formData.nombre" 
            name="nombre"
            class="md:col-span-2"
          ></app-ui-input>
          
          <app-ui-input 
            label="Ruta Relativa" 
            placeholder="/reportes"
            [(ngModel)]="formData.ruta" 
            name="ruta"
          ></app-ui-input>

          <app-ui-input 
            label="Icono (Lucide)" 
            placeholder="lucidePenTool"
            [(ngModel)]="formData.icono" 
            name="icono"
          ></app-ui-input>

          <app-ui-input 
            label="Orden de Visualización" 
            type="number"
            [(ngModel)]="formData.orden" 
            name="orden"
          ></app-ui-input>

          <div class="flex flex-col justify-end pb-1 px-1">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                [(ngModel)]="formData.activo" 
                name="activo" 
                class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              >
              <span class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Opción Visible</span>
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
          {{ menu() ? 'Actualizar Menú' : 'Crear Menú' }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class MenuFormComponent {
  isOpen = input<boolean>(false);
  menu = input<MenuSistema | null>(null);
  nextOrden = input<number>(1);

  onClose = output<void>();
  onSaved = output<any>();

  isSaving = signal(false);

  formData: any = {
    nombre: '',
    ruta: '',
    icono: '',
    orden: 1,
    activo: true
  };

  constructor() {
    effect(() => {
      const m = this.menu();
      if (m) {
        this.formData = { ...m };
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }

  resetForm(): void {
    this.formData = {
      nombre: '',
      ruta: '',
      icono: '',
      orden: this.nextOrden(),
      activo: true
    };
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    if (!this.formData.nombre || !this.formData.ruta) {
      return;
    }
    this.onSaved.emit(this.formData);
  }
}
