import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioSistema, RolUsuario, MenuSistema } from '../models/user.model';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<UsuarioSistema | null>(null);
  
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  login(usuario: string, contrasena: string): boolean {
    const found = this.dataService.usuariosMock.find(
      u => u.usuario === usuario && u.contrasena === contrasena && u.activo
    );
    if (found) {
      this.userSignal.set(found);
      return true;
    }
    return false;
  }

  logout(): void {
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getMenus(): MenuSistema[] {
    const user = this.userSignal();
    if (!user) return [];
    return this.dataService.getMenusByRol(user.rol);
  }

  hasAccess(ruta: string): boolean {
    const menus = this.getMenus();
    return menus.some(m => ruta.startsWith(m.ruta));
  }
}