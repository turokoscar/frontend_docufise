import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { RolSistema } from '../../../core/models/rol.model';
import { MenuSistema } from '../../../core/models/menu.model';

// Shared UI Components
import { PageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { SectionLabelComponent } from '../../../shared/components/ui/section-label/section-label.component';
import { FilterPanelComponent } from '../../../shared/components/ui/filter-panel/filter-panel.component';

// UI Library Components
import { UiButtonComponent } from '../../../shared/components/ui/button/button.component';
import { UiBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { UiInputComponent } from '../../../shared/components/ui/input/input.component';
import { UiTableComponent } from '../../../shared/components/ui/table/table.component';
import { UiModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { UiTextareaComponent } from '../../../shared/components/ui/textarea/textarea.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucideShield, lucidePlus, lucideSearch, lucideChevronDown, 
  lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
  lucideInfo, lucideListChecks, lucideCheck, lucideX
} from '@ng-icons/lucide';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    NgIconComponent,
    PageHeaderComponent,
    SectionLabelComponent,
    FilterPanelComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiTableComponent,
    UiModalComponent,
    UiTextareaComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideShield, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideListChecks, lucideCheck, lucideX
    })
  ],
  templateUrl: './roles.page.html',
  styleUrl: './roles.page.css'
})
export class RolesPage implements OnInit {
  private apiService = inject(ApiService);

  // State
  roles = signal<RolSistema[]>([]);
  allMenus = signal<MenuSistema[]>([]);
  showModal = signal(false);
  editingRol = signal<RolSistema | null>(null);
  searchTerm = signal('');

  // Form Fields
  formData = {
    nombre: '',
    descripcion: '',
    activo: true,
    menuIds: [] as number[]
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getRoles().subscribe({
      next: (res) => this.roles.set(res)
    });
    this.apiService.getMenus().subscribe({
      next: (res) => this.allMenus.set(res.filter(m => m.activo))
    });
  }

  filteredRoles = computed(() => {
    let result = this.roles();
    const s = this.searchTerm().toLowerCase();
    if (s) {
      result = result.filter((r: RolSistema) => 
        (r.nombre?.toLowerCase().includes(s) || false) || 
        (r.descripcion?.toLowerCase().includes(s) || false)
      );
    }
    return result;
  });

  openCreateModal(): void {
    this.editingRol.set(null);
    this.formData = {
      nombre: '',
      descripcion: '',
      activo: true,
      menuIds: []
    };
    this.showModal.set(true);
  }

  openEditModal(rol: RolSistema): void {
    this.editingRol.set(rol);
    const mIds = rol.menus ? rol.menus.map(m => m.id) : (rol.menuIds || []);
    this.formData = { 
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      activo: rol.activo,
      menuIds: [...mIds]
    };
    this.showModal.set(true);
  }

  toggleMenuSelection(menuId: number): void {
    if (this.formData.menuIds.includes(menuId)) {
      this.formData.menuIds = this.formData.menuIds.filter((id) => id !== menuId);
    } else {
      this.formData.menuIds.push(menuId);
    }
  }

  saveRol(): void {
    if (!this.formData.nombre || !this.formData.descripcion) {
      this.showToast('Complete los campos obligatorios', 'error');
      return;
    }
    
    const payload: Partial<RolSistema> = {
      nombre: this.formData.nombre,
      descripcion: this.formData.descripcion,
      menuIds: this.formData.menuIds,
      activo: this.formData.activo
    };

    const editing = this.editingRol();
    if (editing) {
      this.apiService.updateRol(editing.id, payload).subscribe({
        next: () => {
          this.showToast('Rol actualizado', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showToast('Error al actualizar', 'error')
      });
    } else {
      this.apiService.createRol(payload).subscribe({
        next: () => {
          this.showToast('Rol registrado', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showToast('Error al registrar', 'error')
      });
    }
  }

  deleteRol(rol: RolSistema): void {
    Swal.fire({
      title: '¿Eliminar rol?',
      text: `¿Confirma eliminar el rol ${rol.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#AB2741'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteRol(rol.id).subscribe({
          next: () => {
            this.showToast('Rol eliminado', 'success');
            this.loadData();
          },
          error: () => this.showToast('Error al eliminar', 'error')
        });
      }
    });
  }

  getMenuNames(rol: RolSistema): string {
    if (rol.menus && rol.menus.length > 0) {
      return rol.menus.map(m => m.nombre).join(', ');
    }
    const mIds = rol.menuIds || [];
    if (mIds.length > 0) {
      return this.allMenus()
        .filter(m => mIds.includes(m.id))
        .map(m => m.nombre)
        .join(', ');
    }
    return '';
  }

  private showToast(message: string, icon: 'success' | 'error'): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000
    });
  }
}
