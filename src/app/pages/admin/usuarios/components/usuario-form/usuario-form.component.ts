import { Component, input, output, signal, computed, effect } from '@angular/core';
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
      [paddingBody]="false"
    >
      <div header class="bg-primary -m-6 mb-0 p-8 text-primary-foreground text-center relative rounded-t-2xl">
        <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20 backdrop-blur-md">
          <ng-icon name="lucideUsers" class="text-3xl"></ng-icon>
        </div>
        <h3 class="font-display text-2xl font-extrabold tracking-tight">
          {{ usuario() ? 'Editar Perfil' : 'Nuevo Usuario' }}
        </h3>
        <p class="text-white/70 text-sm font-body mt-2">Control de accesos y configuración de perfil</p>
      </div>

      <div body class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <app-ui-input 
            label="Nombre Completo" 
            [(ngModel)]="formData.nombreCompleto" 
            name="nombreCompleto"
            placeholder="Ej: Juan Pérez"
          ></app-ui-input>

          <app-ui-input 
            label="Usuario de Red" 
            [(ngModel)]="formData.nombreUsuario" 
            name="nombreUsuario"
            placeholder="jperez"
          ></app-ui-input>

          <app-ui-input 
            label="Correo Electrónico" 
            [(ngModel)]="formData.correo" 
            name="correo"
            placeholder="ejemplo@fise.gob.pe"
            class="md:col-span-2"
          ></app-ui-input>

          <app-ui-select 
            label="Rol de Sistema" 
            [(ngModel)]="formData.rolId" 
            name="rolId"
          >
            @for (rol of roles(); track rol.id) {
              <option [value]="rol.id">{{ rol.nombre }}</option>
            }
          </app-ui-select>

          <app-ui-select 
            label="Área Asignada" 
            [(ngModel)]="formData.areaId" 
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
            [(ngModel)]="formData.activo" 
            name="activo" 
            id="user_activo" 
            class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          >
          <label for="user_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
            Cuenta habilitada para el acceso al sistema
          </label>
        </div>
      </div>

      <div footer class="flex gap-3">
        <app-ui-button variant="outline" class="flex-1" (onClick)="close()">
          Cancelar
        </app-ui-button>
        <app-ui-button variant="primary" class="flex-1" [loading]="isSaving()" (onClick)="save()">
          <ng-icon name="lucideCheck" class="mr-1"></ng-icon>
          Guardar Usuario
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
  onSaved = output<void>();

  isSaving = signal(false);

  formData: any = {
    nombreCompleto: '',
    nombreUsuario: '',
    correo: '',
    rolId: null,
    areaId: null,
    activo: true
  };

  constructor() {
    effect(() => {
      const u = this.usuario();
      if (u) {
        this.formData = {
          nombreCompleto: u.nombreCompleto,
          nombreUsuario: u.nombreUsuario,
          correo: u.correo,
          rolId: u.rolId,
          areaId: u.areaId,
          activo: u.activo
        };
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }

  resetForm(): void {
    this.formData = {
      nombreCompleto: '',
      nombreUsuario: '',
      correo: '',
      rolId: this.roles().length > 0 ? this.roles()[0].id : null,
      areaId: this.areas().length > 0 ? this.areas()[0].id : null,
      activo: true
    };
  }

  close(): void {
    this.onClose.emit();
  }

  save(): void {
    if (!this.formData.nombreCompleto || !this.formData.nombreUsuario) {
      return;
    }
    this.onSaved.emit(this.formData);
  }
}
