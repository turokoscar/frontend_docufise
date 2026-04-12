import { Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideFileText, lucideX, lucideInfo, lucidePlus, lucidePencil, lucideUpload } from '@ng-icons/lucide';

import { UiModalComponent } from '../../../../shared/components/ui/modal/modal.component';
import { UiInputComponent } from '../../../../shared/components/ui/input/input.component';
import { UiSelectComponent } from '../../../../shared/components/ui/select/select.component';
import { UiButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

import { Documento } from '../../../../core/models/documento.model';
import { CatalogService } from '../../../../core/services/catalog.service';
import { DocumentoService } from '../../../../core/services/documento.service';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-expediente-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    UiModalComponent,
    UiInputComponent,
    UiSelectComponent,
    UiButtonComponent,
    FileUploadComponent
  ],
  providers: [
    provideIcons({ lucideFileText, lucideX, lucideInfo, lucidePlus, lucidePencil, lucideUpload })
  ],
  template: `
    <app-ui-modal 
      [isOpen]="isOpen()" 
      (onClose)="close()"
      maxWidth="max-w-lg"
    >
      <div header class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <ng-icon name="lucideFileText" class="h-5 w-5 text-primary"></ng-icon>
        </div>
        <div>
          <h3 class="font-display text-lg font-bold">{{ documento() ? 'Actualizar Documento' : 'Gestión Documentaria' }}</h3>
          <p class="text-xs text-muted-foreground font-body mt-0.5">
            {{ documento() ? 'Editando ' + documento()?.numeracion : 'Complete los campos para registrar un nuevo documento' }}
          </p>
        </div>
      </div>

      <div body class="space-y-6">
        <!-- Datos generados automáticamente -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideInfo" class="text-muted-foreground text-[10px]"></ng-icon>
            <p class="text-[10px] font-ui font-bold text-muted-foreground uppercase tracking-widest">Datos generados automáticamente</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 rounded-xl p-4 border border-border/50">
            <app-ui-input label="Numeración" [value]="autoNumeracion()" [disabled]="true"></app-ui-input>
            <app-ui-input label="Fecha" [value]="autoFechaElab()" [disabled]="true"></app-ui-input>
            <app-ui-input label="Tipo" value="2026-FISE" [disabled]="true"></app-ui-input>
          </div>
        </div>

        <hr class="border-border/50" />

        <!-- Configuración del Documento -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucidePencil" class="text-primary text-[10px]"></ng-icon>
            <p class="text-[10px] font-ui font-bold text-muted-foreground uppercase tracking-widest">Configuración del Documento</p>
          </div>
          
          <app-ui-select 
            label="Tipo documento" 
            [value]="formTipoDoc()" 
            [required]="true"
            (onValueChange)="formTipoDoc.set($event)"
          >
            <option value="">Seleccione tipo...</option>
            <option *ngFor="let tipo of catalogService.tiposDocumento()" [value]="tipo.id">{{ tipo.nombre }}</option>
          </app-ui-select>

          <app-ui-select 
            label="Usuario Elaborador" 
            [value]="formElaborado()" 
            [required]="true"
            (onValueChange)="formElaborado.set($event)"
          >
            <option value="">Seleccione elaborador...</option>
            <option [value]="authService.user()?.id">{{ authService.user()?.nombre }} (Usted)</option>
          </app-ui-select>
        </div>

        <hr class="border-border/50" />

        <!-- Carga de Archivo -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideUpload" class="text-secondary text-[10px]"></ng-icon>
            <p class="text-[10px] font-ui font-bold text-muted-foreground uppercase tracking-widest">Carga de Documento Digital</p>
          </div>
          <app-file-upload
            [maxSizeMB]="10"
            acceptedTypes=".pdf,.doc,.docx"
            subfolder="documentos"
            (fileSelected)="onFileSelected($event)"
          ></app-file-upload>
          <p *ngIf="uploadedFilename()" class="text-xs text-primary font-medium flex items-center gap-1.5 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
            <ng-icon name="lucideFileText"></ng-icon>
            Archivo actual: {{ uploadedFilename() }}
          </p>
        </div>
      </div>

      <div footer class="flex justify-end gap-3">
        <app-ui-button variant="outline" (onClick)="close()">Cancelar</app-ui-button>
        <app-ui-button 
          variant="primary" 
          [loading]="isSaving()" 
          [disabled]="!isValid()"
          (onClick)="save()"
        >
          {{ documento() ? 'Actualizar Cambios' : 'Confirmar Registro' }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `
})
export class ExpedienteFormComponent {
  catalogService = inject(CatalogService);
  private documentoService = inject(DocumentoService);
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  isOpen = input<boolean>(false);
  documento = input<Documento | null>(null);
  autoNumeracion = input<string>('');
  autoFechaElab = input<string>('');

  onClose = output<void>();
  onSaved = output<void>();

  // Form State
  formTipoDoc = signal('');
  formElaborado = signal('');
  selectedFile = signal<File | null>(null);
  uploadedFilename = signal('');
  isSaving = signal(false);

  isValid = computed(() => !!this.formTipoDoc() && !!this.formElaborado());

  constructor() {
    effect(() => {
      const doc = this.documento();
      if (doc) {
        this.formTipoDoc.set(String(doc.tipoDocumentoId || ''));
        this.formElaborado.set(String(doc.usuarioElaboraId || ''));
        this.uploadedFilename.set(doc.rutaArchivoOriginal || '');
      } else {
        this.resetForm();
      }
    }, { allowSignalWrites: true });
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
  }

  resetForm(): void {
    this.formTipoDoc.set('');
    this.formElaborado.set('');
    this.selectedFile.set(null);
    this.uploadedFilename.set('');
  }

  close(): void {
    this.resetForm();
    this.onClose.emit();
  }

  save(): void {
    if (!this.isValid()) return;

    this.isSaving.set(true);
    const editing = this.documento();
    const file = this.selectedFile();

    if (file) {
      const formData = new FormData();
      formData.append('documento', new Blob([JSON.stringify({
        numeracion: editing?.numeracion || this.autoNumeracion(),
        tipoDocumentoId: Number(this.formTipoDoc()),
        usuarioElaboraId: Number(this.formElaborado()),
        fechaElaboracion: this.autoFechaElab(),
        estadoId: editing?.estadoId || 1,
        rutaArchivoOriginal: editing?.rutaArchivoOriginal || null
      })], { type: 'application/json' }));
      formData.append('archivo', file);

      const request = editing 
        ? this.apiService.updateDocumentWithFile(editing.id, formData)
        : this.apiService.uploadFileToDocument(formData);

      request.subscribe({
        next: () => {
          this.isSaving.set(false);
          this.onSaved.emit();
          this.close();
        },
        error: (err) => {
          this.isSaving.set(false);
          alert('Error al guardar documento: ' + (err.message || 'Error desconocido'));
        }
      });
    } else {
      if (editing) {
        this.documentoService.update(editing.id, {
          tipoDocumentoId: Number(this.formTipoDoc()),
          usuarioElaboraId: Number(this.formElaborado())
        });
      } else {
        this.documentoService.create({
          tipoDocumentoId: Number(this.formTipoDoc()),
          usuarioElaboraId: Number(this.formElaborado()),
          fechaElaboracion: this.autoFechaElab()
        });
      }
      this.isSaving.set(false);
      this.onSaved.emit();
      this.close();
    }
  }
}
