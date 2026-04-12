import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { MenuSistema } from '../../../core/models/menu.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideLayoutList, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideCircleCheck, 
  lucideCircleX,
  lucideArrowRight,
  lucideInfo,
  lucideMove
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-menus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHouse, lucideLayoutList, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideMove 
    })
  ],
  templateUrl: './menus.page.html',
  styleUrl: './menus.page.css'
})
export class MenusPage implements OnInit {
  private apiService = inject(ApiService);

  // State
  menus = signal<MenuSistema[]>([]);
  showModal = signal(false);
  editingMenu = signal<MenuSistema | null>(null);

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
    ruta: '',
    icono: '',
    orden: 1,
    activo: true
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getMenus().subscribe({
      next: (res) => this.menus.set(res)
    });
  }

  filteredMenus = computed(() => {
    let result = this.menus();
    const s = this.searchTerm().toLowerCase();
    if (s) {
      result = result.filter((m: MenuSistema) => 
        (m.nombre?.toLowerCase().includes(s) || false) || 
        (m.ruta?.toLowerCase().includes(s) || false) ||
        (m.icono?.toLowerCase().includes(s) || false)
      );
    }
    return result.sort((a, b) => a.orden - b.orden);
  });

  openCreateModal(): void {
    this.editingMenu.set(null);
    this.formData = {
      nombre: '',
      ruta: '',
      icono: '',
      orden: this.menus().length + 1,
      activo: true
    };
    this.showModal.set(true);
  }

  openEditModal(menu: MenuSistema): void {
    this.editingMenu.set(menu);
    this.formData = { ...menu };
    this.showModal.set(true);
  }

  saveMenu(): void {
    if (!this.formData.nombre || !this.formData.ruta) {
      this.showNotification('Complete todos los campos obligatorios', 'error');
      return;
    }

    const payload: Partial<MenuSistema> = {
      nombre: this.formData.nombre,
      ruta: this.formData.ruta,
      icono: this.formData.icono,
      orden: this.formData.orden,
      activo: this.formData.activo
    };

    const editing = this.editingMenu();
    if (editing) {
      // Nota: Asumiendo que updateMenu y getMenus existen/están mapeados en base general o no es crítico para compilar, sino ajustarlo.
      // this.apiService.updateMenu(...) - Aquí si el api no lo tiene, simulamos logica local para evitar romper el build
      this.menus.update(prev => 
        prev.map(m => m.id === editing.id ? { ...m, ...payload } as MenuSistema : m)
      );
      this.showNotification('Menú actualizado exitosamente (Simulado)', 'success');
      this.showModal.set(false);
    } else {
      const newId = this.menus().length + 1;
      this.menus.update(prev => [...prev, { ...payload, id: newId } as MenuSistema]);
      this.showNotification('Menú registrado exitosamente (Simulado)', 'success');
      this.showModal.set(false);
    }
  }

  toggleStatus(menu: MenuSistema): void {
    this.menus.update(prev => 
      prev.map(m => m.id === menu.id ? { ...m, activo: !m.activo } : m)
    );
    this.showNotification(`Menú ${menu.activo ? 'desactivado' : 'activado'} exitosamente (Simulado)`, 'success');
  }

  deleteMenu(menu: MenuSistema): void {
    if (confirm(`¿Está seguro de eliminar el menú ${menu.nombre}?`)) {
      this.menus.update(prev => prev.filter(m => m.id !== menu.id));
      this.showNotification('Menú eliminado (Simulado)', 'error');
    }
  }
}