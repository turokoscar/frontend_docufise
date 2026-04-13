import { Component, input, output, signal, effect } from '@angular/core';
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
      [paddingBody]="false"
    >
      <div header class="bg-primary -m-6 mb-0 p-8 text-primary-foreground text-center relative rounded-t-2xl">
        <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20 backdrop-blur-md">
          <ng-icon name="lucideShield" class="text-3xl"></ng-icon>
        </div>
        <h3 class="font-display text-2xl font-extrabold tracking-tight">
          {{ rol() ? 'Editar Rol' : 'Nuevo Rol' }}
        </h3>
        <p class="text-white/70 text-sm font-body mt-2">Configuración de perfiles y permisos de acceso</p>
      </div>

      <div body class="p-8 space-y-6">
        <div class="space-y-6">
          <app-ui-input 
            label="Nombre del Rol" 
            placeholder="Ej: ESPECIALISTA_FIRMANTE"
            [(ngModel)]="formData.nombre" 
            name="nombre"
          ></app-ui-input>
          
          <app-ui-textarea 
            label="Descripción del Perfil" 
            placeholder="Indique las responsabilidades de este rol..."
            [(ngModel)]="formData.descripcion" 
            name="descripcion"
            class="min-h-[80px]"
          ></app-ui-textarea>

          <div class="space-y-3">
            <label class="font-ui text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Permisos de Navegación (Menús)</label>
            <div class="grid grid-cols-2 gap-2 bg-muted/30 p-4 rounded-2xl border border-border/50">
              @for (menu of menus(); track menu.id) {
                <label class="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/20 group">
                  <input 
                    type="checkbox" 
                    [checked]="formData.menuIds.includes(menu.id)"
                    (change)="toggleMenuSelection(menu.id)"
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
              [(ngModel)]="formData.activo" 
              name="activo" 
              id="rol_activo" 
              class="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
            >
            <label for="rol_activo" class="font-ui text-[11px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
              Rol habilitado para asignación de usuarios
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
          Guardar Perfil
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

  formData: any = {
    nombre: '',
    descripcion: '',
    activo: true,
    menuIds: [] as number[]
  };

  constructor() {
    effect(() => {
      const r = this.rol();
      if (r) {
        const mIds = r.menus ? r.menus.map(m => m.id) : (r.menuIds || []);
        this.formData = {
          nombre: r.nombre,
          descripcion: r.descripcion,
          activo: r.activo,
          menuIds: [...mIds]
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
      activo: true,
      menuIds: []
    };
  }

  toggleMenuSelection(menuId: number): void {
    if (this.formData.menuIds.includes(menuId)) {
      this.formData.menuIds = this.formData.menuIds.filter((id: number) => id !== menuId);
    } else {
      this.formData.menuIds.push(menuId);
    }
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
