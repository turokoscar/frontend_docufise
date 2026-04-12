import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
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

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucideLayoutList, lucidePlus, lucideSearch, lucideChevronDown, 
  lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
  lucideInfo, lucideMove, lucideCheck, lucideX
} from '@ng-icons/lucide';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-menus',
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
    UiModalComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideLayoutList, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideMove, lucideCheck, lucideX
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
    return [...result].sort((a, b) => a.orden - b.orden);
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
      this.showToast('Complete los campos obligatorios', 'error');
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
      // Usamos lógica reactiva local si el servicio no está completamente mapeado en el backend
      this.menus.update((prev: MenuSistema[]) => 
        prev.map(m => m.id === editing.id ? { ...m, ...payload } as MenuSistema : m)
      );
      this.showToast('Menú actualizado correctamente', 'success');
      this.showModal.set(false);
    } else {
      const newId = Math.max(...this.menus().map(m => m.id), 0) + 1;
      this.menus.update((prev: MenuSistema[]) => [...prev, { ...payload, id: newId } as MenuSistema]);
      this.showToast('Menú registrado correctamente', 'success');
      this.showModal.set(false);
    }
  }

  toggleStatus(menu: MenuSistema): void {
    this.menus.update((prev: MenuSistema[]) => 
      prev.map(m => m.id === menu.id ? { ...m, activo: !m.activo } : m)
    );
    this.showToast(`Menú ${menu.activo ? 'desactivado' : 'activado'}`, 'success');
  }

  deleteMenu(menu: MenuSistema): void {
    Swal.fire({
      title: '¿Eliminar opción de menú?',
      text: `¿Confirma eliminar ${menu.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#AB2741'
    }).then((result) => {
      if (result.isConfirmed) {
        this.menus.update((prev: MenuSistema[]) => prev.filter(m => m.id !== menu.id));
        this.showToast('Menú eliminado', 'success');
      }
    });
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
