import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AreaSistema } from '../../../core/models/area.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideBuilding2, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideCircleCheck, 
  lucideCircleX,
  lucideArrowRight,
  lucideInfo,
  lucideLayoutGrid
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHouse, lucideBuilding2, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCircleCheck, lucideCircleX, lucideArrowRight, 
      lucideInfo, lucideLayoutGrid 
    })
  ],
  templateUrl: './areas.page.html',
  styleUrl: './areas.page.css'
})
export class AreasPage implements OnInit {
  private apiService = inject(ApiService);

  // State
  areas = signal<AreaSistema[]>([]);
  showModal = signal(false);
  editingArea = signal<AreaSistema | null>(null);

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
  formData: any = {
    nombre: '',
    descripcion: '',
    activo: true
  };

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

  openCreateModal(): void {
    this.editingArea.set(null);
    this.formData = {
      nombre: '',
      descripcion: '',
      activo: true
    };
    this.showModal.set(true);
  }

  openEditModal(area: AreaSistema): void {
    this.editingArea.set(area);
    this.formData = { ...area };
    this.showModal.set(true);
  }

  saveArea(): void {
    if (!this.formData.nombre || !this.formData.descripcion) {
      this.showNotification('Complete todos los campos obligatorios', 'error');
      return;
    }
    
    const payload: Partial<AreaSistema> = {
      nombre: this.formData.nombre,
      descripcion: this.formData.descripcion,
      activo: this.formData.activo
    };

    const editing = this.editingArea();
    if (editing) {
      this.apiService.updateArea(editing.id, payload).subscribe({
        next: () => {
          this.showNotification('Área actualizada exitosamente', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showNotification('Error al actualizar área', 'error')
      });
    } else {
      this.apiService.createArea(payload).subscribe({
        next: () => {
          this.showNotification('Área registrada exitosamente', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showNotification('Error al registrar área', 'error')
      });
    }
  }

  toggleStatus(area: AreaSistema): void {
    this.apiService.updateArea(area.id, { activo: !area.activo }).subscribe({
      next: () => {
        this.showNotification(`Área ${area.activo ? 'desactivada' : 'activada'} exitosamente`, 'success');
        this.loadData();
      },
      error: () => this.showNotification('Error al cambiar estado.', 'error')
    });
  }

  deleteArea(area: AreaSistema): void {
    if (confirm(`¿Está seguro de eliminar el área ${area.nombre}?`)) {
      this.apiService.deleteArea(area.id).subscribe({
        next: () => {
          this.showNotification('Área eliminada', 'success');
          this.loadData();
        },
        error: () => this.showNotification('Error al eliminar área', 'error')
      });
    }
  }
}