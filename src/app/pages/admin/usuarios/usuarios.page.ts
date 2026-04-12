import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { UsuarioSistema } from '../../../core/models/usuario.model';
import { AreaSistema } from '../../../core/models/area.model';
import { RolSistema } from '../../../core/models/rol.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideUsers, 
  lucidePlus, 
  lucideSearch, 
  lucideChevronDown, 
  lucidePencil, 
  lucideTrash2, 
  lucideShield, 
  lucideBuilding2,
  lucideUserCheck,
  lucideUserX,
  lucideMail,
  lucideArrowRight,
  lucideInfo
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHouse, lucideUsers, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideShield, lucideBuilding2, lucideUserCheck, 
      lucideUserX, lucideMail, lucideArrowRight, lucideInfo 
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

  filters = signal({
    search: '',
    rolId: 'all',
    areaId: 'all'
  });

  // Form Fields (linked to modal)
  formData: any = {
    nombreCompleto: '',
    nombreUsuario: '',
    correo: '',
    rolId: null as any,
    areaId: null as any,
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
    if (f.rolId !== 'all') {
      result = result.filter((u: UsuarioSistema) => u.rolId === Number(f.rolId));
    }
    if (f.areaId !== 'all') {
      result = result.filter((u: UsuarioSistema) => u.areaId === Number(f.areaId));
    }
    return result;
  });

  updateFilters(key: string, value: string): void {
    this.filters.update((f: any) => ({ ...f, [key]: value }));
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

  saveUsuario(): void {
    if (!this.formData.nombreCompleto || !this.formData.nombreUsuario || !this.formData.rolId || !this.formData.areaId) {
      this.showNotification('Complete todos los campos obligatorios', 'error');
      return;
    }

    const payload: Partial<UsuarioSistema> = {
      nombreCompleto: this.formData.nombreCompleto,
      nombreUsuario: this.formData.nombreUsuario,
      correo: this.formData.correo,
      rolId: Number(this.formData.rolId),
      areaId: Number(this.formData.areaId),
      activo: this.formData.activo
    };

    const editing = this.editingUsuario();
    if (editing) {
      this.apiService.updateUsuario(editing.id, payload).subscribe({
        next: () => {
          this.showNotification('Usuario actualizado exitosamente', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showNotification('Error al actualizar usuario', 'error')
      });
    } else {
      this.apiService.createUsuario(payload).subscribe({
        next: () => {
          this.showNotification('Usuario registrado exitosamente', 'success');
          this.loadData();
          this.showModal.set(false);
        },
        error: () => this.showNotification('Error al registrar usuario', 'error')
      });
    }
  }

  toggleStatus(user: UsuarioSistema): void {
    this.apiService.updateUsuario(user.id, { activo: !user.activo }).subscribe({
      next: () => {
        this.showNotification(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`, 'success');
        this.loadData();
      },
      error: () => this.showNotification('Error al cambiar estado.', 'error')
    });
  }

  deleteUsuario(user: UsuarioSistema): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.nombreCompleto}?`)) {
      this.apiService.deleteUsuario(user.id).subscribe({
        next: () => {
          this.showNotification('Usuario eliminado', 'success');
          this.loadData();
        },
        error: () => this.showNotification('Error al eliminar usuario', 'error')
      });
    }
  }

  getRoleBadgeClass(rolNombre?: string): string {
    if (!rolNombre) return 'bg-muted text-muted-foreground';
    const styles: Record<string, string> = {
      'Administrador': 'bg-primary/10 text-primary border-primary/20',
      'CTD': 'bg-success/10 text-success border-success/20',
      'Firmante': 'bg-secondary/10 text-secondary border-secondary/20'
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[rolNombre] || 'bg-muted text-muted-foreground'}`;
  }
}