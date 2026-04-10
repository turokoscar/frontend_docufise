import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Firma, EstadoExpediente } from '../../core/models/user.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
  lucidePenTool, 
  lucideSearch, 
  lucideChevronDown, 
  lucideFileSpreadsheet,
  lucideInbox,
  lucideDownload,
  lucideClock,
  lucideCheckCircle2,
  lucideAlertTriangle,
  lucideXCircle,
  lucideFileCheck,
  lucideInfo,
  lucideArrowRight,
  lucideFileText,
  lucideHelpCircle,
  lucideUpload,
  lucideCheck,
  lucideX
} from '@ng-icons/lucide';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-firmas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHome, lucidePenTool, lucideSearch, lucideChevronDown, 
      lucideFileSpreadsheet, lucideInbox, lucideDownload, lucideClock, 
      lucideCheckCircle2, lucideAlertTriangle, lucideXCircle, lucideFileCheck,
      lucideInfo, lucideArrowRight, lucideFileText, lucideHelpCircle,
      lucideUpload, lucideCheck, lucideX
    })
  ],
  templateUrl: './firmas.page.html',
  styleUrl: './firmas.page.css'
})
export class FirmasPage implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  user = this.authService.user;
  tiposDocumento = this.dataService.tiposDocumento;
  
  // State
  allFirmas = signal<Firma[]>([]);
  selectedFirma = signal<Firma | null>(null);
  showSignModal = signal(false);
  showRejectModal = signal(false);
  motivoRechazo = signal('');

  // Toast
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);

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
    this.allFirmas.set([...this.dataService.firmasMock]);
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  // KPIs
  kpis = computed(() => {
    const data = this.allFirmas();
    const countByState = (s: EstadoExpediente) => data.filter((f: Firma) => f.estado === s).length;
    return [
      { label: "Bandeja", value: data.length, icon: 'lucideInbox', color: "#2C5AAB" },
      { label: "Ingresados", value: countByState("Ingresado"), icon: 'lucideDownload', color: "#2C5AAB" },
      { label: "Pendientes", value: countByState("Pendiente"), icon: 'lucideClock', color: "#F2B801" },
      { label: "Firmados", value: countByState("Firmado"), icon: 'lucideCheckCircle2', color: "#0FBF90" },
      { label: "Observados", value: countByState("Observado"), icon: 'lucideAlertTriangle', color: "#AB2741" },
    ];
  });

  filteredFirmas = computed(() => {
    let result = this.allFirmas();
    const f = this.filters();

    if (f.search) {
      const s = f.search.toLowerCase();
      result = result.filter((e: Firma) => 
        e.elaboradoPor.toLowerCase().includes(s) || 
        e.tipoDocumento.toLowerCase().includes(s) ||
        e.id.toLowerCase().includes(s)
      );
    }
    if (f.estado !== 'all') {
      result = result.filter((e: Firma) => e.estado === f.estado);
    }
    if (f.tipo !== 'all') {
      result = result.filter((e: Firma) => e.tipoDocumento === f.tipo);
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

  getEstadoBadgeClass(estado: EstadoExpediente): string {
    const styles: Record<EstadoExpediente, string> = {
      'Registrado': 'bg-[#3B7DCC]/15 text-[#3B7DCC] border border-[#3B7DCC]/30',
      'Ingresado': 'bg-primary/15 text-primary border border-primary/30',
      'Pendiente': 'bg-warning/15 text-[hsl(var(--warning))] border border-warning/30',
      'Observado': 'bg-destructive/15 text-destructive border border-destructive/30',
      'Firmado': 'bg-success/15 text-[hsl(var(--success))] border border-success/30',
    };
    return `font-ui text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[estado]}`;
  }

  handleDescargar(firma: Firma): void {
    if (firma.estado !== 'Ingresado') return;
    this.allFirmas.update((prev: Firma[]) => 
      prev.map((f: Firma) => 
        f.id === firma.id && f.estado === 'Ingresado' 
          ? { ...f, estado: 'Pendiente' as EstadoExpediente } 
          : f
      )
    );
    this.showNotification('Se ha descargado el documento, se inicia el proceso para firma', 'success');
  }

  openSignModal(firma: Firma): void {
    if (firma.estado !== 'Pendiente') return;
    this.selectedFirma.set(firma);
    this.showSignModal.set(true);
  }

  openRejectModal(firma: Firma): void {
    if (firma.estado !== 'Pendiente') return;
    this.selectedFirma.set(firma);
    this.motivoRechazo.set('');
    this.showRejectModal.set(true);
  }

  closeSignModal(): void {
    this.showSignModal.set(false);
    this.selectedFirma.set(null);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.selectedFirma.set(null);
    this.motivoRechazo.set('');
  }

  confirmSign(): void {
    const firma = this.selectedFirma();
    if (!firma) return;
    
    this.allFirmas.update(prev => 
      prev.map(f => 
        f.id === firma.id 
          ? { ...f, estado: 'Firmado' as EstadoExpediente, archivoFirmado: `${f.archivoOriginal?.replace('.pdf', '')}_firmado.pdf` } 
          : f
      )
    );
    this.showNotification(`Documento ${firma.id} firmado exitosamente. Estado: FIRMADO`, 'success');
    this.closeSignModal();
  }

  confirmReject(): void {
    const firma = this.selectedFirma();
    const motivo = this.motivoRechazo().trim();
    if (!firma || !motivo) {
      this.showNotification('Ingrese el motivo del rechazo', 'error');
      return;
    }

    this.allFirmas.update(prev => 
      prev.map(f => 
        f.id === firma.id 
          ? { ...f, estado: 'Observado' as EstadoExpediente, motivoRechazo: motivo } 
          : f
      )
    );
    this.showNotification(`Documento ${firma.id} observado. Retorna al elaborador.`, 'error');
    this.closeRejectModal();
  }

  exportToExcel(): void {
    const data = this.filteredFirmas().map(f => ({
      'Elaborado por': f.elaboradoPor,
      'Tipo Documento': f.tipoDocumento,
      'Estado': f.estado,
      'Fecha y Hora': f.fechaHora,
      'Archivo Original': f.archivoOriginal || '',
      'Archivo Firmado': f.archivoFirmado || '',
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Firmas');
    XLSX.writeFile(wb, `Firmas_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.showNotification('Archivo Excel descargado exitosamente', 'success');
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  Math = Math;
}