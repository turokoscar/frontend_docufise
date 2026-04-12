import { Injectable } from '@angular/core';
import { CatalogService } from './catalog.service';

export interface MockArea { id: string; nombre: string; descripcion: string; activo: boolean; }
export interface MockRol { id: string; nombre: string; descripcion: string; menus: string[]; }
export interface MockMenu { id: string; nombre: string; ruta: string; icono: string; orden: number; activo: boolean; }
export interface MockUsuario { id: string; usuario: string; nombre: string; correo: string; area: string; rol: string; activo: boolean; contrasena?: string; }

@Injectable({ providedIn: 'root' })
export class DataService {
  
  constructor(private catalogService: CatalogService) {}
  
  get catalog(): CatalogService {
    return this.catalogService;
  }

  // ==================== MOCK DATA (para fallback/local) ====================
  readonly menusMock: MockMenu[] = [
    { id: "MNU-01", nombre: "Panel Ejecutivo", ruta: "/reportes", icono: "BarChart3", orden: 1, activo: true },
    { id: "MNU-02", nombre: "Gestión de Expedientes", ruta: "/expedientes", icono: "FileText", orden: 2, activo: true },
    { id: "MNU-03", nombre: "Gestión de Firmas", ruta: "/firmas", icono: "PenTool", orden: 3, activo: true },
    { id: "MNU-04", nombre: "Usuarios", ruta: "/admin/usuarios", icono: "Users", orden: 4, activo: true },
    { id: "MNU-05", nombre: "Áreas", ruta: "/admin/areas", icono: "Building2", orden: 5, activo: true },
    { id: "MNU-06", nombre: "Roles", ruta: "/admin/roles", icono: "Shield", orden: 6, activo: true },
    { id: "MNU-07", nombre: "Menús", ruta: "/admin/menus", icono: "LayoutList", orden: 7, activo: true },
  ];

  readonly rolesMock: MockRol[] = [
    { id: "ROL-01", nombre: "CTD", descripcion: "Coordinación de Trámite Documentario", menus: ["MNU-02"] },
    { id: "ROL-02", nombre: "Firmante", descripcion: "Área usuaria", menus: ["MNU-01", "MNU-03"] },
    { id: "ROL-03", nombre: "Administrador", descripcion: "Acceso total", menus: ["MNU-01", "MNU-02", "MNU-03", "MNU-04", "MNU-05", "MNU-06", "MNU-07"] },
  ];

  readonly areasMock: MockArea[] = [
    { id: "AREA-01", nombre: "Secretaría General", descripcion: "Órgano administrativo central", activo: true },
    { id: "AREA-02", nombre: "Área Legal", descripcion: "Asesoría jurídica", activo: true },
    { id: "AREA-03", nombre: "Área Contable", descripcion: "Gestión financiera", activo: true },
    { id: "AREA-04", nombre: "Recursos Humanos", descripcion: "Gestión de personal", activo: true },
  ];

  readonly usuariosMock: MockUsuario[] = [
    { id: "USR-01", usuario: "admin", nombre: "Administrador Sistema", correo: "admin@fise.gob", area: "Secretaría General", rol: "Administrador", activo: true },
    { id: "USR-02", usuario: "ctd", nombre: "Usuario CTD", correo: "ctd@fise.gob", area: "Secretaría General", rol: "CTD", activo: true },
    { id: "USR-03", usuario: "firmante", nombre: "Usuario Firmante", correo: "firmante@fise.gob", area: "Área Legal", rol: "Firmante", activo: true },
  ];

  readonly tipoDocumentosMock = [
    "Carta", "Informe", "Resolución", "Memorándum", "Circular"
  ];

  readonly estadoColors: Record<string, string> = {
    "Registrado": "#3B7DCC",
    "Ingresado": "#2C5AAB",
    "Pendiente": "#F2B801",
    "Observado": "#AB2741",
    "Firmado": "#0FBF90",
  };

  getMenusByRol(rol: string): MockMenu[] {
    const rolData = this.rolesMock.find(r => r.nombre === rol);
    if (!rolData) return [];
    return this.menusMock.filter(m => rolData.menus.includes(m.id) && m.activo);
  }

  getDefaultRouteByRol(rol: string): string {
    const menus = this.getMenusByRol(rol);
    return menus.length > 0 ? menus[0].ruta : '/login';
  }

  // ==================== MOCK DATA PARA PÁGINAS ====================
  readonly expedientesMock: any[] = [
    { id: "EXP-2026-001", numeracion: "001-2026-FISE", tipoDocumento: "Informe Técnico", elaboradoPor: "Marco Tomy", enviadoPor: "Gabriel", fechaElaboracion: "2026-03-15", estado: "Firmado" },
    { id: "EXP-2026-002", numeracion: "002-2026-FISE", tipoDocumento: "Carta", elaboradoPor: "Guillermo Timoteo", enviadoPor: "Luiggi", fechaElaboracion: "2026-03-18", estado: "Pendiente" },
    { id: "EXP-2026-003", numeracion: "003-2026-FISE", tipoDocumento: "Resolución", elaboradoPor: "Ana García", enviadoPor: "Patricia", fechaElaboracion: "2026-03-20", estado: "Registrado" },
  ];

  readonly firmasMock: any[] = [
    { id: "FIR-001", expedienteId: "EXP-2026-001", elaboradoPor: "Marco Tomy", tipoDocumento: "Informe Técnico", estado: "Firmado", fechaHora: "2026-03-15 10:30" },
    { id: "FIR-002", expedienteId: "EXP-2026-002", elaboradoPor: "Guillermo Timoteo", tipoDocumento: "Carta", estado: "Pendiente", fechaHora: "2026-03-18 14:15" },
  ];

  readonly tiposDocumento = [
    "Carta", "Informe", "Resolución", "Memorándum", "Circular"
  ];
}