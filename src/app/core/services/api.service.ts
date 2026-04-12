import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { 
  UsuarioSistema
} from '../models/usuario.model';
import { AreaSistema } from '../models/area.model';
import { RolSistema } from '../models/rol.model';
import { MenuSistema } from '../models/menu.model';
import { 
  Documento, 
  TipoDocumento, 
  Estado,
  DocumentoParams
} from '../models/documento.model';
import { Firma, FirmasParams } from '../models/firma.model';
import { LoginResponse, SesionResponse } from '../models/auth.model';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(usuario: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      nombreUsuario: usuario,
      contrasena: contrasena
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, {});
  }

  getSesiones(): Observable<SesionResponse[]> {
    return this.http.get<SesionResponse[]>(`${this.baseUrl}/auth/sesiones`);
  }

  cerrarSesion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/auth/sesiones/${id}`);
  }

  cerrarTodasSesiones(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/auth/sesiones`);
  }

  // Areas
  getAreas(): Observable<AreaSistema[]> {
    return this.http.get<AreaSistema[]>(`${this.baseUrl}/areas`);
  }

  getArea(id: number): Observable<AreaSistema> {
    return this.http.get<AreaSistema>(`${this.baseUrl}/areas/${id}`);
  }

  createArea(area: Partial<AreaSistema>): Observable<AreaSistema> {
    return this.http.post<AreaSistema>(`${this.baseUrl}/areas`, area);
  }

  updateArea(id: number, area: Partial<AreaSistema>): Observable<AreaSistema> {
    return this.http.patch<AreaSistema>(`${this.baseUrl}/areas/${id}`, area);
  }

  deleteArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/areas/${id}`);
  }

  // Roles
  getRoles(): Observable<RolSistema[]> {
    return this.http.get<RolSistema[]>(`${this.baseUrl}/roles`);
  }

  getRol(id: number): Observable<RolSistema> {
    return this.http.get<RolSistema>(`${this.baseUrl}/roles/${id}`);
  }

  createRol(rol: Partial<RolSistema>): Observable<RolSistema> {
    return this.http.post<RolSistema>(`${this.baseUrl}/roles`, rol);
  }

  updateRol(id: number, rol: Partial<RolSistema>): Observable<RolSistema> {
    return this.http.patch<RolSistema>(`${this.baseUrl}/roles/${id}`, rol);
  }

  deleteRol(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  // Menus
  getMenus(): Observable<MenuSistema[]> {
    return this.http.get<MenuSistema[]>(`${this.baseUrl}/menus`);
  }

  getMenusByRol(rolId: number): Observable<MenuSistema[]> {
    return this.http.get<MenuSistema[]>(`${this.baseUrl}/menus/rol/${rolId}`);
  }

  // Tipos de Documento
  getTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.baseUrl}/tipos-documento`);
  }

  // Estados
  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/estados`);
  }

  // Documentos
  getDocumentos(params?: DocumentoParams): Observable<Documento[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.tipoDocumentoId) httpParams = httpParams.set('tipoDocumentoId', params.tipoDocumentoId.toString());
      if (params.areaDestinoId) httpParams = httpParams.set('areaDestinoId', params.areaDestinoId.toString());
    }
    return this.http.get<Documento[]>(`${this.baseUrl}/documentos`, { params: httpParams });
  }

  getDocumento(id: number): Observable<Documento> {
    return this.http.get<Documento>(`${this.baseUrl}/documentos/${id}`);
  }

  createDocumento(documento: Partial<Documento>): Observable<Documento> {
    return this.http.post<Documento>(`${this.baseUrl}/documentos`, documento);
  }

  updateDocumento(id: number, documento: Partial<Documento>): Observable<Documento> {
    return this.http.patch<Documento>(`${this.baseUrl}/documentos/${id}`, documento);
  }

  deleteDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/documentos/${id}`);
  }

  // Firmas
  getFirmas(params?: FirmasParams): Observable<Firma[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.usuarioAsignadoId) httpParams = httpParams.set('usuarioAsignadoId', params.usuarioAsignadoId.toString());
    }
    return this.http.get<Firma[]>(`${this.baseUrl}/firmas`, { params: httpParams });
  }

  getFirma(id: number): Observable<Firma> {
    return this.http.get<Firma>(`${this.baseUrl}/firmas/${id}`);
  }

  createFirma(firma: Partial<Firma>): Observable<Firma> {
    return this.http.post<Firma>(`${this.baseUrl}/firmas`, firma);
  }

  marcarDescargado(id: number, ip: string): Observable<Firma> {
    return this.http.patch<Firma>(`${this.baseUrl}/firmas/${id}/descargar`, { ipDescarga: ip });
  }

  FirmarDocumento(id: number, data: { rutaArchivoFirmado: string, ipFirma: string }): Observable<Firma> {
    return this.http.patch<Firma>(`${this.baseUrl}/firmas/${id}/firmar`, data);
  }

  RechazarFirma(id: number, motivo: string): Observable<Firma> {
    return this.http.patch<Firma>(`${this.baseUrl}/firmas/${id}/rechazar`, { motivoRechazo: motivo });
  }

  // Usuarios
  getUsuarios(): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(`${this.baseUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<UsuarioSistema> {
    return this.http.get<UsuarioSistema>(`${this.baseUrl}/usuarios/${id}`);
  }

  createUsuario(usuario: Partial<UsuarioSistema>): Observable<UsuarioSistema> {
    return this.http.post<UsuarioSistema>(`${this.baseUrl}/usuarios`, usuario);
  }

  updateUsuario(id: number, usuario: Partial<UsuarioSistema>): Observable<UsuarioSistema> {
    return this.http.patch<UsuarioSistema>(`${this.baseUrl}/usuarios/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${id}`);
  }

  // Files - Upload with progress
  uploadFile(file: File, subfolder?: string): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    if (subfolder) {
      formData.append('subfolder', subfolder);
    }

    const req = new HttpRequest('POST', `${this.baseUrl}/files/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const loaded = event.loaded;
            const total = event.total ?? 0;
            return {
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            } as UploadProgress;
          case HttpEventType.Response:
            return {
              loaded: event.body?.datos?.size ?? file.size,
              total: file.size,
              percentage: 100
            } as UploadProgress;
          default:
            return { loaded: 0, total: file.size, percentage: 0 } as UploadProgress;
        }
      })
    );
  }

  uploadFileToDocument(documento: FormData): Observable<Documento> {
    return this.http.post<Documento>(`${this.baseUrl}/documentos`, documento);
  }

  updateDocumentWithFile(id: number, documento: FormData): Observable<Documento> {
    return this.http.put<Documento>(`${this.baseUrl}/documentos/${id}`, documento);
  }

  uploadFirma(id: number, file: File, ip: string): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('archivoFirmado', file);
    formData.append('ip', ip);

    const req = new HttpRequest('PATCH', `${this.baseUrl}/firmas/${id}/firmar`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const loaded = event.loaded;
            const total = event.total ?? 0;
            return {
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            } as UploadProgress;
          case HttpEventType.Response:
            return {
              loaded: file.size,
              total: file.size,
              percentage: 100
            } as UploadProgress;
          default:
            return { loaded: 0, total: file.size, percentage: 0 } as UploadProgress;
        }
      })
    );
  }

  downloadDocumento(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/files/${filename}`, {
      responseType: 'blob'
    });
  }

  downloadFirmaDocumento(firmaId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/firmas/${firmaId}/descargar-archivo`, {
      responseType: 'blob'
    });
  }
}
