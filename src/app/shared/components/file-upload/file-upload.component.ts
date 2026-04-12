import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideUpload, 
  lucideX, 
  lucideFile,
  lucideCircleCheck,
  lucideCircleAlert
} from '@ng-icons/lucide';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideUpload, lucideX, lucideFile, lucideCircleCheck, lucideCircleAlert 
    })
  ],
  template: `
    <div class="w-full">
      <!-- Drop Zone -->
      <div 
        class="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer"
        [class.border-gray-300]="!isDragOver()"
        [class.bg-gray-50]="!isDragOver()"
        [class.border-blue-500]="isDragOver()"
        [class.bg-blue-50]="isDragOver()"
        [class.border-green-500]="isSuccess()"
        [class.bg-green-50]="isSuccess()"
        [class.border-red-500]="isError()"
        [class.bg-red-50]="isError()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input 
          #fileInput 
          type="file" 
          class="hidden" 
          [accept]="acceptedTypes"
          (change)="onFileSelected($event)"
        />
        
        <ng-icon 
          name="lucideUpload" 
          class="w-10 h-10 mx-auto mb-3"
          [class.text-gray-400]="!isDragOver() && !isSuccess() && !isError()"
          [class.text-blue-500]="isDragOver()"
          [class.text-green-500]="isSuccess()"
          [class.text-red-500]="isError()"
        ></ng-icon>
        
        <p class="text-sm text-gray-600 mb-1">
          @if (isUploading()) {
            <span class="text-blue-600">Subiendo archivo...</span>
          } @else if (isSuccess()) {
            <span class="text-green-600">¡Archivo subido correctamente!</span>
          } @else if (isError()) {
            <span class="text-red-600">{{ errorMessage() }}</span>
          } @else {
            <span>Arrastra un archivo aquí o haz clic para seleccionar</span>
          }
        </p>
        <p class="text-xs text-gray-400">
          @if (maxSizeMB > 0) {
            Tamaño máximo: {{ maxSizeMB }}MB
          }
          @if (acceptedTypes.length > 0) {
             | Tipos permitidos: {{ acceptedTypes }}
          }
        </p>
      </div>

      <!-- Progress Bar -->
      @if (isUploading() || progress() > 0) {
        <div class="mt-3">
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>{{ currentFileName() }}</span>
            <span>{{ progress() }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              [style.width.%]="progress()"
            ></div>
          </div>
        </div>
      }

      <!-- Selected File -->
      @if (selectedFile() && !isUploading() && !isSuccess()) {
        <div class="mt-3 flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideFile" class="w-5 h-5 text-gray-500"></ng-icon>
            <span class="text-sm text-gray-700">{{ selectedFile()?.name }}</span>
            <span class="text-xs text-gray-400">({{ formatFileSize(selectedFile()?.size || 0) }})</span>
          </div>
          <button 
            type="button"
            (click)="clearFile($event)"
            class="text-gray-400 hover:text-red-500"
          >
            <ng-icon name="lucideX" class="w-4 h-4"></ng-icon>
          </button>
        </div>
      }

      <!-- Uploaded File Info -->
      @if (isSuccess() && uploadedFilename()) {
        <div class="mt-3 flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideCircleCheck" class="w-5 h-5 text-green-500"></ng-icon>
            <span class="text-sm text-green-700">{{ uploadedFilename() }}</span>
          </div>
          <button 
            type="button"
            (click)="clearFile($event)"
            class="text-green-400 hover:text-green-600"
          >
            <ng-icon name="lucideX" class="w-4 h-4"></ng-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class FileUploadComponent {
  @Input() maxSizeMB: number = 10;
  @Input() acceptedTypes: string = '.pdf,.doc,.docx,.xls,.xlsx';
  @Input() subfolder: string = '';
  @Input() disabled: boolean = false;
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadProgress = new EventEmitter<number>();
  @Output() uploadComplete = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFile = signal<File | null>(null);
  isDragOver = signal(false);
  isUploading = signal(false);
  isSuccess = signal(false);
  isError = signal(false);
  progress = signal(0);
  currentFileName = signal('');
  uploadedFilename = signal('');
  errorMessage = signal('');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    if (this.disabled) return;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    this.clearState();
    
    const maxBytes = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      this.isError.set(true);
      this.errorMessage.set(`El archivo excede el tamaño máximo de ${this.maxSizeMB}MB`);
      return;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = this.acceptedTypes.split(',').map(e => e.trim().toLowerCase());
    
    if (!allowedExtensions.includes(extension)) {
      this.isError.set(true);
      this.errorMessage.set(`Tipo de archivo no permitido. Use: ${this.acceptedTypes}`);
      return;
    }

    this.selectedFile.set(file);
    this.fileSelected.emit(file);
  }

  clearFile(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.clearState();
    this.selectedFile.set(null);
    this.uploadedFilename.set('');
  }

  private clearState(): void {
    this.isDragOver.set(false);
    this.isUploading.set(false);
    this.isSuccess.set(false);
    this.isError.set(false);
    this.progress.set(0);
    this.errorMessage.set('');
  }

  setUploading(filename: string): void {
    this.isUploading.set(true);
    this.currentFileName.set(filename);
    this.progress.set(0);
  }

  updateProgress(percent: number): void {
    this.progress.set(percent);
    this.uploadProgress.emit(percent);
  }

  setUploadComplete(filename: string): void {
    this.isUploading.set(false);
    this.isSuccess.set(true);
    this.progress.set(100);
    this.uploadedFilename.set(filename);
    this.uploadComplete.emit(filename);
  }

  setUploadError(message: string): void {
    this.isUploading.set(false);
    this.isError.set(true);
    this.errorMessage.set(message);
    this.uploadError.emit(message);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}