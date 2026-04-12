import { UsuarioSistema } from './usuario.model';
import { AreaSistema } from './area.model';

export type EstadoDocumentoLabel = 'Registrado' | 'Ingresado' | 'Pendiente' | 'Observado' | 'Firmado';

export interface Estado {
  id: number;
  nombre: EstadoDocumentoLabel;
  descripcion: string;
  colorHex: string;
  orden: number;
  activo: boolean;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Documento {
  id: number;
  numeracion: string;
  tipoDocumentoId: number;
  tipoDocumento?: string;
  usuarioElaboraId: number;
  usuarioElabora?: string;
  usuarioEnviaId?: number;
  usuarioEnvia?: string;
  fechaElaboracion: string;
  fechaHoraEnvio?: string;
  estadoId: number;
  estado?: string;
  rutaArchivoOriginal?: string;
  rutaArchivoFirmado?: string;
  areaDestinoId?: number;
  areaDestino?: string;
  usuarioDestinoId?: number;
  usuarioDestino?: string;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentoParams {
  estado?: string;
  tipoDocumentoId?: number;
  areaDestinoId?: number;
}

