import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { MenuSistema } from '../../../core/models/user.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
  lucideLayoutList, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideCheckCircle2, 
  lucideXCircle,
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
      lucideHome, lucideLayoutList, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCheckCircle2, lucideXCircle, lucideArrowRight, 
      lucideInfo, lucideMove 
    })
  ],
  templateUrl: './menus.page.html',
  styleUrl: './menus.page.css'
})
export class MenusPage implements OnInit {
  private dataService = inject(DataService);

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
    this.menus.set(this.dataService.menusMock);
  }

  filteredMenus = computed(() => {
    let result = this.menus();
    const s = this.searchTerm().toLowerCase();
    if (s) {
      result = result.filter((m: MenuSistema) => 
        m.nombre.toLowerCase().includes(s) || 
        m.ruta.toLowerCase().includes(s) ||
        m.icono.toLowerCase().includes(s)
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
    const editing = this.editingMenu();
    if (editing) {
      this.menus.update((prev: MenuSistema[]) => 
        prev.map((m: MenuSistema) => m.id === editing.id ? { ...m, ...this.formData } : m)
      );
      this.showNotification('Menú actualizado exitosamente', 'success');
    } else {
      const newId = `MNU-${(this.menus().length + 1).toString().padStart(2, '0')}`;
      this.menus.update((prev: MenuSistema[]) => [...prev, { ...this.formData, id: newId } as MenuSistema]);
      this.showNotification('Menú registrado exitosamente', 'success');
    }
    this.showModal.set(false);
  }

  toggleStatus(menu: MenuSistema): void {
    this.menus.update(prev => 
      prev.map(m => m.id === menu.id ? { ...m, activo: !m.activo } : m)
    );
    this.showNotification(`Menú ${menu.activo ? 'desactivado' : 'activado'} exitosamente`, 'success');
  }

  deleteMenu(menu: MenuSistema): void {
    if (confirm(`¿Está seguro de eliminar el acceso ${menu.nombre}?`)) {
      this.menus.update(prev => prev.filter(m => m.id !== menu.id));
      this.showNotification('Menú eliminado', 'error');
    }
  }
}