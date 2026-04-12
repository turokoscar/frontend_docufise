import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoService } from '../../core/services/documento.service';
import { CatalogService } from '../../core/services/catalog.service';
import { 
  UsuarioSistema
} from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { ApiService, UploadProgress } from '../../core/services/api.service';
import { Documento, EstadoDocumentoLabel } from '../../core/models/documento.model';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
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

@Component({
  selector: 'app-expedientes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent, FileUploadComponent],
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
  
  // Upload state
  selectedFile = signal<File | null>(null);
  uploadProgress = signal(0);
  isUploading = signal(false);
  uploadedFilename = signal('');
  
  // Catálogos desde API - se cargan a demanda
  get tiposDocumento() { return this.catalogService.tiposDocumento(); }
  get areas() { return this.catalogService.areas(); }
  get estados() { return this.catalogService.estados(); }
  
  // Helpers
  get elaboradores(): string[] { return ['Marco Tomy', 'Ana García', 'Carlos Mendoza']; }
  get areasDestino(): string[] { return this.catalogService.areas().map(a => a.nombre); }
  get usuariosPorArea(): Record<string, string[]> { return {}; }
  
  // State local que sincroniza con el servicio
  allDocumentos = computed(() => this.documentoService.documentos());
  loading = this.documentoService.loading;

  // Modal state
  showModal = signal(false);
  showDerivarModal = signal(false);
  editingDocumento = signal<Documento | null>(null);
  derivandoDocumento = signal<Documento | null>(null);
  
  // Dropdown state
  openDropdownId = signal<number | null>(null);

  // Form fields
  formTipoDoc = signal('');
  formElaborado = signal('');
  formEnviado = signal('');

  // Derivar fields
  derivarAreaId = signal<number | null>(null);
  derivarUsuarioId = signal<number | null>(null);
  derivarObs = signal('');
  usuariosDestino = signal<UsuarioSistema[]>([]);
  isLoadingUsuarios = signal(false);

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
    this.catalogService.loadAreas();
    this.catalogService.loadTiposDocumento();
    this.catalogService.loadEstados();
    
    // Cargar documentos
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
    const estado = doc.estado;
    return estado === 'REGISTRADO' || estado === 'OBSERVADO';
  }

  get usuariosDisponibles(): string[] {
    const areaId = this.derivarAreaId();
    // Este getter ahora es menos relevante con la carga reactiva, 
    // pero lo fixeo para evitar el error de compilación.
    return []; 
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

  get autoFechaEnvio(): string {
    const editing = this.editingDocumento();
    if (editing?.fechaHoraEnvio) return editing.fechaHoraEnvio;
    const now = new Date();
    return `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
  }

  // KPIs (Calculados dinámicamente)
  kpis = computed(() => {
    const data = this.allDocumentos();
    const countByState = (s: EstadoDocumentoLabel) => data.filter((doc: Documento) => doc.estado === s).length;
    return [
      { label: "Total", value: data.length, icon: 'lucideFile', color: "#2C5AAB" },
      { label: "Registrados", value: countByState("REGISTRADO"), icon: 'lucideFile', color: "#3B7DCC" },
      { label: "Pendientes", value: countByState("PENDIENTE"), icon: 'lucideClock', color: "#F2B801" },
      { label: "Firmados", value: countByState("FIRMADO"), icon: 'lucideCircleCheck', color: "#0FBF90" },
      { label: "Observados", value: countByState("OBSERVADO"), icon: 'lucideTriangleAlert', color: "#AB2741" },
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
    if (f.estado !== 'all') {
      result = result.filter((doc: Documento) => doc.estado === f.estado);
    }
    if (f.tipo !== 'all') {
      result = result.filter((doc: Documento) => String(doc.tipoDocumentoId) === f.tipo);
    }
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
      'REGISTRADO': 'bg-[#E8F0FE] text-[#1967D2] border border-[#D2E3FC]',
      'INGRESADO': 'bg-[#F3E8FD] text-[#8430CE] border border-[#E9D2FD]',
      'PENDIENTE': 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]',
      'OBSERVADO': 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]',
      'FIRMADO': 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
    };
    return `font-ui text-[11px] font-bold px-3 py-1 rounded-full ${styles[estado] || ''}`;
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
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // CRUD Operations
  openNewForm(): void {
    this.editingDocumento.set(null);
    this.formTipoDoc.set('');
    this.formElaborado.set('');
    this.formEnviado.set('');
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadedFilename.set('');
    this.showModal.set(true);
  }

  openEditForm(doc: Documento): void {
    if (!this.canEdit(doc)) return;
    this.editingDocumento.set(doc);
    this.formTipoDoc.set(String(doc.tipoDocumentoId || ''));
    this.formElaborado.set(String(doc.usuarioElaboraId || ''));
    this.formEnviado.set(String(doc.usuarioEnviaId || ''));
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadedFilename.set(doc.rutaArchivoOriginal ? doc.rutaArchivoOriginal : '');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingDocumento.set(null);
    this.formTipoDoc.set('');
    this.formElaborado.set('');
    this.formEnviado.set('');
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadedFilename.set('');
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.uploadedFilename.set('');
  }

  saveDocumento(): void {
    const tipoDocId = Number(this.formTipoDoc());
    const elaboradoId = Number(this.formElaborado());

    if (!tipoDocId || !elaboradoId) {
      return;
    }

    const editing = this.editingDocumento();
    const file = this.selectedFile();

    if (file) {
      this.isUploading.set(true);
      const formData = new FormData();
      formData.append('documento', new Blob([JSON.stringify({
        numeracion: editing?.numeracion || this.autoNumeracion,
        tipoDocumentoId: tipoDocId,
        usuarioElaboraId: elaboradoId,
        usuarioEnviaId: Number(this.formEnviado()) || null,
        fechaElaboracion: new Date().toISOString().split('T')[0],
        estadoId: editing?.estadoId || 1,
        rutaArchivoOriginal: editing?.rutaArchivoOriginal || null
      })], { type: 'application/json' }));
      formData.append('archivo', file);

      const request = editing 
        ? this.apiService.updateDocumentWithFile(editing.id, formData)
        : this.apiService.uploadFileToDocument(formData);

      request.subscribe({
        next: (doc) => {
          this.isUploading.set(false);
          this.uploadedFilename.set(doc.rutaArchivoOriginal || '');
          this.documentoService.loadAll();
          this.closeModal();
        },
        error: (err) => {
          this.isUploading.set(false);
          alert('Error al guardar documento: ' + (err.message || 'Error desconocido'));
        }
      });
    } else {
      if (editing) {
        this.documentoService.update(editing.id, {
          tipoDocumentoId: tipoDocId,
          usuarioElaboraId: elaboradoId,
          usuarioEnviaId: Number(this.formEnviado()) || undefined
        });
      } else {
        this.documentoService.create({
          tipoDocumentoId: tipoDocId,
          usuarioElaboraId: elaboradoId,
          fechaElaboracion: new Date().toISOString().split('T')[0]
        });
      }
      this.closeModal();
    }
  }

  deleteDocumento(doc: Documento): void {
    if (!this.canEdit(doc)) return;
    if (confirm(`¿Está seguro de eliminar el expediente ${doc.numeracion}?`)) {
      this.documentoService.delete(doc.id);
    }
  }

  // Derivar operations
  openDerivarModal(doc: Documento): void {
    if (doc.estado !== 'REGISTRADO') return;
    this.derivandoDocumento.set(doc);
    this.derivarAreaId.set(null);
    this.derivarUsuarioId.set(null);
    this.derivarObs.set('');
    this.usuariosDestino.set([]);
    this.showDerivarModal.set(true);
  }

  closeDerivarModal(): void {
    this.showDerivarModal.set(false);
    this.derivandoDocumento.set(null);
    this.derivarAreaId.set(null);
    this.derivarUsuarioId.set(null);
    this.derivarObs.set('');
    this.usuariosDestino.set([]);
  }

  onAreaDestinoChange(areaId: any): void {
    const id = Number(areaId);
    this.derivarAreaId.set(id);
    this.derivarUsuarioId.set(null);
    this.usuariosDestino.set([]);
    
    if (id) {
      this.isLoadingUsuarios.set(true);
      this.apiService.getUsuarios(id).subscribe({
        next: (users) => {
          this.usuariosDestino.set(users);
          this.isLoadingUsuarios.set(false);
        },
        error: () => this.isLoadingUsuarios.set(false)
      });
    }
  }

  confirmarDerivacion(): void {
    const areaId = this.derivarAreaId();
    const usuarioId = this.derivarUsuarioId();
    const doc = this.derivandoDocumento();
    const currentUser = this.user();

    if (!areaId || !usuarioId || !doc) {
      return;
    }

    this.documentoService.derivar(
      doc.id, 
      areaId, 
      usuarioId, 
      currentUser ? currentUser.id : undefined
    );
    this.closeDerivarModal();
  }

  Math = Math;
}