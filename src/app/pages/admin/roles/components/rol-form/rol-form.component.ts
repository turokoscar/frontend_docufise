import { Component, input, output, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideShield, lucideCheck } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../../shared/components/ui/modal/modal.component';
import { UiInputComponent } from '../../../../../shared/components/ui/input/input.component';
import { UiTextareaComponent } from '../../../../../shared/components/ui/textarea/textarea.component';
import { UiButtonComponent } from '../../../../../shared/components/ui/button/button.component';

import { RolSistema } from '../../../../../core/models/rol.model';
import { MenuSistema } from '../../../../../core/models/menu.model';

@Component({
  selector: 'app-rol-form',
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
    provideIcons({ lucideShield, lucideCheck })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-xl"
    >
      <div header class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <ng-icon name="lucideShield" class="h-5 w-5 text-primary"></ng-icon>
        </div>
        <div>
          <h3 class="font-display text-lg font-bold">{{ rol() ? 'Editar Rol' : 'Nuevo Rol' }}</h3>
          <p class="text-xs text-muted-foreground font-body mt-0.5">
            {{ rol() ? 'Editando rol existente' : 'Complete los campos para registrar un nuevo rol' }}
          </p>
        </div>
      </div>

      <div body class="space-y-6">
        <app-ui-input 
          label="Nombre del Rol" 
          placeholder="Ej: ESPECIALISTA_FIRMANTE"
          [(ngModel)]="nombre" 
          name="nombre"
        ></app-ui-input>
        
        <app-ui-textarea 
          label="Descripción del Perfil" 
          placeholder="Indique las responsabilidades de este rol..."
          [(ngModel)]="descripcion" 
          name="descripcion"
        ></app-ui-textarea>

        <div class="space-y-3">
          <label class="font-ui text-[10px] font-bold text-primary uppercase tracking-widest">Permisos de Navegación (Menús)</label>
          <div class="grid grid-cols-2 gap-2 bg-muted/30 p-4 rounded-xl border border-border/50">
            @for (menu of menus(); track menu.id) {
              <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/20 group">
                <input 
                  type="checkbox" 
                  [checked]="menuIds().includes(menu.id)"
                  (change)="toggleMenu(menu.id)"
                  class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                >
                <div class="flex flex-col">
                  <span class="text-[11px] font-bold font-ui text-foreground group-hover:text-primary transition-colors">{{ menu.nombre }}</span>
                  <span class="text-[9px] text-muted-foreground uppercase tracking-tighter">{{ menu.ruta }}</span>
                </div>
              </label>
            }
          </div>
        </div>

        <div class="flex items-center gap-3 p-1 group">
          <input 
            type="checkbox" 
            [(ngModel)]="activo" 
            name="activo" 
            id="rol_activo" 
            class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          >
          <label for="rol_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
            Rol habilitado para asignación de usuarios
          </label>
        </div>
      </div>

      <div footer class="flex justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button variant="primary" [loading]="isSaving()" (onClick)="save()">
          <ng-icon name="lucideCheck" class="mr-1"></ng-icon>
          {{ rol() ? 'Actualizar' : 'Guardar' }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class RolFormComponent {
  isOpen = input<boolean>(false);
  rol = input<RolSistema | null>(null);
  menus = input<MenuSistema[]>([]);

  onClose = output<void>();
  onSaved = output<any>();

  isSaving = signal(false);
  nombre = model('');
  descripcion = model('');
  menuIds = model<number[]>([]);
  activo = model(true);

  toggleMenu(menuId: number): void {
    const current = this.menuIds();
    if (current.includes(menuId)) {
      this.menuIds.set(current.filter(id => id !== menuId));
    } else {
      this.menuIds.set([...current, menuId]);
    }
  }

  save(): void {
    if (!this.nombre() || !this.descripcion()) {
      return;
    }

    const formData = {
      nombre: this.nombre(),
      descripcion: this.descripcion(),
      menuIds: this.menuIds(),
      activo: this.activo()
    };

    this.onSaved.emit(formData);
  }

  close(): void {
    this.onClose.emit();
  }
}
