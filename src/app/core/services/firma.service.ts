import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Firma, FirmasParams } from '../models/firma.model';

@Injectable({ providedIn: 'root' })
export class FirmaService {
  private _firmas = signal<Firma[]>([]);
  private _loading = signal(false);

  readonly firmas = this._firmas.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(params?: FirmasParams): void {
    this._loading.set(true);
    this.api.getFirmas(params).subscribe({
      next: (res) => {
        this._firmas.set(res);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  loadPendientes(usuarioId: number): void {
    this._loading.set(true);
    this.api.getFirmas({ usuarioAsignadoId: usuarioId }).subscribe({
      next: (res) => {
        const pendientes = res.filter((f: Firma) => f.estado === 'PENDIENTE');
        this._firmas.set(pendientes);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  descargar(id: number, ip: string): void {
    this._loading.set(true);
    this.api.marcarDescargado(id, ip).subscribe({
      next: () => {
        this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  firmar(id: number, rutaArchivoFirmado: string, ip: string): void {
    this._loading.set(true);
    this.api.FirmarDocumento(id, { rutaArchivoFirmado, ipFirma: ip }).subscribe({
      next: () => {
        this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  rechazar(id: number, motivo: string): void {
    this._loading.set(true);
    this.api.RechazarFirma(id, motivo).subscribe({
      next: () => {
        this.loadAll();
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }
}