import { Component, input, output, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePenTool, lucideInfo, lucideX, lucideUpload, lucideFileCheck } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { UiButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

import { Firma } from '../../../../core/models/firma.model';
import { ApiService } from '../../../../core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    UiModalComponent,
    UiButtonComponent,
    FileUploadComponent
  ],
  providers: [
    provideIcons({ lucidePenTool, lucideInfo, lucideX, lucideUpload, lucideFileCheck })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-md"
      [paddingBody]="false"
    >
      <div header class="bg-gradient-to-r from-primary to-primary/80 -m-6 mb-0 p-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md">
            <ng-icon name="lucidePenTool" class="text-2xl text-white"></ng-icon>
          </div>
          <div>
            <h3 class="font-display text-xl font-bold text-white">Firmar Documento</h3>
            <p class="text-xs text-white/80 font-body">Suba el archivo con su firma digital</p>
          </div>
        </div>
      </div>

      <div body class="p-6 space-y-6">
        <div class="bg-muted/30 rounded-xl p-4 border border-border/40">
          <div class="flex items-center justify-between mb-1">
            <p class="text-[10px] font-ui text-muted-foreground uppercase tracking-wider">Número de Documento</p>
            <span class="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold uppercase">{{ firma()?.documentoTipoDocumento }}</span>
          </div>
          <p class="font-display text-lg font-bold text-foreground">{{ firma()?.documentoNumeracion }}</p>
        </div>
        
        <div class="space-y-3">
          <label class="font-ui text-xs text-muted-foreground uppercase block font-semibold tracking-wide">Cargar documento firmado (.pdf)</label>
          <app-file-upload
            [maxSizeMB]="10"
            acceptedTypes=".pdf"
            subfolder="firmas"
            (fileSelected)="onFileSelected($event)"
          ></app-file-upload>
          <p class="text-[10px] text-muted-foreground italic flex items-center gap-1">
            <ng-icon name="lucideInfo"></ng-icon>
            Asegúrese de que el archivo contenga su firma digital válida.
          </p>
        </div>
      </div>

      <div footer class="flex items-center justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button 
          variant="primary" 
          [loading]="isUploading()" 
          [disabled]="!selectedFile()"
          (onClick)="confirm()"
        >
          <div class="flex items-center gap-2">
            <ng-icon name="lucideFileCheck" class="h-4 w-4"></ng-icon>
            {{ isUploading() ? 'Procesando...' : 'Firmar Documento' }}
          </div>
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class SignModalComponent {
  private apiService = inject(ApiService);

  isOpen = input<boolean>(false);
  firma = input<Firma | null>(null);

  onClose = output<void>();
  onSigned = output<void>();

  selectedFile = signal<File | null>(null);
  isUploading = signal(false);

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  close(): void {
    this.selectedFile.set(null);
    this.onClose.emit();
  }

  confirm(): void {
    const f = this.firma();
    const file = this.selectedFile();
    if (!f || !file) return;

    this.isUploading.set(true);
    // Nota: El backend espera la IP, en un entorno real la obtenemos de un servicio.
    const ip = '0.0.0.0'; 

    this.apiService.uploadFirma(f.id, file, ip).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.onSigned.emit();
        this.close();
        
        Swal.fire({
          icon: 'success',
          title: 'Documento firmado',
          text: 'El documento ha sido firmado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.isUploading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error al firmar',
          text: err.message || 'Ocurrió un error al procesar la firma.',
          confirmButtonColor: '#AB2741'
        });
      }
    });
  }
}
