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
import { UiDropdownComponent } from '../../../shared/components/ui/dropdown/dropdown.component';
import { RolFormComponent } from './components/rol-form/rol-form.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucideShield, lucidePlus, lucideSearch, lucideChevronDown, 
  lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
  lucideInfo, lucideListChecks, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
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
    UiTextareaComponent,
    UiDropdownComponent,
    RolFormComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideShield, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideListChecks, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
    })
  ],
  templateUrl: './roles.page.html',
  styleUrl: './roles.page.css'
})
export class RolesPage implements OnInit {
  private apiService = inject(ApiService);

  roles = signal<RolSistema[]>([]);
  allMenus = signal<MenuSistema[]>([]);
  showModal = signal(false);
  editingRol = signal<RolSistema | null>(null);
  searchTerm = signal('');

  currentPage = signal(1);
  pageSize = signal(10);

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

  totalPages = computed(() => Math.ceil(this.filteredRoles().length / this.pageSize()));
  
  paginatedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredRoles().slice(start, start + this.pageSize());
  });

  paginatedPages = computed(() => {
    const total = this.totalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  });

  paginationSummary = computed(() => {
    const total = this.filteredRoles().length;
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
    this.editingRol.set(null);
    this.showModal.set(true);
  }

  openEditModal(rol: RolSistema): void {
    this.editingRol.set(rol);
    this.showModal.set(true);
  }

  saveRol(formData: any): void {
    if (!formData.nombre || !formData.descripcion) {
      this.showToast('Complete los campos obligatorios', 'error');
      return;
    }
    
    const payload: Partial<RolSistema> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      menuIds: formData.menuIds,
      activo: formData.activo
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
      confirmButtonColor: '#aa2942'
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
