import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AreaSistema } from '../models/area.model';
import { RolSistema } from '../models/rol.model';
import { MenuSistema } from '../models/menu.model';
import { TipoDocumento, Estado } from '../models/documento.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private _areas = signal<AreaSistema[]>([]);
  private _roles = signal<RolSistema[]>([]);
  private _menusPorRol = signal<MenuSistema[]>([]);
  private _tiposDocumento = signal<TipoDocumento[]>([]);
  private _estados = signal<Estado[]>([]);

  readonly areas = this._areas.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly menus = this._menusPorRol.asReadonly();
  readonly tiposDocumento = this._tiposDocumento.asReadonly();
  readonly estados = this._estados.asReadonly();

  constructor(private api: ApiService) {}

  clearAll(): void {
    this._menusPorRol.set([]);
    this._areas.set([]);
    this._roles.set([]);
    this._tiposDocumento.set([]);
    this._estados.set([]);
  }

  loadMenusByRol(rolId: number): void {
    this._menusPorRol.set([]);
    
    this.api.getMenusByRol(rolId).subscribe({
      next: (res) => {
        this._menusPorRol.set(res.map(m => ({
          id: m.id,
          nombre: m.nombre,
          ruta: m.ruta,
          icono: m.icono || 'Circle',
          orden: m.orden,
          activo: m.activo,
          permiso: m.permiso
        })));
      },
      error: (err) => {
        console.error('[Catalog] Error loading menus:', err);
      }
    });
  }

  getMenusByRol(rolNombre: string): MenuSistema[] {
    return this._menusPorRol().sort((a, b) => a.orden - b.orden);
  }

  loadAreas(): void {
    if (this._areas().length > 0) return;
    
    this.api.getAreas().subscribe({
      next: (res) => {
        this._areas.set(res.map(a => ({
          id: a.id,
          nombre: a.nombre,
          descripcion: a.descripcion || '',
          codigo: a.codigo || '',
          activo: a.activo
        })));
      }
    });
  }

  loadRoles(): void {
    if (this._roles().length > 0) return;
    
    this.api.getRoles().subscribe({
      next: (res) => {
        this._roles.set(res.map(r => ({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion || '',
          nivelPermiso: r.nivelPermiso,
          activo: r.activo
        })));
      }
    });
  }

  loadTiposDocumento(): void {
    if (this._tiposDocumento().length > 0) return;
    
    this.api.getTiposDocumento().subscribe({
      next: (res) => {
        this._tiposDocumento.set(res);
      }
    });
  }

  loadEstados(): void {
    if (this._estados().length > 0) return;
    
    this.api.getEstados().subscribe({
      next: (res) => {
        this._estados.set(res);
      }
    });
  }

  getDefaultRouteByRol(rol: string): string {
    const menus = this.getMenusByRol(rol);
    if (menus.length === 0) return '/';
    return menus[0].ruta;
  }
}