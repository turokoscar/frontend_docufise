import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { CatalogService } from './catalog.service';
import { LoginResponse } from '../models/auth.model';
import { MenuSistema } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<UsuarioInfo | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(
    private apiService: ApiService,
    private catalogService: CatalogService,
    private router: Router
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.tokenSignal.set(token);
        this.userSignal.set(user);
        this.catalogService.loadMenusByRol(user.rolId);
      } catch {
        this.clearSession();
      }
    }
  }

  login(usuario: string, contrasena: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.apiService.login(usuario, contrasena).subscribe({
        next: (data) => {
           this.saveSession(data);
           this.catalogService.loadMenusByRol(data.rolId);
           
           setTimeout(() => {
             resolve(true);
           }, 500);
        },
        error: (err) => {
          resolve(false)
        }
      });
    });
  }

  private saveSession(data: LoginResponse): void {
    const userInfo: UsuarioInfo = {
      id: data.usuarioId,
      usuario: data.nombreUsuario,
      nombre: data.nombreCompleto,
      correo: data.correo,
      rol: data.rol,
      rolId: data.rolId,
      area: data.area
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    
    this.tokenSignal.set(data.token);
    this.userSignal.set(userInfo);
  }

  logout(): void {
    this.apiService.logout().subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.catalogService.clearAll();
    this.router.navigate(['/login']);
  }

  getMenus(): MenuSistema[] {
    const user = this.userSignal();
    if (!user) return [];
    return this.catalogService.getMenusByRol(user.rol).map((m: MenuSistema) => ({
      id: m.id,
      nombre: m.nombre,
      ruta: m.ruta,
      icono: m.icono,
      orden: m.orden,
      activo: m.activo
    }));
  }

  hasAccess(ruta: string): boolean {
    const menus = this.getMenus();
    return menus.some(m => ruta.startsWith(m.ruta));
  }

  getDefaultRoute(): string {
    const user = this.userSignal();
    if (!user) return '/login';
    
    // Map rol to default route
    const rolRouteMap: Record<string, string> = {
      'CTD': '/expedientes',
      'FIRMANTE': '/firmas',
      'ADMINISTRADOR': '/reportes'
    };
    
    return rolRouteMap[user.rol] || '/expedientes';
  }

  refreshToken(): void {
    this.apiService.refreshToken().subscribe({
      next: (data) => {
        this.saveSession(data);
      }
    });
  }
}

interface UsuarioInfo {
  id: number;
  usuario: string;
  nombre: string;
  correo: string;
  rol: string;
  rolId: number;
  area: string;
}