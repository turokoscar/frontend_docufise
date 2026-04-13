import { Component, input, output, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucideCheck } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../../shared/components/ui/modal/modal.component';
import { UiInputComponent } from '../../../../../shared/components/ui/input/input.component';
import { UiSelectComponent } from '../../../../../shared/components/ui/select/select.component';
import { UiButtonComponent } from '../../../../../shared/components/ui/button/button.component';

import { UsuarioSistema } from '../../../../../core/models/usuario.model';
import { AreaSistema } from '../../../../../core/models/area.model';
import { RolSistema } from '../../../../../core/models/rol.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    UiModalComponent,
    UiInputComponent,
    UiSelectComponent,
    UiButtonComponent
  ],
  providers: [
    provideIcons({ lucideUsers, lucideCheck })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-xl"
    >
      <div header class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <ng-icon name="lucideUsers" class="h-5 w-5 text-primary"></ng-icon>
        </div>
        <div>
          <h3 class="font-display text-lg font-bold">{{ usuario() ? 'Editar Perfil' : 'Nuevo Usuario' }}</h3>
          <p class="text-xs text-muted-foreground font-body mt-0.5">
            {{ usuario() ? 'Editando perfil de usuario' : 'Complete los campos para registrar un nuevo usuario' }}
          </p>
        </div>
      </div>

      <div body class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-ui-input 
            label="Nombre Completo" 
            [(ngModel)]="nombreCompleto" 
            name="nombreCompleto"
            placeholder="Ej: Juan Pérez"
          ></app-ui-input>

          <app-ui-input 
            label="Usuario de Red" 
            [(ngModel)]="nombreUsuario" 
            name="nombreUsuario"
            placeholder="jperez"
          ></app-ui-input>

          <app-ui-input 
            label="Correo Electrónico" 
            [(ngModel)]="correo" 
            name="correo"
            placeholder="ejemplo@fise.gob.pe"
            class="md:col-span-2"
          ></app-ui-input>

          <app-ui-select 
            label="Rol de Sistema" 
            [value]="rolId() !== null ? '' + rolId() : ''"
            (onValueChange)="onRolIdChange($event)"
            name="rolId"
          >
            @for (rol of roles(); track rol.id) {
              <option [value]="rol.id">{{ rol.nombre }}</option>
            }
          </app-ui-select>

          <app-ui-select 
            label="Área Asignada" 
            [value]="areaId() !== null ? '' + areaId() : ''"
            (onValueChange)="onAreaIdChange($event)"
            name="areaId"
          >
            @for (area of areas(); track area.id) {
              <option [value]="area.id">{{ area.nombre }}</option>
            }
          </app-ui-select>
        </div>

        <div class="flex items-center gap-3 p-1 group">
          <input 
            type="checkbox" 
            [(ngModel)]="activo" 
            name="activo" 
            id="user_activo" 
            class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          >
          <label for="user_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
            Cuenta habilitada para el acceso al sistema
          </label>
        </div>
      </div>

      <div footer class="flex justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button variant="primary" [loading]="isSaving()" (onClick)="save()">
          <ng-icon name="lucideCheck" class="mr-1"></ng-icon>
          {{ usuario() ? 'Actualizar' : 'Guardar' }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class UsuarioFormComponent {
  isOpen = input<boolean>(false);
  usuario = input<UsuarioSistema | null>(null);
  roles = input<RolSistema[]>([]);
  areas = input<AreaSistema[]>([]);

  onClose = output<void>();
  onSaved = output<any>();

  isSaving = signal(false);
  nombreCompleto = model('');
  nombreUsuario = model('');
  correo = model('');
  rolId = model<number | null>(null);
  areaId = model<number | null>(null);
  activo = model(true);

  onRolIdChange(value: string): void {
    this.rolId.set(value ? Number(value) : null);
  }

  onAreaIdChange(value: string): void {
    this.areaId.set(value ? Number(value) : null);
  }

  save(): void {
    if (!this.nombreCompleto() || !this.nombreUsuario()) {
      return;
    }

    const formData = {
      nombreCompleto: this.nombreCompleto(),
      nombreUsuario: this.nombreUsuario(),
      correo: this.correo(),
      rolId: this.rolId(),
      areaId: this.areaId(),
      activo: this.activo()
    };

    this.onSaved.emit(formData);
  }

  close(): void {
    this.onClose.emit();
  }
}
