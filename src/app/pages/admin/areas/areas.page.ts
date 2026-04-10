import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AreaSistema } from '../../../core/models/user.model';
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
  private dataService = inject(DataService);

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
  formData = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  ngOnInit(): void {
    this.areas.set(this.dataService.areasMock);
  }

  filteredAreas = computed(() => {
    let result = this.areas();
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
    const editing = this.editingArea();
    if (editing) {
      this.areas.update((prev: AreaSistema[]) => 
        prev.map((a: AreaSistema) => a.id === editing.id ? { ...a, ...this.formData } : a)
      );
      this.showNotification('Área actualizada exitosamente', 'success');
    } else {
      const newId = `AREA-${(this.areas().length + 1).toString().padStart(2, '0')}`;
      this.areas.update((prev: AreaSistema[]) => [...prev, { ...this.formData, id: newId } as AreaSistema]);
      this.showNotification('Área registrada exitosamente', 'success');
    }
    this.showModal.set(false);
  }

  toggleStatus(area: AreaSistema): void {
    this.areas.update(prev => 
      prev.map(a => a.id === area.id ? { ...a, activo: !a.activo } : a)
    );
    this.showNotification(`Área ${area.activo ? 'desactivada' : 'activada'} exitosamente`, 'success');
  }

  deleteArea(area: AreaSistema): void {
    if (confirm(`¿Está seguro de eliminar el área ${area.nombre}?`)) {
      this.areas.update(prev => prev.filter(a => a.id !== area.id));
      this.showNotification('Área eliminada', 'error');
    }
  }
}