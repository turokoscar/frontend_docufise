import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { ApiService, LoginResponse } from './api.service';
import { DataService } from './data.service';
import { MenuSistema } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<UsuarioInfo | null>(null);
  private tokenSignal = signal<string | null>(null);
  
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
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
      } catch {
        this.clearSession();
      }
    }
  }

  login(usuario: string, contrasena: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.apiService.login(usuario, contrasena).subscribe({
        next: (response) => {
          if (response.exitoso && response.datos) {
            this.saveSession(response.datos);
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: () => resolve(false)
      });
    });
  }

  private saveSession(data: LoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.usuarioId,
      usuario: data.nombreUsuario,
      nombre: data.nombreCompleto,
      correo: data.correo,
      rol: data.rol,
      area: data.area
    }));
    this.tokenSignal.set(data.token);
    this.userSignal.set({
      id: data.usuarioId,
      usuario: data.nombreUsuario,
      nombre: data.nombreCompleto,
      correo: data.correo,
      rol: data.rol,
      area: data.area
    });
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
    this.router.navigate(['/login']);
  }

  getMenus(): MenuSistema[] {
    const user = this.userSignal();
    if (!user) return [];
    const rol = user.rol as unknown as 'CTD' | 'Firmante' | 'Administrador';
    return this.dataService.getMenusByRol(rol);
  }

  hasAccess(ruta: string): boolean {
    const menus = this.getMenus();
    return menus.some(m => ruta.startsWith(m.ruta));
  }

  refreshToken(): void {
    this.apiService.refreshToken().subscribe({
      next: (response) => {
        if (response.exitoso && response.datos) {
          this.saveSession(response.datos);
        }
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
  area: string;
}