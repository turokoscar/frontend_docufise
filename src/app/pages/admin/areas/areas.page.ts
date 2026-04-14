import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AreaSistema } from '../../../core/models/area.model';

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
import { AreaFormComponent } from './components/area-form/area-form.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucideBuilding2, lucidePlus, lucideSearch, lucideChevronDown, 
  lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
  lucideInfo, lucideLayoutGrid, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
} from '@ng-icons/lucide';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    NgIconComponent,
    PageHeaderComponent,
    FilterPanelComponent,
    SectionLabelComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiTableComponent,
    UiModalComponent,
    UiTextareaComponent,
    UiDropdownComponent,
    AreaFormComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideBuilding2, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideLayoutGrid, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
    })
  ],
  templateUrl: './areas.page.html',
  styleUrl: './areas.page.css'
})
export class AreasPage implements OnInit {
  private apiService = inject(ApiService);

  areas = signal<AreaSistema[]>([]);
  showModal = signal(false);
  editingArea = signal<AreaSistema | null>(null);
  searchTerm = signal('');

  currentPage = signal(1);
  pageSize = signal(10);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAreas().subscribe({
      next: (res) => this.areas.set(res)
    });
  }

  filteredAreas = computed(() => {
    let result = this.areas();
    const s = this.searchTerm().toLowerCase();
    if (s) {
      result = result.filter((a: AreaSistema) => 
        (a.nombre?.toLowerCase().includes(s) || false) || 
        (a.descripcion?.toLowerCase().includes(s) || false)
      );
    }
    return result;
  });

  totalPages = computed(() => Math.ceil(this.filteredAreas().length / this.pageSize()));
  
  paginatedAreas = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredAreas().slice(start, start + this.pageSize());
  });

  paginatedPages = computed(() => {
    const total = this.totalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  });

  paginationSummary = computed(() => {
    const total = this.filteredAreas().length;
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
    this.editingArea.set(null);
    this.showModal.set(true);
  }

  openEditModal(area: AreaSistema): void {
    this.editingArea.set(area);
    this.showModal.set(true);
  }

  saveArea(formData: any): void {
    if (!formData.nombre || !formData.descripcion) {
      this.showToast('Complete todos los campos obligatorios', 'error');
      return;
    }
    
    const payload: Partial<AreaSistema> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      activo: formData.activo
    };

    const editing = this.editingArea();
    if (editing) {
      this.apiService.updateArea(editing.id, payload).subscribe({
        next: () => {
          this.showToast('Área actualizada', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showToast('Error al actualizar', 'error')
      });
    } else {
      this.apiService.createArea(payload).subscribe({
        next: () => {
          this.showToast('Área registrada', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showToast('Error al registrar', 'error')
      });
    }
  }

  toggleStatus(area: AreaSistema): void {
    this.apiService.updateArea(area.id, { activo: !area.activo }).subscribe({
      next: () => {
        this.showToast(`Área ${area.activo ? 'desactivada' : 'activada'}`, 'success');
        this.loadData();
      },
      error: () => this.showToast('Error al cambiar estado.', 'error')
    });
  }

  deleteArea(area: AreaSistema): void {
    Swal.fire({
      title: '¿Eliminar área?',
      text: `¿Está seguro de eliminar ${area.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#aa2942'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteArea(area.id).subscribe({
          next: () => {
            this.showToast('Área eliminada', 'success');
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
