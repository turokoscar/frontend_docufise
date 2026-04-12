import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { RolSistema } from '../../../core/models/rol.model';
import { MenuSistema } from '../../../core/models/menu.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideShield, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideCircleCheck, 
  lucideCircleX,
  lucideArrowRight,
  lucideInfo,
  lucideListChecks
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHouse, lucideShield, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2,      lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideListChecks 
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

  // Toast
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  // Filters
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
    // Extraer los menuIds para el toggle, si existen
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
      this.showNotification('Complete todos los campos obligatorios', 'error');
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
          this.showNotification('Rol actualizado exitosamente', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showNotification('Error al actualizar rol', 'error')
      });
    } else {
      this.apiService.createRol(payload).subscribe({
        next: () => {
          this.showNotification('Rol registrado exitosamente', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showNotification('Error al registrar rol', 'error')
      });
    }
  }

  deleteRol(rol: RolSistema): void {
    if (confirm(`¿Está seguro de eliminar el rol ${rol.nombre}?`)) {
      this.apiService.deleteRol(rol.id).subscribe({
        next: () => {
          this.showNotification('Rol eliminado', 'success');
          this.loadData();
        },
        error: () => this.showNotification('Error al eliminar rol', 'error')
      });
    }
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
}