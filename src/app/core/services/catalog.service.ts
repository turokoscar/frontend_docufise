import { Injectable, signal } from '@angular/core';
import { ApiService, Area, Rol, MenuApi, TipoDocumento, Estado } from './api.service';

export interface AreaSistema {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  activo: boolean;
}

export interface RolSistema {
  id: number;
  nombre: string;
  descripcion: string;
  nivelPermiso: number;
  activo: boolean;
}

export interface MenuSistema {
  id: number;
  nombre: string;
  ruta: string;
  icono: string;
  orden: number;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private _areas = signal<AreaSistema[]>([]);
  private _roles = signal<RolSistema[]>([]);
  private _menusPorRol = signal<MenuSistema[]>([]);
  private _tiposDocumento = signal<TipoDocumento[]>([]);
  private _estados = signal<Estado[]>([]);
  private _loaded = signal(false);
  private _rolIdActual = signal<number | null>(null);

  readonly areas = this._areas.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly menus = this._menusPorRol.asReadonly();
  readonly tiposDocumento = this._tiposDocumento.asReadonly();
  readonly estados = this._estados.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(rolId?: number): void {
    if (this._loaded() && this._rolIdActual() === rolId) return;
    
    this.api.getAreas().subscribe({
      next: (res) => {
        if (res.exitoso) {
          this._areas.set(res.datos.map(a => ({
            id: a.id,
            nombre: a.nombre,
            descripcion: a.descripcion || '',
            codigo: a.codigo || '',
            activo: a.activo
          })));
        }
      }
    });

    this.api.getRoles().subscribe({
      next: (res) => {
        if (res.exitoso) {
          this._roles.set(res.datos.map(r => ({
            id: r.id,
            nombre: r.nombre,
            descripcion: r.descripcion || '',
            nivelPermiso: r.nivelPermiso,
            activo: r.activo
          })));
        }
      }
    });

    if (rolId) {
      this.api.getMenusByRol(rolId).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this._menusPorRol.set(res.datos.map(m => ({
              id: m.id,
              nombre: m.nombre,
              ruta: m.ruta,
              icono: m.icono || 'Circle',
              orden: m.orden,
              activo: m.activo
            })));
            this._rolIdActual.set(rolId);
          }
        }
      });
    }

    this.api.getTiposDocumento().subscribe({
      next: (res) => {
        if (res.exitoso) {
          this._tiposDocumento.set(res.datos);
        }
      }
    });

    this.api.getEstados().subscribe({
      next: (res) => {
        if (res.exitoso) {
          this._estados.set(res.datos);
        }
      }
    });

    this._loaded.set(true);
  }

  getMenusByRol(rolNombre: string): MenuSistema[] {
    return this._menusPorRol().sort((a, b) => a.orden - b.orden);
  }

  getDefaultRouteByRol(rol: string): string {
    const menus = this.getMenusByRol(rol);
    if (menus.length === 0) return '/';
    return menus[0].ruta;
  }
}