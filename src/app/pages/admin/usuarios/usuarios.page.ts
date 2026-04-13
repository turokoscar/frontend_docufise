import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { UsuarioSistema } from '../../../core/models/usuario.model';
import { AreaSistema } from '../../../core/models/area.model';
import { RolSistema } from '../../../core/models/rol.model';
import { ROLES } from '../../../core/constants/roles.constants';

// Shared UI Components
import { PageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { SectionLabelComponent } from '../../../shared/components/ui/section-label/section-label.component';
import { FilterPanelComponent } from '../../../shared/components/ui/filter-panel/filter-panel.component';

// UI Library Components
import { UiButtonComponent } from '../../../shared/components/ui/button/button.component';
import { UiBadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { UiInputComponent } from '../../../shared/components/ui/input/input.component';
import { UiSelectComponent } from '../../../shared/components/ui/select/select.component';
import { UiTableComponent } from '../../../shared/components/ui/table/table.component';
import { UiModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { UiDropdownComponent } from '../../../shared/components/ui/dropdown/dropdown.component';
import { UsuarioFormComponent } from './components/usuario-form/usuario-form.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucideUsers, lucidePlus, lucideSearch, lucideChevronDown, 
  lucidePencil, lucideTrash2, lucideShield, lucideBuilding2, lucideUserCheck, 
  lucideUserX, lucideMail, lucideArrowRight, lucideInfo, lucideCheck, lucideX,
  lucideChevronLeft, lucideChevronRight
} from '@ng-icons/lucide';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-usuarios',
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
    UiSelectComponent,
    UiTableComponent,
    UiModalComponent,
    UiDropdownComponent,
    UsuarioFormComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideUsers, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideShield, lucideBuilding2, lucideUserCheck, 
      lucideUserX, lucideMail, lucideArrowRight, lucideInfo, lucideCheck, lucideX,
      lucideChevronLeft, lucideChevronRight
    })
  ],
  templateUrl: './usuarios.page.html',
  styleUrl: './usuarios.page.css'
})
export class UsuariosPage implements OnInit {
  private apiService = inject(ApiService);

  // State
  usuarios = signal<UsuarioSistema[]>([]);
  areas = signal<AreaSistema[]>([]);
  roles = signal<RolSistema[]>([]);
  showModal = signal(false);
  editingUsuario = signal<UsuarioSistema | null>(null);

  filters = signal({
    search: '',
    rolId: 'all',
    areaId: 'all'
  });

  currentPage = signal(1);
  pageSize = signal(10);

  filteredUsuarios = computed(() => {
    let result = this.usuarios();
    const f = this.filters();
    if (f.search) {
      const s = f.search.toLowerCase();
      result = result.filter((u: UsuarioSistema) => 
        (u.nombreCompleto?.toLowerCase().includes(s) || false) || 
        (u.nombreUsuario?.toLowerCase().includes(s) || false) || 
        (u.correo?.toLowerCase().includes(s) || false)
      );
    }
    if (f.rolId !== 'all') result = result.filter((u: UsuarioSistema) => u.rolId === Number(f.rolId));
    if (f.areaId !== 'all') result = result.filter((u: UsuarioSistema) => u.areaId === Number(f.areaId));
    return result;
  });

  totalPages = computed(() => Math.ceil(this.filteredUsuarios().length / this.pageSize()));
  
  paginatedUsuarios = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsuarios().slice(start, start + this.pageSize());
  });

  paginatedPages = computed(() => {
    const total = this.totalPages();
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  });

  paginationSummary = computed(() => {
    const total = this.filteredUsuarios().length;
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `Mostrando ${start}-${end} de ${total} registros`;
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Form Fields
  formData: any = {
    nombreCompleto: '',
    nombreUsuario: '',
    correo: '',
    rolId: null,
    areaId: null,
    activo: true
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getUsuarios().subscribe({
      next: (res) => this.usuarios.set(res)
    });
    this.apiService.getAreas().subscribe({
      next: (res) => this.areas.set(res.filter(a => a.activo))
    });
    this.apiService.getRoles().subscribe({
      next: (res) => this.roles.set(res.filter(r => r.activo))
    });
  }

  updateFilters(key: string, value: string): void {
    this.filters.update((f: any) => ({ ...f, [key]: value }));
    this.currentPage.set(1);
  }

  openCreateModal(): void {
    this.editingUsuario.set(null);
    this.formData = {
      nombreCompleto: '',
      nombreUsuario: '',
      correo: '',
      rolId: this.roles().length > 0 ? this.roles()[0].id : null,
      areaId: this.areas().length > 0 ? this.areas()[0].id : null,
      activo: true
    };
    this.showModal.set(true);
  }

  openEditModal(user: UsuarioSistema): void {
    this.editingUsuario.set(user);
    this.formData = { ...user };
    this.showModal.set(true);
  }

  saveUsuario(formData: any): void {
    if (!formData.nombreCompleto || !formData.nombreUsuario || !formData.rolId || !formData.areaId) {
      this.showToast('Complete los campos obligatorios', 'error');
      return;
    }

    const payload: Partial<UsuarioSistema> = {
      nombreCompleto: formData.nombreCompleto,
      nombreUsuario: formData.nombreUsuario,
      correo: formData.correo,
      rolId: Number(formData.rolId),
      areaId: Number(formData.areaId),
      activo: formData.activo
    };

    const editing = this.editingUsuario();
    if (editing) {
      this.apiService.updateUsuario(editing.id, payload).subscribe({
        next: () => {
          this.showToast('Usuario actualizado', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showToast('Error al actualizar', 'error')
      });
    } else {
      this.apiService.createUsuario(payload).subscribe({
        next: () => {
          this.showToast('Usuario registrado', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showToast('Error al registrar', 'error')
      });
    }
  }

  toggleStatus(user: UsuarioSistema): void {
    this.apiService.updateUsuario(user.id, { activo: !user.activo }).subscribe({
      next: () => {
        this.showToast(`Usuario ${user.activo ? 'desactivado' : 'activado'}`, 'success');
        this.loadData();
      },
      error: () => this.showToast('Error al cambiar estado.', 'error')
    });
  }

  deleteUsuario(user: UsuarioSistema): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Confirma eliminar a ${user.nombreCompleto}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#AB2741'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUsuario(user.id).subscribe({
          next: () => {
            this.showToast('Usuario eliminado', 'success');
            this.loadData();
          },
          error: () => this.showToast('Error al eliminar', 'error')
        });
      }
    });
  }

  getRoleBadgeVariant(rolNombre?: string): any {
    if (!rolNombre) return 'muted';
    if (rolNombre === ROLES.ADMIN) return 'primary';
    if (rolNombre === ROLES.CTD) return 'success';
    if (rolNombre === ROLES.FIRMANTE) return 'warning';
    return 'muted';
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
