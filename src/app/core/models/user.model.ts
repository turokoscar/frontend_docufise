export type EstadoExpediente = 'Registrado' | 'Ingresado' | 'Pendiente' | 'Observado' | 'Firmado';

export type RolUsuario = 'CTD' | 'Firmante' | 'Administrador';

export interface UsuarioSistema {
  id: string;
  usuario: string;
  contrasena: string;
  nombre: string;
  correo: string;
  area: string;
  rol: RolUsuario;
  activo: boolean;
}

export interface AreaSistema {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface RolSistema {
  id: string;
  nombre: RolUsuario;
  descripcion: string;
  menus: string[];
}

export interface MenuSistema {
  id: string;
  nombre: string;
  ruta: string;
  icono: string;
  orden: number;
  activo: boolean;
}

export interface Expediente {
  id: string;
  numeracion: string;
  tipoDocumento: string;
  elaboradoPor: string;
  enviadoPor: string;
  fechaElaboracion: string;
  fechaHoraEnvio: string;
  estado: EstadoExpediente;
  archivoOriginal?: string;
  archivoFirmado?: string;
  areaDestino?: string;
  usuarioDestino?: string;
  observaciones?: string;
  motivoRechazo?: string;
}

export interface Firma {
  id: string;
  expedienteId: string;
  elaboradoPor: string;
  tipoDocumento: string;
  estado: EstadoExpediente;
  fechaHora: string;
  archivoOriginal?: string;
  archivoFirmado?: string;
  motivoRechazo?: string;
}