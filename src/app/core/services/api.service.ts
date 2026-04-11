import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  exitoso: boolean;
  respuesta: number;
  codigo: number | null;
  mensaje: string;
  datos: T;
  total: number | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(usuario: string, contrasena: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, {
      nombreUsuario: usuario,
      contrasena: contrasena
    });
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/logout`, {});
  }

  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/refresh`, {});
  }

  getSesiones(): Observable<ApiResponse<SesionResponse[]>> {
    return this.http.get<ApiResponse<SesionResponse[]>>(`${this.baseUrl}/auth/sesiones`);
  }

  cerrarSesion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/auth/sesiones/${id}`);
  }

  cerrarTodasSesiones(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/auth/sesiones`);
  }

  // Areas
  getAreas(): Observable<ApiResponse<Area[]>> {
    return this.http.get<ApiResponse<Area[]>>(`${this.baseUrl}/areas`);
  }

  getArea(id: number): Observable<ApiResponse<Area>> {
    return this.http.get<ApiResponse<Area>>(`${this.baseUrl}/areas/${id}`);
  }

  createArea(area: Partial<Area>): Observable<ApiResponse<Area>> {
    return this.http.post<ApiResponse<Area>>(`${this.baseUrl}/areas`, area);
  }

  updateArea(id: number, area: Partial<Area>): Observable<ApiResponse<Area>> {
    return this.http.put<ApiResponse<Area>>(`${this.baseUrl}/areas/${id}`, area);
  }

  deleteArea(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/areas/${id}`);
  }

  // Roles
  getRoles(): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponse<Rol[]>>(`${this.baseUrl}/roles`);
  }

  getRol(id: number): Observable<ApiResponse<Rol>> {
    return this.http.get<ApiResponse<Rol>>(`${this.baseUrl}/roles/${id}`);
  }

  createRol(rol: Partial<Rol>): Observable<ApiResponse<Rol>> {
    return this.http.post<ApiResponse<Rol>>(`${this.baseUrl}/roles`, rol);
  }

  updateRol(id: number, rol: Partial<Rol>): Observable<ApiResponse<Rol>> {
    return this.http.put<ApiResponse<Rol>>(`${this.baseUrl}/roles/${id}`, rol);
  }

  deleteRol(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/roles/${id}`);
  }

  // Menus
  getMenus(): Observable<ApiResponse<MenuApi[]>> {
    return this.http.get<ApiResponse<MenuApi[]>>(`${this.baseUrl}/menus`);
  }

  getMenusByRol(rolId: number): Observable<ApiResponse<MenuApi[]>> {
    return this.http.get<ApiResponse<MenuApi[]>>(`${this.baseUrl}/menus/rol/${rolId}`);
  }

  // Tipos de Documento
  getTiposDocumento(): Observable<ApiResponse<TipoDocumento[]>> {
    return this.http.get<ApiResponse<TipoDocumento[]>>(`${this.baseUrl}/tipos-documento`);
  }

  // Estados
  getEstados(): Observable<ApiResponse<Estado[]>> {
    return this.http.get<ApiResponse<Estado[]>>(`${this.baseUrl}/estados`);
  }

  // Documentos
  getDocumentos(params?: DocumentoParams): Observable<ApiResponse<Documento[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.tipoDocumentoId) httpParams = httpParams.set('tipoDocumentoId', params.tipoDocumentoId.toString());
      if (params.areaDestinoId) httpParams = httpParams.set('areaDestinoId', params.areaDestinoId.toString());
    }
    return this.http.get<ApiResponse<Documento[]>>(`${this.baseUrl}/documentos`, { params: httpParams });
  }

  getDocumento(id: number): Observable<ApiResponse<Documento>> {
    return this.http.get<ApiResponse<Documento>>(`${this.baseUrl}/documentos/${id}`);
  }

  createDocumento(documento: Partial<Documento>): Observable<ApiResponse<Documento>> {
    return this.http.post<ApiResponse<Documento>>(`${this.baseUrl}/documentos`, documento);
  }

  updateDocumento(id: number, documento: Partial<Documento>): Observable<ApiResponse<Documento>> {
    return this.http.patch<ApiResponse<Documento>>(`${this.baseUrl}/documentos/${id}`, documento);
  }

  deleteDocumento(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/documentos/${id}`);
  }

  // Firmas
  getFirmas(params?: FirmasParams): Observable<ApiResponse<Firma[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.usuarioAsignadoId) httpParams = httpParams.set('usuarioAsignadoId', params.usuarioAsignadoId.toString());
    }
    return this.http.get<ApiResponse<Firma[]>>(`${this.baseUrl}/firmas`, { params: httpParams });
  }

  getFirma(id: number): Observable<ApiResponse<Firma>> {
    return this.http.get<ApiResponse<Firma>>(`${this.baseUrl}/firmas/${id}`);
  }

  createFirma(firma: Partial<Firma>): Observable<ApiResponse<Firma>> {
    return this.http.post<ApiResponse<Firma>>(`${this.baseUrl}/firmas`, firma);
  }

  FirmarDocumento(id: number, rutaArchivoFirmado: string): Observable<ApiResponse<Firma>> {
    return this.http.post<ApiResponse<Firma>>(`${this.baseUrl}/firmas/${id}/firmar`, { rutaArchivoFirmado });
  }

  RechazarFirma(id: number, motivo: string): Observable<ApiResponse<Firma>> {
    return this.http.post<ApiResponse<Firma>>(`${this.baseUrl}/firmas/${id}/rechazar`, { motivoRechazo: motivo });
  }

  // Usuarios
  getUsuarios(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.baseUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`);
  }

  createUsuario(usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/usuarios/${id}`);
  }
}

// Types
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

export interface Area {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  activo: boolean;
}

export interface Documento {
  id: number;
  numeracion: string;
  tipoDocumentoId: number;
  tipoDocumento?: TipoDocumento;
  usuarioElaboraId: number;
  usuarioElabora?: Usuario;
  usuarioEnviaId?: number;
  fechaElaboracion: string;
  fechaHoraEnvio?: string;
  estadoId: number;
  estado?: Estado;
  rutaArchivoOriginal?: string;
  rutaArchivoFirmado?: string;
  areaDestinoId?: number;
  areaDestino?: Area;
  usuarioDestinoId?: number;
  usuarioDestino?: Usuario;
  observaciones?: string;
}

export interface DocumentoParams {
  estado?: string;
  tipoDocumentoId?: number;
  areaDestinoId?: number;
}

export interface Firma {
  id: number;
  documentoId: number;
  documento?: Documento;
  usuarioAsignadoId: number;
  usuarioAsignado?: Usuario;
  estadoId: number;
  estado?: Estado;
  fechaAsignacion: string;
  fechaDescarga?: string;
  fechaFirma?: string;
  rutaArchivoOriginal?: string;
  rutaArchivoFirmado?: string;
  motivoRechazo?: string;
  ipDescarga?: string;
  ipFirma?: string;
}

export interface FirmasParams {
  estado?: string;
  usuarioAsignadoId?: number;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  areaId?: number;
  area?: Area;
  rolId?: number;
  rol?: Rol;
  ultimoLogin?: string;
  intentosFallo?: number;
  bloqueoHasta?: string;
  activo: boolean;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  nivelPermiso: number;
  activo: boolean;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Estado {
  id: number;
  nombre: string;
  descripcion: string;
  colorHex: string;
  orden: number;
  activo: boolean;
}

export interface MenuApi {
  id: number;
  nombre: string;
  ruta: string;
  icono: string;
  orden: number;
  activo: boolean;
}