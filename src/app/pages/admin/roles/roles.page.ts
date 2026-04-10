import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { RolSistema } from '../../../core/models/user.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
  lucideShield, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideCheckCircle2, 
  lucideXCircle,
  lucideArrowRight,
  lucideInfo,
  lucideListChecks
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHome, lucideShield, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCheckCircle2, lucideXCircle, lucideArrowRight, 
      lucideInfo, lucideListChecks 
    })
  ],
  templateUrl: './roles.page.html',
  styleUrl: './roles.page.css'
})
export class RolesPage implements OnInit {
  private dataService = inject(DataService);

  // State
  roles = signal<RolSistema[]>([]);
  allMenus = this.dataService.menusMock;
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
    nombre: '' as any,
    descripcion: '',
    menus: [] as string[]
  };

  ngOnInit(): void {
    this.roles.set(this.dataService.rolesMock);
  }

  filteredRoles = computed(() => {
    let result = this.roles();
    const s = this.searchTerm().toLowerCase();
    if (s) {
      result = result.filter((r: RolSistema) => 
        r.nombre.toLowerCase().includes(s) || 
        r.descripcion.toLowerCase().includes(s)
      );
    }
    return result;
  });

  openCreateModal(): void {
    this.editingRol.set(null);
    this.formData = {
      nombre: '' as any,
      descripcion: '',
      menus: []
    };
    this.showModal.set(true);
  }

  openEditModal(rol: RolSistema): void {
    this.editingRol.set(rol);
    this.formData = { ...rol, menus: [...rol.menus] };
    this.showModal.set(true);
  }

  toggleMenuSelection(menuId: string): void {
    if (this.formData.menus.includes(menuId)) {
      this.formData.menus = this.formData.menus.filter((id: string) => id !== menuId);
    } else {
      this.formData.menus.push(menuId);
    }
  }

  saveRol(): void {
    if (!this.formData.nombre || !this.formData.descripcion) {
      this.showNotification('Complete todos los campos obligatorios', 'error');
      return;
    }
    if (this.formData.menus.length === 0) {
      this.showNotification('Seleccione al menos un menú para el rol', 'error');
      return;
    }
    const editing = this.editingRol();
    if (editing) {
      this.roles.update((prev: RolSistema[]) => 
        prev.map((r: RolSistema) => r.id === editing.id ? { ...r, ...this.formData } : r)
      );
      this.showNotification('Rol actualizado exitosamente', 'success');
    } else {
      const newId = `ROL-${(this.roles().length + 1).toString().padStart(2, '0')}`;
      this.roles.update((prev: RolSistema[]) => [...prev, { ...this.formData, id: newId } as RolSistema]);
      this.showNotification('Rol registrado exitosamente', 'success');
    }
    this.showModal.set(false);
  }

  deleteRol(rol: RolSistema): void {
    if (confirm(`¿Está seguro de eliminar el rol ${rol.nombre}?`)) {
      this.roles.update(prev => prev.filter(r => r.id !== rol.id));
      this.showNotification('Rol eliminado', 'error');
    }
  }

  getMenuNames(menuIds: string[]): string {
    return this.allMenus
      .filter(m => menuIds.includes(m.id))
      .map(m => m.nombre)
      .join(', ');
  }
}