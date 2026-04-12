export interface Firma {
  id: number;
  documentoId: number;
  documentoNumeracion?: string;
  documentoTipoDocumento?: string;
  documentoUsuarioElabora?: string;
  usuarioAsignadoId: number;
  usuarioAsignadoNombre?: string;
  estadoId: number;
  estado?: string;
  fechaAsignacion: string;
  fechaDescarga?: string;
  fechaFirma?: string;
  rutaArchivoOriginal?: string;
  rutaArchivoFirmado?: string;
  motivoRechazo?: string;
  ipDescarga?: string;
  ipFirma?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FirmasParams {
  estado?: string;
  usuarioAsignadoId?: number;
}

