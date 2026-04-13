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
import { UiDropdownComponent } from '../../../shared/components/ui/dropdown/dropdown.component';
import { MenuFormComponent } from './components/menu-form/menu-form.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucideLayoutList, lucidePlus, lucideSearch, lucideChevronDown, 
  lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
  lucideInfo, lucideMove, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
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
    UiModalComponent,
    UiDropdownComponent,
    MenuFormComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideLayoutList, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideMove, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
    })
  ],
  templateUrl: './menus.page.html',
  styleUrl: './menus.page.css'
})
export class MenusPage implements OnInit {
  private apiService = inject(ApiService);

  menus = signal<MenuSistema[]>([]);
  showModal = signal(false);
  editingMenu = signal<MenuSistema | null>(null);
  searchTerm = signal('');

  currentPage = signal(1);
  pageSize = signal(10);

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

  totalPages = computed(() => Math.ceil(this.filteredMenus().length / this.pageSize()));
  
  paginatedMenus = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredMenus().slice(start, start + this.pageSize());
  });

  paginatedPages = computed(() => {
    const total = this.totalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  });

  paginationSummary = computed(() => {
    const total = this.filteredMenus().length;
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `Mostrando ${start}-${end} de ${total} registros`;
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  updateFilters(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  openCreateModal(): void {
    this.editingMenu.set(null);
    this.showModal.set(true);
  }

  openEditModal(menu: MenuSistema): void {
    this.editingMenu.set(menu);
    this.showModal.set(true);
  }

  saveMenu(formData: any): void {
    if (!formData.nombre || !formData.ruta) {
      this.showToast('Complete los campos obligatorios', 'error');
      return;
    }

    const payload: Partial<MenuSistema> = {
      nombre: formData.nombre,
      ruta: formData.ruta,
      icono: formData.icono,
      orden: formData.orden,
      activo: formData.activo
    };

    const editing = this.editingMenu();
    if (editing) {
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
