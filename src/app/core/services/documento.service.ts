import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Documento, DocumentoParams } from '../models/documento.model';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private _documentos = signal<Documento[]>([]);
  private _loading = signal(false);
  private _total = signal(0);

  readonly documentos = this._documentos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(params?: DocumentoParams): void {
    this._loading.set(true);
    this.api.getDocumentos(params).subscribe({
      next: (res) => {
        // Interceptor already unwrapped res.datos
        this._documentos.set(res);
        this._total.set(res.length); 
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  create(data: Partial<Documento>): void {
    this._loading.set(true);
    this.api.createDocumento(data).subscribe({
      next: () => {
        this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  update(id: number, data: Partial<Documento>): void {
    this._loading.set(true);
    this.api.updateDocumento(id, data).subscribe({
      next: () => {
        this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  delete(id: number): void {
    this._loading.set(true);
    this.api.deleteDocumento(id).subscribe({
      next: () => {
        this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }
}