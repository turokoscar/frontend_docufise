import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { UsuarioSistema, RolUsuario } from '../../../core/models/user.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
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
      lucideHome, lucideUsers, lucidePlus, lucideSearch, lucideChevronDown, 
      lucidePencil, lucideTrash2, lucideShield, lucideBuilding2, lucideUserCheck, 
      lucideUserX, lucideMail, lucideArrowRight, lucideInfo 
    })
  ],
  templateUrl: './usuarios.page.html',
  styleUrl: './usuarios.page.css'
})
export class UsuariosPage implements OnInit {
  private dataService = inject(DataService);

  // State
  usuarios = signal<UsuarioSistema[]>([]);
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

  // Filters
  filters = signal({
    search: '',
    rol: 'all',
    area: 'all'
  });

  // Form Fields (linked to modal)
  formData = {
    nombre: '',
    usuario: '',
    correo: '',
    rol: 'Firmante' as RolUsuario,
    area: '',
    activo: true
  };

  roles = ['Administrador', 'CTD', 'Firmante'];
  areas = this.dataService.areasMock.map(a => a.nombre);

  ngOnInit(): void {
    this.usuarios.set(this.dataService.usuariosMock);
    if (this.areas.length > 0) this.formData.area = this.areas[0];
  }

  filteredUsuarios = computed(() => {
    let result = this.usuarios();
    const f = this.filters();

    if (f.search) {
      const s = f.search.toLowerCase();
      result = result.filter((u: UsuarioSistema) => 
        u.nombre.toLowerCase().includes(s) || 
        u.usuario.toLowerCase().includes(s) || 
        u.correo.toLowerCase().includes(s)
      );
    }
    if (f.rol !== 'all') {
      result = result.filter((u: UsuarioSistema) => u.rol === f.rol);
    }
    if (f.area !== 'all') {
      result = result.filter((u: UsuarioSistema) => u.area === f.area);
    }
    return result;
  });

  updateFilters(key: string, value: string): void {
    this.filters.update((f: any) => ({ ...f, [key]: value }));
  }

  openCreateModal(): void {
    this.editingUsuario.set(null);
    this.formData = {
      nombre: '',
      usuario: '',
      correo: '',
      rol: 'Firmante',
      area: this.areas[0] || '',
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
    const editing = this.editingUsuario();
    if (!this.formData.nombre || !this.formData.usuario || !this.formData.rol || !this.formData.area) {
      this.showNotification('Complete todos los campos obligatorios', 'error');
      return;
    }
    if (editing) {
      this.usuarios.update((prev: UsuarioSistema[]) => 
        prev.map((u: UsuarioSistema) => u.id === editing.id ? { ...u, ...this.formData } : u)
      );
      this.showNotification('Usuario actualizado exitosamente', 'success');
    } else {
      const newId = `USR-${(this.usuarios().length + 1).toString().padStart(2, '0')}`;
      this.usuarios.update((prev: UsuarioSistema[]) => [...prev, { ...this.formData, id: newId, contrasena: '1234' } as UsuarioSistema]);
      this.showNotification('Usuario registrado exitosamente', 'success');
    }
    this.showModal.set(false);
  }

  toggleStatus(user: UsuarioSistema): void {
    this.usuarios.update(prev => 
      prev.map(u => u.id === user.id ? { ...u, activo: !u.activo } : u)
    );
    this.showNotification(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`, 'success');
  }

  deleteUsuario(user: UsuarioSistema): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.nombre}?`)) {
      this.usuarios.update(prev => prev.filter(u => u.id !== user.id));
      this.showNotification('Usuario eliminado', 'error');
    }
  }

  getRoleBadgeClass(rol: string): string {
    const styles: Record<string, string> = {
      'Administrador': 'bg-primary/10 text-primary border-primary/20',
      'CTD': 'bg-success/10 text-success border-success/20',
      'Firmante': 'bg-secondary/10 text-secondary border-secondary/20'
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[rol] || 'bg-muted text-muted-foreground'}`;
  }
}