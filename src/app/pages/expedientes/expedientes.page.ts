import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoService } from '../../core/services/documento.service';
import { CatalogService } from '../../core/services/catalog.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Documento } from '../../core/models/documento.model';
import { ESTADOS_EXPEDIENTE } from '../../core/constants/states.constants';

// Shared Components
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
import { UiDropdownComponent } from '../../shared/components/ui/dropdown/dropdown.component';

// Local Page Components
import { ExpedienteFormComponent } from './components/expediente-form/expediente-form.component';
import { DerivacionModalComponent } from './components/derivacion-modal/derivacion-modal.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideFileText, 
  lucideSearch, 
  lucideChevronDown, 
  lucideFileSpreadsheet,
  lucidePlus,
  lucideCircleHelp,
  lucidePencil,
  lucideTrash2,
  lucideArrowRight,
  lucideSend,
  lucideUpload,
  lucideTriangleAlert,
  lucideX,
  lucideInfo,
  lucideListFilter,
  lucideClock,
  lucideCircleCheck,
  lucideCheck,
  lucideFile,
  lucideChevronLeft,
  lucideChevronRight
} from '@ng-icons/lucide';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expedientes',
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
    UiDropdownComponent,
    ExpedienteFormComponent,
    DerivacionModalComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideFileText, lucideSearch, lucideChevronDown, 
      lucideFileSpreadsheet, lucidePlus, lucideCircleHelp, lucidePencil, 
      lucideTrash2, lucideArrowRight, lucideSend, lucideUpload,
      lucideTriangleAlert, lucideX, lucideInfo, lucideListFilter,
      lucideClock, lucideCircleCheck, lucideCheck, lucideFile,
      lucideChevronLeft, lucideChevronRight
    })
  ],
  templateUrl: './expedientes.page.html',
  styleUrl: './expedientes.page.css'
})
export class ExpedientesPage implements OnInit {
  private documentoService = inject(DocumentoService);
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  user = this.authService.user;
  
  // Catálogos desde API - se cargan a demanda
  get tiposDocumento() { return this.catalogService.tiposDocumento(); }
  get areas() { return this.catalogService.areas(); }
  get estados() { return this.catalogService.estados(); }
  
  // State local que sincroniza con el servicio
  allDocumentos = computed(() => this.documentoService.documentos());
  loading = this.documentoService.loading;

  // Modal visibility and data signals
  showModal = signal(false);
  showDerivarModal = signal(false);
  editingDocumento = signal<Documento | null>(null);
  derivandoDocumento = signal<Documento | null>(null);
  
  // Dropdown state
  openDropdownId = signal<number | null>(null);

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
    this.catalogService.loadAreas();
    this.catalogService.loadTiposDocumento();
    this.catalogService.loadEstados();
    this.documentoService.loadAll();
  }
  
  toggleDropdown(id: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownId.update(current => current === id ? null : id);
  }
  
  closeDropdown(): void {
    this.openDropdownId.set(null);
  }
  
  canEdit(doc: Documento): boolean {
    const estado = (doc.estado || '').toUpperCase();
    return estado === ESTADOS_EXPEDIENTE.REGISTRADO || estado === ESTADOS_EXPEDIENTE.OBSERVADO;
  }

  get autoNumeracion(): string {
    const editing = this.editingDocumento();
    if (editing) return editing.numeracion;
    const nextNum = this.allDocumentos().length + 1;
    return `${String(nextNum).padStart(3, '0')}-2026-FISE`;
  }

  get autoFechaElab(): string {
    const editing = this.editingDocumento();
    if (editing) return editing.fechaElaboracion;
    return new Date().toISOString().split('T')[0];
  }

  // KPIs
  kpis = computed(() => {
    const data = this.allDocumentos();
    const countByState = (s: string) => data.filter((doc: Documento) => (doc.estado || '').toUpperCase() === s.toUpperCase()).length;
    return [
      { label: "Total", value: data.length, icon: 'lucideFile', color: "#2e5ba7" },
      { label: "Registrados", value: countByState(ESTADOS_EXPEDIENTE.REGISTRADO), icon: 'lucideFile', color: "#3B82F6" },
      { label: "Pendientes", value: countByState(ESTADOS_EXPEDIENTE.PENDIENTE), icon: 'lucideClock', color: "#F59E0B" },
      { label: "Firmados", value: countByState(ESTADOS_EXPEDIENTE.FIRMADO), icon: 'lucideCircleCheck', color: "#10B981" },
      { label: "Observados", value: countByState(ESTADOS_EXPEDIENTE.OBSERVADO), icon: 'lucideTriangleAlert', color: "#EF4444" },
    ];
  });

  filteredDocumentos = computed(() => {
    let result = this.allDocumentos();
    const f = this.filters();
    if (f.search) {
      const s = f.search.toLowerCase();
      result = result.filter((doc: Documento) => 
        doc.numeracion.toLowerCase().includes(s) || 
        (doc.usuarioElabora || '').toLowerCase().includes(s) ||
        (doc.usuarioEnvia || '').toLowerCase().includes(s) ||
        (doc.tipoDocumento || '').toLowerCase().includes(s)
      );
    }
    if (f.estado !== 'all') result = result.filter((doc: Documento) => doc.estado === f.estado);
    if (f.tipo !== 'all') result = result.filter((doc: Documento) => String(doc.tipoDocumentoId) === f.tipo);
    return result;
  });

  paginatedDocumentos = computed(() => {
    const data = this.filteredDocumentos();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredDocumentos().length / this.itemsPerPage));
  paginationSummary = computed(() => {
    const total = this.filteredDocumentos().length;
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

  exportToExcel(): void {
    const data = this.filteredDocumentos().map((doc: Documento) => ({
      'Numeración': doc.numeracion,
      'Tipo Documento': doc.tipoDocumento,
      'Elaborado por': doc.usuarioElabora,
      'Enviado por': doc.usuarioEnvia || '',
      'Fecha Elaboración': doc.fechaElaboracion,
      'Fecha/Hora Envío': doc.fechaHoraEnvio,
      'Estado': doc.estado,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expedientes');
    XLSX.writeFile(wb, `Expedientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  getBadgeVariant(estado: string | undefined): any {
    const e = (estado || '').toLowerCase();
    const variants = ['firmado', 'pendiente', 'observado', 'ingresado', 'registrado', 'success', 'warning', 'destructive', 'primary', 'muted', 'none'];
    return variants.includes(e) ? e : 'none';
  }

  // CRUD Handlers
  openNewForm(): void {
    this.editingDocumento.set(null);
    this.showModal.set(true);
  }

  openEditForm(doc: Documento): void {
    if (!this.canEdit(doc)) return;
    this.editingDocumento.set(doc);
    this.showModal.set(true);
  }

  deleteDocumento(doc: Documento): void {
    if (!this.canEdit(doc)) return;
    
    Swal.fire({
      title: '¿Eliminar expediente?',
      text: `¿Confirma eliminar el expediente ${doc.numeracion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#aa2942'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentoService.delete(doc.id);
      }
    });
  }

  openDerivarModal(doc: Documento): void {
    if ((doc.estado || '').toUpperCase() !== ESTADOS_EXPEDIENTE.REGISTRADO) return;
    this.derivandoDocumento.set(doc);
    this.showDerivarModal.set(true);
  }

  onSaved(): void {
    this.documentoService.loadAll();
  }

  onDerived(): void {
    this.documentoService.loadAll();
  }
}
