import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../core/services/firma.service';
import { CatalogService } from '../../core/services/catalog.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Firma, FirmasParams } from '../../core/models/firma.model';
import { EstadoDocumentoLabel } from '../../core/models/documento.model';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucidePenTool, 
  lucideSearch, 
  lucideChevronDown, 
  lucideFileSpreadsheet,
  lucideInbox,
  lucideDownload,
  lucideClock,
  lucideCircleCheck,
  lucideTriangleAlert,
  lucideCircleX,
  lucideFileCheck,
  lucideInfo,
  lucideArrowRight,
  lucideFileText,
  lucideCircleHelp,
  lucideUpload,
  lucideCheck,
  lucideX
} from '@ng-icons/lucide';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-firmas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent, FileUploadComponent],
  providers: [
    provideIcons({ 
      lucideHouse, lucidePenTool, lucideSearch, lucideChevronDown, 
      lucideFileSpreadsheet, lucideInbox, lucideDownload, lucideClock, 
      lucideCircleCheck, lucideTriangleAlert, lucideCircleX, lucideFileCheck,
      lucideInfo, lucideArrowRight, lucideFileText, lucideCircleHelp,
      lucideUpload, lucideCheck, lucideX
    })
  ],
  templateUrl: './firmas.page.html',
  styleUrl: './firmas.page.css'
})
export class FirmasPage implements OnInit {
  private firmaService = inject(FirmaService);
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  user = this.authService.user;
  get tiposDocumento() { return this.catalogService.tiposDocumento(); }
  get estados() { return this.catalogService.estados(); }
  
  // State local que sincroniza con el servicio
  allFirmas = computed(() => this.firmaService.firmas());
  loading = this.firmaService.loading;
  selectedFirma = signal<Firma | null>(null);
  showSignModal = signal(false);
  showRejectModal = signal(false);
  motivoRechazo = signal('');
  
  // Upload state
  selectedSignedFile = signal<File | null>(null);
  isUploadingSigned = signal(false);

  // Filters
  filters = signal({
    search: '',
    estado: 'all',
    tipo: 'all'
  });

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  ngOnInit(): void {
    // Cargar catálogos a demanda solo cuando se necesita esta página
    this.catalogService.loadTiposDocumento();
    this.catalogService.loadEstados();
    
    // Cargar firmas desde API usando el ID del usuario actual
    const usuarioId = this.authService.user()?.id;
    if (usuarioId) {
      this.firmaService.loadAll({ usuarioAsignadoId: usuarioId });
    }
  }

  // KPIs
  kpis = computed(() => {
    const data = this.allFirmas();
    const countByState = (s: EstadoDocumentoLabel) => data.filter((f: Firma) => f.estado === s).length;
    return [
      { label: "Bandeja", value: data.length, icon: 'lucideInbox', color: "#2C5AAB" },
      { label: "Ingresados", value: countByState("INGRESADO"), icon: 'lucideDownload', color: "#2C5AAB" },
      { label: "Pendientes", value: countByState("PENDIENTE"), icon: 'lucideClock', color: "#F2B801" },
      { label: "Firmados", value: countByState("FIRMADO"), icon: 'lucideCircleCheck', color: "#0FBF90" },
      { label: "Observados", value: countByState("OBSERVADO"), icon: 'lucideTriangleAlert', color: "#AB2741" },
    ];
  });

  filteredFirmas = computed(() => {
    let result = this.allFirmas();
    const f = this.filters();

    if (f.search) {
      const s = f.search.toLowerCase();
      result = result.filter((e: Firma) => 
        (e.documentoUsuarioElabora || '').toLowerCase().includes(s) || 
        (e.documentoTipoDocumento || '').toLowerCase().includes(s) ||
        (e.documentoNumeracion || '').toLowerCase().includes(s) ||
        String(e.id).includes(s)
      );
    }
    if (f.estado !== 'all') {
      result = result.filter((e: Firma) => e.estado === f.estado);
    }
    if (f.tipo !== 'all') {
      result = result.filter((e: Firma) => String(e.documentoId) === f.tipo);
    }
    return result;
  });

  paginatedFirmas = computed(() => {
    const data = this.filteredFirmas();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredFirmas().length / this.itemsPerPage));

  paginatedPages(): number[] {
    const total = this.totalPages();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const current = this.currentPage();
    if (current <= 2) return [1, 2, 3, 4, total];
    if (current >= total - 1) return [1, total - 3, total - 2, total - 1, total];
    return [1, current - 1, current, current + 1, total];
  }

  // Handlers
  updateFilters(key: string, value: string): void {
    this.filters.update((f: any) => ({ ...f, [key]: value }));
    this.currentPage.set(1);
  }

  getEstadoBadgeClass(estado?: string): string {
    if (!estado) return '';
    const styles: Record<string, string> = {
      'REGISTRADO': 'bg-[#3B7DCC]/15 text-[#3B7DCC] border border-[#3B7DCC]/30',
      'INGRESADO': 'bg-primary/15 text-primary border border-primary/30',
      'PENDIENTE': 'bg-warning/15 text-[#F2B801] border border-warning/30',
      'OBSERVADO': 'bg-destructive/15 text-destructive border border-destructive/30',
      'FIRMADO': 'bg-success/15 text-[#0FBF90] border border-success/30',
    };
    return `font-ui text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[estado] || ''}`;
  }

  handleDescargar(firma: Firma): void {
    if (firma.estado !== 'INGRESADO') return;
    
    this.apiService.downloadFirmaDocumento(firma.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${firma.documentoNumeracion || 'documento'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Recargar el listado para reflejar el cambio de estado automático del backend
        this.refreshList();
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Documento descargado',
          text: 'El estado se ha actualizado a PENDIENTE.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          iconColor: '#2C5AAB',
          background: '#fff',
          color: '#2C5AAB'
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al descargar',
          text: err.message || 'Error desconocido',
          confirmButtonColor: '#AB2741'
        });
      }
    });
  }

  handleVerArchivoFirmado(firma: Firma): void {
    if (!firma.id) return;
    
    this.apiService.downloadFirmaFirmada(firma.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${firma.documentoNumeracion || 'documento'}_firmado.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Archivo firmado descargado',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al descargar',
          text: 'No se pudo recuperar el archivo firmado.',
          confirmButtonColor: '#AB2741'
        });
      }
    });
  }

  openSignModal(firma: Firma): void {
    if (firma.estado !== 'PENDIENTE') return;
    this.selectedFirma.set(firma);
    this.selectedSignedFile.set(null);
    this.showSignModal.set(true);
  }

  openRejectModal(firma: Firma): void {
    if (firma.estado !== 'PENDIENTE') return;
    this.selectedFirma.set(firma);
    this.motivoRechazo.set('');
    this.showRejectModal.set(true);
  }

  onSignedFileSelected(file: File): void {
    this.selectedSignedFile.set(file);
  }

  closeSignModal(): void {
    this.showSignModal.set(false);
    this.selectedFirma.set(null);
    this.selectedSignedFile.set(null);
  }

  private getClientIp(): string {
    // En una app real, esto vendría de un servicio de configuración o del backend
    // Por ahora, usamos un placeholder más descriptivo o '0.0.0.0' si es desconocido
    return '0.0.0.0'; 
  }

  private refreshList(): void {
    const usuarioId = this.authService.user()?.id;
    if (usuarioId) {
      this.firmaService.loadAll({ usuarioAsignadoId: usuarioId });
    }
  }

  confirmSign(): void {
    const firma = this.selectedFirma();
    const file = this.selectedSignedFile();
    if (!firma) return;
    
    const ip = this.getClientIp();

    if (file) {
      this.isUploadingSigned.set(true);
      this.apiService.uploadFirma(firma.id, file, ip).subscribe({
        next: () => {
          this.isUploadingSigned.set(false);
          this.refreshList();
          this.closeSignModal();
          
          Swal.fire({
            icon: 'success',
            title: 'Documento firmado',
            text: 'El documento ha sido firmado exitosamente y el estado se ha actualizado.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.isUploadingSigned.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Error al firmar',
            text: err.message || 'Ocurrió un error al procesar la firma.',
            confirmButtonColor: '#AB2741'
          });
        }
      });
    } else {
      // Si no hay archivo (flujo alternativo), usamos el servicio
      this.firmaService.firmar(firma.id, `${firma.rutaArchivoOriginal?.replace('.pdf', '')}_firmado.pdf`, ip);
      this.closeSignModal();
    }
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.selectedFirma.set(null);
    this.motivoRechazo.set('');
  }

  confirmReject(): void {
    const firma = this.selectedFirma();
    const motivo = this.motivoRechazo().trim();
    if (!firma || !motivo) {
      return;
    }

    this.firmaService.rechazar(firma.id, motivo);
    this.closeRejectModal();
  }

  exportToExcel(): void {
    const data = this.filteredFirmas().map(f => ({
      'Elaborado por': f.documentoUsuarioElabora,
      'Tipo Documento': f.documentoTipoDocumento,
      'Estado': f.estado,
      'Fecha Asignación': f.fechaAsignacion,
      'Archivo Original': f.rutaArchivoOriginal || '',
      'Archivo Firmado': f.rutaArchivoFirmado || '',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Firmas');
    XLSX.writeFile(wb, `Firmas_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  Math = Math;
}