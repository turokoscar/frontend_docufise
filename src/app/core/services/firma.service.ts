import { Injectable, signal } from '@angular/core';
import { ApiService, Firma, FirmasParams } from './api.service';

@Injectable({ providedIn: 'root' })
export class FirmaService {
  private _firmas = signal<any[]>([]);
  private _loading = signal(false);

  readonly firmas = this._firmas.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(params?: FirmasParams): void {
    this._loading.set(true);
    this.api.getFirmas(params).subscribe({
      next: (res) => {
        if (res.exitoso) this._firmas.set(res.datos);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  loadPendientes(usuarioId: number): void {
    this._loading.set(true);
    this.api.getFirmas({ usuarioAsignadoId: usuarioId }).subscribe({
      next: (res) => {
        if (res.exitoso) {
          const pendientes = res.datos.filter((f: any) => f.estado?.nombre === 'Pendiente');
          this._firmas.set(pendientes);
        }
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  firmar(id: number, rutaArchivoFirmado: string): void {
    this._loading.set(true);
    this.api.FirmarDocumento(id, rutaArchivoFirmado).subscribe({
      next: (res) => {
        if (res.exitoso) this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  rechazar(id: number, motivo: string): void {
    this._loading.set(true);
    this.api.RechazarFirma(id, motivo).subscribe({
      next: (res) => {
        if (res.exitoso) this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }
}