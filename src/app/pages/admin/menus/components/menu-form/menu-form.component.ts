import { Component, input, output, model, signal } from '@angular/core';
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
    >
      <div header class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <ng-icon name="lucideLayoutList" class="h-5 w-5 text-primary"></ng-icon>
        </div>
        <div>
          <h3 class="font-display text-lg font-bold">{{ menu() ? 'Editar Navegación' : 'Nueva Opción' }}</h3>
          <p class="text-xs text-muted-foreground font-body mt-0.5">
            {{ menu() ? 'Editando opción de menú' : 'Complete los campos para crear una nueva opción' }}
          </p>
        </div>
      </div>

      <div body class="space-y-6">
        <app-ui-input 
          label="Nombre Visible" 
          placeholder="Ej: Reportes Ejecutivos"
          [(ngModel)]="nombre" 
          name="nombre"
        ></app-ui-input>
        
        <app-ui-input 
          label="Ruta Relativa" 
          placeholder="/reportes"
          [(ngModel)]="ruta" 
          name="ruta"
        ></app-ui-input>

        <app-ui-input 
          label="Icono (Lucide)" 
          placeholder="lucidePenTool"
          [(ngModel)]="icono" 
          name="icono"
        ></app-ui-input>

        <app-ui-input 
          label="Orden de Visualización" 
          type="number"
          [(ngModel)]="orden" 
          name="orden"
        ></app-ui-input>

        <div class="flex items-center gap-3 p-1 group">
          <input 
            type="checkbox" 
            [(ngModel)]="activo" 
            name="activo" 
            id="menu_activo" 
            class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          >
          <label for="menu_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
            Opción visible en el menú
          </label>
        </div>
      </div>

      <div footer class="flex justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button variant="primary" [loading]="isSaving()" (onClick)="save()">
          <ng-icon name="lucideCheck" class="mr-1"></ng-icon>
          {{ menu() ? 'Actualizar' : 'Crear' }}
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
  nombre = model('');
  ruta = model('');
  icono = model('');
  orden = model(1);
  activo = model(true);

  save(): void {
    if (!this.nombre() || !this.ruta()) {
      return;
    }

    const formData = {
      nombre: this.nombre(),
      ruta: this.ruta(),
      icono: this.icono(),
      orden: this.orden(),
      activo: this.activo()
    };

    this.onSaved.emit(formData);
  }

  close(): void {
    this.onClose.emit();
  }
}
