import { Injectable, signal } from '@angular/core';
import { ApiService, Documento, DocumentoParams } from './api.service';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private _documentos = signal<any[]>([]);
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
        if (res.exitoso) {
          this._documentos.set(res.datos);
          this._total.set(res.total || res.datos.length);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  create(data: Partial<Documento>): void {
    this._loading.set(true);
    this.api.createDocumento(data).subscribe({
      next: (res) => {
        if (res.exitoso) this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  update(id: number, data: Partial<Documento>): void {
    this._loading.set(true);
    this.api.updateDocumento(id, data).subscribe({
      next: (res) => {
        if (res.exitoso) this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  delete(id: number): void {
    this._loading.set(true);
    this.api.deleteDocumento(id).subscribe({
      next: (res) => {
        if (res.exitoso) this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }
}