import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService, AreaSistema } from '../../../core/services/catalog.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
  lucideBuilding2, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideCheckCircle2, 
  lucideXCircle,
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
      lucideHome, lucideBuilding2, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideCheckCircle2, lucideXCircle, lucideArrowRight, 
      lucideInfo, lucideLayoutGrid 
    })
  ],
  templateUrl: './areas.page.html',
  styleUrl: './areas.page.css'
})
export class AreasPage implements OnInit {
  private catalogService = inject(CatalogService);

  // State - usa CatalogService
  get allAreas() { return this.catalogService.areas(); }
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
  formData = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  ngOnInit(): void {
    // Áreas se cargan desde CatalogService (API)
    //elshacer está disponible a través del getter this.areas
  }

  filteredAreas = computed(() => {
    let result = this.allAreas;
    const s = this.searchTerm().toLowerCase();
    if (s) {
      result = result.filter((a: AreaSistema) => 
        a.nombre.toLowerCase().includes(s) || 
        a.descripcion.toLowerCase().includes(s)
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
    // TODO: Implementar API call para create/update
    this.showNotification('Área guardada (API no implementada)', 'success');
    this.showModal.set(false);
  }

  toggleStatus(area: AreaSistema): void {
    // TODO: Implementar API call para toggle
    this.showNotification(`Área ${area.activo ? 'desactivada' : 'activada'} (API no implementada)`, 'success');
  }

  deleteArea(area: AreaSistema): void {
    if (confirm(`¿Está seguro de eliminar el área ${area.nombre}?`)) {
      // TODO: Implementar API call para delete
      this.showNotification('Área eliminada (API no implementada)', 'error');
    }
  }
}