import { Injectable } from '@angular/core';
import { 
  UsuarioSistema, 
  AreaSistema, 
  RolSistema, 
  MenuSistema, 
  Expediente, 
  Firma,
  EstadoExpediente,
  RolUsuario
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly menusMock: MenuSistema[] = [
    { id: "MNU-01", nombre: "Panel Ejecutivo", ruta: "/reportes", icono: "BarChart3", orden: 1, activo: true },
    { id: "MNU-02", nombre: "Gestión de Expedientes", ruta: "/expedientes", icono: "FileText", orden: 2, activo: true },
    { id: "MNU-03", nombre: "Gestión de Firmas", ruta: "/firmas", icono: "PenTool", orden: 3, activo: true },
    { id: "MNU-04", nombre: "Usuarios", ruta: "/admin/usuarios", icono: "Users", orden: 4, activo: true },
    { id: "MNU-05", nombre: "Áreas", ruta: "/admin/areas", icono: "Building2", orden: 5, activo: true },
    { id: "MNU-06", nombre: "Roles", ruta: "/admin/roles", icono: "Shield", orden: 6, activo: true },
    { id: "MNU-07", nombre: "Menús", ruta: "/admin/menus", icono: "LayoutList", orden: 7, activo: true },
  ];

  readonly rolesMock: RolSistema[] = [
    { id: "ROL-01", nombre: "CTD", descripcion: "Coordinación de Trámite Documentario — acceso a Gestión de Expedientes", menus: ["MNU-02"] },
    { id: "ROL-02", nombre: "Firmante", descripcion: "Área usuaria — acceso a Reportes y Gestión de Firmas", menus: ["MNU-01", "MNU-03"] },
    { id: "ROL-03", nombre: "Administrador", descripcion: "Acceso total a todos los módulos y mantenimiento del sistema", menus: ["MNU-01", "MNU-02", "MNU-03", "MNU-04", "MNU-05", "MNU-06", "MNU-07"] },
  ];

  readonly areasMock: AreaSistema[] = [
    { id: "AREA-01", nombre: "Dirección General", descripcion: "Dirección General del FISE", activo: true },
    { id: "AREA-02", nombre: "Asesoría Legal", descripcion: "Área de asesoría legal y normativa", activo: true },
    { id: "AREA-03", nombre: "Administración", descripcion: "Área de administración y finanzas", activo: true },
    { id: "AREA-04", nombre: "Operaciones", descripcion: "Área de operaciones y campo", activo: true },
    { id: "AREA-05", nombre: "Fiscalización", descripcion: "Área de supervisión y fiscalización", activo: true },
    { id: "AREA-06", nombre: "Trámite Documentario", descripcion: "Coordinación de trámite documentario", activo: true },
  ];

  readonly usuariosMock: UsuarioSistema[] = [
    { id: "USR-01", usuario: "admin", contrasena: "admin", nombre: "Carlos Mendoza", correo: "cmendoza@fise.gob.pe", area: "Dirección General", rol: "Administrador", activo: true },
    { id: "USR-02", usuario: "ctd", contrasena: "ctd", nombre: "Marco Tomy", correo: "mtomy@fise.gob.pe", area: "Trámite Documentario", rol: "CTD", activo: true },
    { id: "USR-03", usuario: "firmante", contrasena: "firmante", nombre: "Ana García", correo: "agarcia@fise.gob.pe", area: "Asesoría Legal", rol: "Firmante", activo: true },
    { id: "USR-04", usuario: "gtimoteo", contrasena: "1234", nombre: "Guillermo Timoteo", correo: "gtimoteo@fise.gob.pe", area: "Operaciones", rol: "Firmante", activo: true },
    { id: "USR-05", usuario: "projas", contrasena: "1234", nombre: "Patricia Rojas", correo: "projas@fise.gob.pe", area: "Administración", rol: "CTD", activo: true },
  ];

  readonly tiposDocumento = [
    "Carta",
    "Informe",
    "Informe Técnico",
    "Informe Técnico Legal",
    "Informe Legal",
    "Constancia de Prestación de Servicios",
    "Resolución Directoral",
  ];

  readonly elaboradores = [
    "Marco Tomy",
    "Guillermo Timoteo",
    "Ana García",
    "Carlos Mendoza",
  ];

  readonly remitentes = [
    "Gabriel",
    "Luiggi",
    "Patricia",
    "Roberto",
  ];

  readonly areasDestino = this.areasMock.filter(a => a.activo).map(a => a.nombre);

  readonly usuariosPorArea: Record<string, string[]> = {
    "Dirección General": ["Director General", "Subdirector"],
    "Asesoría Legal": ["Asesor Legal Principal", "Abogado Senior"],
    "Administración": ["Jefe de Administración", "Asistente Administrativo"],
    "Operaciones": ["Jefe de Operaciones", "Coordinador de Campo"],
    "Fiscalización": ["Supervisor de Fiscalización", "Inspector"],
    "Trámite Documentario": ["Coordinador CTD", "Asistente CTD"],
  };

  readonly expedientesMock: Expediente[] = [
    { id: "EXP-2026-001", numeracion: "001-2026-FISE", tipoDocumento: "Informe Técnico", elaboradoPor: "Marco Tomy", enviadoPor: "Gabriel", fechaElaboracion: "2026-03-15", fechaHoraEnvio: "2026-03-15 10:30", estado: "Firmado", archivoOriginal: "informe_tecnico_001.pdf", archivoFirmado: "informe_tecnico_001_firmado.pdf", areaDestino: "Dirección General", usuarioDestino: "Director General" },
    { id: "EXP-2026-002", numeracion: "002-2026-FISE", tipoDocumento: "Carta", elaboradoPor: "Guillermo Timoteo", enviadoPor: "Luiggi", fechaElaboracion: "2026-03-18", fechaHoraEnvio: "2026-03-18 14:15", estado: "Pendiente", archivoOriginal: "carta_002.pdf", areaDestino: "Asesoría Legal", usuarioDestino: "Asesor Legal Principal" },
    { id: "EXP-2026-003", numeracion: "003-2026-FISE", tipoDocumento: "Resolución Directoral", elaboradoPor: "Ana García", enviadoPor: "Patricia", fechaElaboracion: "2026-03-20", fechaHoraEnvio: "2026-03-20 09:00", estado: "Registrado", archivoOriginal: "resolucion_003.pdf" },
    { id: "EXP-2026-004", numeracion: "004-2026-FISE", tipoDocumento: "Informe Legal", elaboradoPor: "Carlos Mendoza", enviadoPor: "Roberto", fechaElaboracion: "2026-03-22", fechaHoraEnvio: "2026-03-22 11:45", estado: "Firmado", archivoOriginal: "informe_legal_004.pdf", archivoFirmado: "informe_legal_004_firmado.pdf", areaDestino: "Administración", usuarioDestino: "Jefe de Administración" },
    { id: "EXP-2026-005", numeracion: "005-2026-FISE", tipoDocumento: "Constancia de Prestación de Servicios", elaboradoPor: "Marco Tomy", enviadoPor: "Gabriel", fechaElaboracion: "2026-03-25", fechaHoraEnvio: "2026-03-25 16:20", estado: "Observado", archivoOriginal: "constancia_005.pdf", areaDestino: "Operaciones", usuarioDestino: "Jefe de Operaciones", motivoRechazo: "Falta firma del supervisor de campo" },
    { id: "EXP-2026-006", numeracion: "006-2026-FISE", tipoDocumento: "Informe Técnico Legal", elaboradoPor: "Guillermo Timoteo", enviadoPor: "Luiggi", fechaElaboracion: "2026-04-01", fechaHoraEnvio: "2026-04-01 08:30", estado: "Ingresado", archivoOriginal: "informe_tec_legal_006.pdf", areaDestino: "Fiscalización", usuarioDestino: "Supervisor de Fiscalización" },
    { id: "EXP-2026-007", numeracion: "007-2026-FISE", tipoDocumento: "Informe", elaboradoPor: "Ana García", enviadoPor: "Patricia", fechaElaboracion: "2026-04-03", fechaHoraEnvio: "2026-04-03 13:10", estado: "Firmado", archivoOriginal: "informe_007.pdf", archivoFirmado: "informe_007_firmado.pdf", areaDestino: "Dirección General", usuarioDestino: "Subdirector" },
    { id: "EXP-2026-008", numeracion: "008-2026-FISE", tipoDocumento: "Carta", elaboradoPor: "Carlos Mendoza", enviadoPor: "Roberto", fechaElaboracion: "2026-04-05", fechaHoraEnvio: "2026-04-05 15:00", estado: "Pendiente", archivoOriginal: "carta_008.pdf", areaDestino: "Asesoría Legal", usuarioDestino: "Abogado Senior" },
    { id: "EXP-2026-009", numeracion: "009-2026-FISE", tipoDocumento: "Informe Técnico", elaboradoPor: "Marco Tomy", enviadoPor: "Gabriel", fechaElaboracion: "2026-04-06", fechaHoraEnvio: "2026-04-06 10:00", estado: "Registrado", archivoOriginal: "informe_tecnico_009.pdf" },
    { id: "EXP-2026-010", numeracion: "010-2026-FISE", tipoDocumento: "Resolución Directoral", elaboradoPor: "Ana García", enviadoPor: "Patricia", fechaElaboracion: "2026-04-07", fechaHoraEnvio: "2026-04-07 11:30", estado: "Firmado", archivoOriginal: "resolucion_010.pdf", archivoFirmado: "resolucion_010_firmado.pdf", areaDestino: "Administración", usuarioDestino: "Asistente Administrativo" },
    { id: "EXP-2026-011", numeracion: "011-2026-FISE", tipoDocumento: "Informe Legal", elaboradoPor: "Guillermo Timoteo", enviadoPor: "Luiggi", fechaElaboracion: "2026-04-08", fechaHoraEnvio: "2026-04-08 09:45", estado: "Ingresado", archivoOriginal: "informe_legal_011.pdf", areaDestino: "Operaciones", usuarioDestino: "Coordinador de Campo" },
    { id: "EXP-2026-012", numeracion: "012-2026-FISE", tipoDocumento: "Carta", elaboradoPor: "Carlos Mendoza", enviadoPor: "Roberto", fechaElaboracion: "2026-04-09", fechaHoraEnvio: "2026-04-09 14:20", estado: "Observado", archivoOriginal: "carta_012.pdf", areaDestino: "Fiscalización", usuarioDestino: "Inspector", motivoRechazo: "Datos incompletos en el anexo B" },
  ];

  readonly firmasMock: Firma[] = [
    { id: "FIR-001", expedienteId: "EXP-2026-001", elaboradoPor: "Marco Tomy", tipoDocumento: "Informe Técnico", estado: "Firmado", fechaHora: "2026-03-15 10:30", archivoOriginal: "informe_tecnico_001.pdf", archivoFirmado: "informe_tecnico_001_firmado.pdf" },
    { id: "FIR-002", expedienteId: "EXP-2026-002", elaboradoPor: "Guillermo Timoteo", tipoDocumento: "Carta", estado: "Pendiente", fechaHora: "2026-03-18 14:15", archivoOriginal: "carta_002.pdf" },
    { id: "FIR-003", expedienteId: "EXP-2026-006", elaboradoPor: "Ana García", tipoDocumento: "Resolución Directoral", estado: "Ingresado", fechaHora: "2026-03-20 09:00", archivoOriginal: "resolucion_003.pdf" },
    { id: "FIR-004", expedienteId: "EXP-2026-004", elaboradoPor: "Carlos Mendoza", tipoDocumento: "Informe Legal", estado: "Firmado", fechaHora: "2026-03-22 11:45", archivoOriginal: "informe_legal_004.pdf", archivoFirmado: "informe_legal_004_firmado.pdf" },
    { id: "FIR-005", expedienteId: "EXP-2026-005", elaboradoPor: "Marco Tomy", tipoDocumento: "Constancia de Prestación de Servicios", estado: "Observado", fechaHora: "2026-03-25 16:20", archivoOriginal: "constancia_005.pdf", motivoRechazo: "Falta firma del supervisor de campo" },
    { id: "FIR-006", expedienteId: "EXP-2026-011", elaboradoPor: "Guillermo Timoteo", tipoDocumento: "Informe Técnico Legal", estado: "Ingresado", fechaHora: "2026-04-01 08:30", archivoOriginal: "informe_tec_legal_006.pdf" },
    { id: "FIR-007", expedienteId: "EXP-2026-007", elaboradoPor: "Ana García", tipoDocumento: "Informe", estado: "Firmado", fechaHora: "2026-04-03 13:10", archivoOriginal: "informe_007.pdf", archivoFirmado: "informe_007_firmado.pdf" },
    { id: "FIR-008", expedienteId: "EXP-2026-008", elaboradoPor: "Carlos Mendoza", tipoDocumento: "Carta", estado: "Pendiente", fechaHora: "2026-04-05 15:00", archivoOriginal: "carta_008.pdf" },
    { id: "FIR-009", expedienteId: "EXP-2026-009", elaboradoPor: "Marco Tomy", tipoDocumento: "Informe Técnico", estado: "Ingresado", fechaHora: "2026-04-06 10:00", archivoOriginal: "informe_tecnico_009.pdf" },
    { id: "FIR-010", expedienteId: "EXP-2026-010", elaboradoPor: "Ana García", tipoDocumento: "Resolución Directoral", estado: "Firmado", fechaHora: "2026-04-07 11:30", archivoOriginal: "resolucion_010.pdf", archivoFirmado: "resolucion_010_firmado.pdf" },
    { id: "FIR-011", expedienteId: "EXP-2026-012", elaboradoPor: "Guillermo Timoteo", tipoDocumento: "Informe Legal", estado: "Observado", fechaHora: "2026-04-08 09:45", archivoOriginal: "informe_legal_011.pdf", motivoRechazo: "Datos incompletos en el anexo B" },
    { id: "FIR-012", expedienteId: "EXP-2026-012", elaboradoPor: "Carlos Mendoza", tipoDocumento: "Carta", estado: "Pendiente", fechaHora: "2026-04-09 14:20", archivoOriginal: "carta_012.pdf" },
  ];

  readonly estadoColors: Record<EstadoExpediente, string> = {
    "Registrado": "#3B7DCC",
    "Ingresado": "#2C5AAB",
    "Pendiente": "#F2B801",
    "Observado": "#AB2741",
    "Firmado": "#0FBF90",
  };

  readonly datosReporte = [
    { estado: "Registrado", cantidad: 2, color: "#3B7DCC" },
    { estado: "Ingresado", cantidad: 2, color: "#2C5AAB" },
    { estado: "Pendiente", cantidad: 3, color: "#F2B801" },
    { estado: "Observado", cantidad: 2, color: "#AB2741" },
    { estado: "Firmado", cantidad: 4, color: "#0FBF90" },
  ];

  getMenusByRol(rol: RolUsuario): MenuSistema[] {
    const rolData = this.rolesMock.find(r => r.nombre === rol);
    if (!rolData) return [];
    return this.menusMock.filter(m => rolData.menus.includes(m.id) && m.activo);
  }

  getDefaultRouteByRol(rol: RolUsuario): string {
    const menus = this.getMenusByRol(rol);
    return menus.length > 0 ? menus[0].ruta : '/login';
  }
}