import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaService } from '../../core/services/firma.service';
import { CatalogService } from '../../core/services/catalog.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Firma } from '../../core/models/firma.model';
import { ESTADOS_EXPEDIENTE } from '../../core/constants/states.constants';

// Shared UI Components
import { PageHeaderComponent } from '../../shared/components/ui/page-header/page-header.component';
import { KpiCardComponent } from '../../shared/components/ui/kpi-card/kpi-card.component';
import { SectionLabelComponent } from '../../shared/components/ui/section-label/section-label.component';
import { FilterPanelComponent } from '../../shared/components/ui/filter-panel/filter-panel.component';

// UI Library Components
import { UiButtonComponent } from '../../shared/components/ui/button/button.component';
import { UiBadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { UiInputComponent } from '../../shared/components/ui/input/input.component';
import { UiSelectComponent } from '../../shared/components/ui/select/select.component';
import { UiTableComponent } from '../../shared/components/ui/table/table.component';

// Local Page Components
import { SignModalComponent } from './components/sign-modal/sign-modal.component';
import { RejectModalComponent } from './components/reject-modal/reject-modal.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, lucidePenTool, lucideSearch, lucideChevronDown, 
  lucideFileSpreadsheet, lucideInbox, lucideDownload, lucideClock, 
  lucideCircleCheck, lucideTriangleAlert, lucideCircleX, lucideFileCheck,
  lucideInfo, lucideArrowRight, lucideFileText, lucideCircleHelp,
  lucideUpload, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
} from '@ng-icons/lucide';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-firmas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    NgIconComponent, 
    PageHeaderComponent,
    KpiCardComponent,
    SectionLabelComponent,
    FilterPanelComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTableComponent,
    SignModalComponent,
    RejectModalComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucidePenTool, lucideSearch, lucideChevronDown, 
      lucideFileSpreadsheet, lucideInbox, lucideDownload, lucideClock, 
      lucideCircleCheck, lucideTriangleAlert, lucideCircleX, lucideFileCheck,
      lucideInfo, lucideArrowRight, lucideFileText, lucideCircleHelp,
      lucideUpload, lucideCheck, lucideX, lucideChevronLeft, lucideChevronRight
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
  readonly ESTADOS = ESTADOS_EXPEDIENTE;
  
  get tiposDocumento() { return this.catalogService.tiposDocumento(); }
  get estados() { return this.catalogService.estados(); }
  
  // State from Service
  allFirmas = computed(() => this.firmaService.firmas());
  loading = this.firmaService.loading;
  
  // Modal visibility and data signals
  selectedFirma = signal<Firma | null>(null);
  showSignModal = signal(false);
  showRejectModal = signal(false);

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
    this.catalogService.loadTiposDocumento();
    this.catalogService.loadEstados();
    this.refreshList();
  }

  // KPIs
  kpis = computed(() => {
    const data = this.allFirmas();
    const countByState = (s: string) => data.filter((f: Firma) => (f.estado || '').toUpperCase() === s.toUpperCase()).length;
    return [
      { label: "Bandeja", value: data.length, icon: 'lucideInbox', color: "#2e5ba7" },
      { label: "Ingresados", value: countByState(ESTADOS_EXPEDIENTE.INGRESADO), icon: 'lucideDownload', color: "#6366F1" },
      { label: "Pendientes", value: countByState(ESTADOS_EXPEDIENTE.PENDIENTE), icon: 'lucideClock', color: "#F59E0B" },
      { label: "Firmados", value: countByState(ESTADOS_EXPEDIENTE.FIRMADO), icon: 'lucideCircleCheck', color: "#10B981" },
      { label: "Observados", value: countByState(ESTADOS_EXPEDIENTE.OBSERVADO), icon: 'lucideTriangleAlert', color: "#EF4444" },
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
    if (f.estado !== 'all') result = result.filter((e: Firma) => e.estado === f.estado);
    if (f.tipo !== 'all') result = result.filter((e: Firma) => String(e.documentoId) === f.tipo);
    return result;
  });

  paginatedFirmas = computed(() => {
    const data = this.filteredFirmas();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredFirmas().length / this.itemsPerPage));

  paginationSummary = computed(() => {
    const total = this.filteredFirmas().length;
    if (total === 0) return '0 registros';
    const start = (this.currentPage() - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage() * this.itemsPerPage, total);
    return `${start}–${end} de ${total} registros`;
  });

  paginatedPages(): number[] {
    const total = this.totalPages();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const current = this.currentPage();
    if (current <= 2) return [1, 2, 3, 4, total];
    if (current >= total - 1) return [1, total - 3, total - 2, total - 1, total];
    return [1, current - 1, current, current + 1, total];
  }

  updateFilters(key: string, value: string): void {
    this.filters.update((f: any) => ({ ...f, [key]: value }));
    this.currentPage.set(1);
  }

  refreshList(): void {
    const usuarioId = this.authService.user()?.id;
    if (usuarioId) {
      this.firmaService.loadAll({ usuarioAsignadoId: usuarioId });
    }
  }

  handleDescargar(firma: Firma): void {
    if ((firma.estado || '').toUpperCase() !== ESTADOS_EXPEDIENTE.INGRESADO.toUpperCase()) return;
    this.apiService.downloadFirmaDocumento(firma.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${firma.documentoNumeracion || 'documento'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.refreshList();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Documento descargado',
          text: 'Estado actualizado a PENDIENTE.',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error al descargar', text: err.message || 'Error desconocido' });
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
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Error al descargar', text: 'No se pudo recuperar el archivo firmado.' });
      }
    });
  }

  openSignModal(firma: Firma): void {
    if (firma.estado !== 'PENDIENTE') return;
    this.selectedFirma.set(firma);
    this.showSignModal.set(true);
  }

  openRejectModal(firma: Firma): void {
    if (firma.estado !== 'PENDIENTE') return;
    this.selectedFirma.set(firma);
    this.showRejectModal.set(true);
  }

  onSignSuccess(): void {
    this.refreshList();
  }

  onRejectSuccess(): void {
    this.refreshList();
  }

  exportToExcel(): void {
    const data = this.filteredFirmas().map(f => ({
      'ID Registro': f.id,
      'Documento': f.documentoNumeracion,
      'Tipo Documento': f.documentoTipoDocumento,
      'Elaborado por': f.documentoUsuarioElabora,
      'Fecha Asignación': f.fechaAsignacion,
      'Estado': f.estado,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Firmas');
    XLSX.writeFile(wb, `Firmas_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  getBadgeVariant(estado: string | undefined): any {
    const e = (estado || '').toLowerCase();
    const variants = ['firmado', 'pendiente', 'observado', 'ingresado', 'registrado', 'success', 'warning', 'destructive', 'primary', 'muted', 'none'];
    return variants.includes(e) ? e : 'none';
  }
}
