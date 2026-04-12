export interface LoginResponse {
  token: string;
  usuarioId: number;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  rol: string;
  rolId: number;
  area: string;
}

export interface SesionResponse {
  id: number;
  ipAddress: string;
  userAgent: string;
  fechaLogin: string;
  ultimaActividad: string;
  activo: boolean;
}
