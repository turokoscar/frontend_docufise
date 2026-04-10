import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Expediente, EstadoExpediente } from '../../core/models/user.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
  lucideFileText, 
  lucideSearch, 
  lucideChevronDown, 
  lucideFileSpreadsheet,
  lucidePlus,
  lucideHelpCircle,
  lucidePencil,
  lucideTrash2,
  lucideArrowRight,
  lucideSend,
  lucideUpload,
  lucideAlertTriangle,
  lucideX,
  lucideInfo,
  lucideListFilter,
  lucideClock,
  lucideCheckCircle2,
  lucideCheck,
  lucideFile
} from '@ng-icons/lucide';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHome, lucideFileText, lucideSearch, lucideChevronDown, 
      lucideFileSpreadsheet, lucidePlus, lucideHelpCircle, lucidePencil, 
      lucideTrash2, lucideArrowRight, lucideSend, lucideUpload,
      lucideAlertTriangle, lucideX, lucideInfo, lucideListFilter,
      lucideClock, lucideCheckCircle2, lucideCheck, lucideFile
    })
  ],
  templateUrl: './expedientes.page.html',
  styleUrl: './expedientes.page.css'
})
export class ExpedientesPage implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  user = this.authService.user;
  tiposDocumento = this.dataService.tiposDocumento;
  elaboradores = this.dataService.elaboradores;
  areasDestino = this.dataService.areasDestino;
  usuariosPorArea = this.dataService.usuariosPorArea;
  
  // State
  allExpedientes = signal<Expediente[]>([]);

  // Modal state
  showModal = signal(false);
  showDerivarModal = signal(false);
  editingExpediente = signal<Expediente | null>(null);
  derivandoExpediente = signal<Expediente | null>(null);

  // Form fields
  formTipoDoc = signal('');
  formElaborado = signal('');
  formEnviado = signal('');

  // Derivar fields
  derivarArea = signal('');
  derivarUsuario = signal('');
  derivarObs = signal('');

  // Filters
  filters = signal({
    search: '',
    estado: 'all',
    tipo: 'all'
  });

  // Toast message
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  ngOnInit(): void {
    this.allExpedientes.set([...this.dataService.expedientesMock]);
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  canEdit(exp: Expediente): boolean {
    return exp.estado === 'Registrado' || exp.estado === 'Observado';
  }

  get usuariosDisponibles(): string[] {
    const area = this.derivarArea();
    return area ? this.usuariosPorArea[area] || [] : [];
  }

  get autoNumeracion(): string {
    const editing = this.editingExpediente();
    if (editing) return editing.numeracion;
    const nextNum = this.allExpedientes().length + 1;
    return `${String(nextNum).padStart(3, '0')}-2026-FISE`;
  }

  get autoFechaElab(): string {
    const editing = this.editingExpediente();
    if (editing) return editing.fechaElaboracion;
    return new Date().toISOString().split('T')[0];
  }

  get autoFechaEnvio(): string {
    const editing = this.editingExpediente();
    if (editing) return editing.fechaHoraEnvio;
    const now = new Date();
    return `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
  }

  // KPIs (Calculados dinámicamente) - Coincide con React
  kpis = computed(() => {
    const data = this.allExpedientes();
    const countByState = (s: EstadoExpediente) => data.filter((e: Expediente) => e.estado === s).length;
    return [
      { label: "Total", value: data.length, icon: 'lucideFile', color: "#2C5AAB" },
      { label: "Registrados", value: countByState("Registrado"), icon: 'lucideFile', color: "#3B7DCC" },
      { label: "Pendientes", value: countByState("Pendiente"), icon: 'lucideClock', color: "#F2B801" },
      { label: "Firmados", value: countByState("Firmado"), icon: 'lucideCheckCircle2', color: "#0FBF90" },
      { label: "Observados", value: countByState("Observado"), icon: 'lucideAlertTriangle', color: "#AB2741" },
    ];
  });

  filteredExpedientes = computed(() => {
    let result = this.allExpedientes();
    const f = this.filters();

    if (f.search) {
      const s = f.search.toLowerCase();
      result = result.filter((e: Expediente) => 
        e.numeracion.toLowerCase().includes(s) || 
        e.elaboradoPor.toLowerCase().includes(s) ||
        (e.enviadoPor && e.enviadoPor.toLowerCase().includes(s)) ||
        e.tipoDocumento.toLowerCase().includes(s)
      );
    }
    if (f.estado !== 'all') {
      result = result.filter((e: Expediente) => e.estado === f.estado);
    }
    if (f.tipo !== 'all') {
      result = result.filter((e: Expediente) => e.tipoDocumento === f.tipo);
    }
    return result;
  });

  paginatedExpedientes = computed(() => {
    const data = this.filteredExpedientes();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return data.slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredExpedientes().length / this.itemsPerPage));

  paginatedPages(): number[] {
    const total = this.totalPages();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    // Show first, current-1, current, current+1, last
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

  exportToExcel(): void {
    const data = this.filteredExpedientes().map((e: Expediente) => ({
      'Numeración': e.numeracion,
      'Tipo Documento': e.tipoDocumento,
      'Elaborado por': e.elaboradoPor,
      'Enviado por': e.enviadoPor || '',
      'Fecha Elaboración': e.fechaElaboracion,
      'Fecha/Hora Envío': e.fechaHoraEnvio,
      'Estado': e.estado,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expedientes');
    XLSX.writeFile(wb, `Expedientes_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.showNotification('Archivo Excel descargado exitosamente', 'success');
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // CRUD Operations
  openNewForm(): void {
    this.editingExpediente.set(null);
    this.formTipoDoc.set('');
    this.formElaborado.set('');
    this.formEnviado.set('');
    this.showModal.set(true);
  }

  openEditForm(exp: Expediente): void {
    if (!this.canEdit(exp)) return;
    this.editingExpediente.set(exp);
    this.formTipoDoc.set(exp.tipoDocumento);
    this.formElaborado.set(exp.elaboradoPor);
    this.formEnviado.set(exp.enviadoPor || '');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingExpediente.set(null);
    this.formTipoDoc.set('');
    this.formElaborado.set('');
    this.formEnviado.set('');
  }

  saveExpediente(): void {
    const tipoDoc = this.formTipoDoc();
    const elaborado = this.formElaborado();

    if (!tipoDoc || !elaborado) {
      this.showNotification('Complete todos los campos obligatorios', 'error');
      return;
    }

    const editing = this.editingExpediente();
    if (editing) {
      this.allExpedientes.update(prev => 
        prev.map(e => 
          e.id === editing.id
            ? { ...e, tipoDocumento: tipoDoc, elaboradoPor: elaborado, enviadoPor: this.formEnviado() }
            : e
        )
      );
      this.showNotification(`${editing.numeracion} actualizado exitosamente`, 'success');
    } else {
      const now = new Date();
      const nextNum = this.allExpedientes().length + 1;
      const nuevo: Expediente = {
        id: `EXP-2026-${String(nextNum).padStart(3, '0')}`,
        numeracion: `${String(nextNum).padStart(3, '0')}-2026-FISE`,
        tipoDocumento: tipoDoc,
        elaboradoPor: elaborado,
        enviadoPor: this.formEnviado() || '',
        fechaElaboracion: now.toISOString().split('T')[0],
        fechaHoraEnvio: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
        estado: 'Registrado',
        archivoOriginal: 'documento_adjunto.pdf',
      };
      this.allExpedientes.update(prev => [nuevo, ...prev]);
      this.showNotification(`${nuevo.numeracion} registrado con estado REGISTRADO`, 'success');
    }
    this.closeModal();
  }

  deleteExpediente(exp: Expediente): void {
    if (!this.canEdit(exp)) return;
    if (confirm(`¿Está seguro de eliminar el expediente ${exp.numeracion}?`)) {
      this.allExpedientes.update(prev => prev.filter(e => e.id !== exp.id));
      this.showNotification(`${exp.numeracion} eliminado`, 'error');
    }
  }

  // Derivar operations
  openDerivarModal(exp: Expediente): void {
    if (exp.estado !== 'Registrado') return;
    this.derivandoExpediente.set(exp);
    this.derivarArea.set('');
    this.derivarUsuario.set('');
    this.derivarObs.set('');
    this.showDerivarModal.set(true);
  }

  closeDerivarModal(): void {
    this.showDerivarModal.set(false);
    this.derivandoExpediente.set(null);
    this.derivarArea.set('');
    this.derivarUsuario.set('');
    this.derivarObs.set('');
  }

  confirmarDerivacion(): void {
    const area = this.derivarArea();
    const usuario = this.derivarUsuario();
    const exp = this.derivandoExpediente();

    if (!area || !usuario || !exp) {
      this.showNotification('Seleccione área y usuario destino', 'error');
      return;
    }

    this.allExpedientes.update(prev => 
      prev.map(e => 
        e.id === exp.id
          ? { 
              ...e, 
              estado: 'Ingresado' as EstadoExpediente, 
              areaDestino: area, 
              usuarioDestino: usuario, 
              observaciones: this.derivarObs(),
              enviadoPor: e.enviadoPor || e.elaboradoPor
            } 
          : e
      )
    );
    this.showNotification(`Expediente ${exp.numeracion} derivado exitosamente. Estado: INGRESADO`, 'success');
    this.closeDerivarModal();
  }

  onAreaChange(area: string): void {
    this.derivarArea.set(area);
    this.derivarUsuario.set('');
  }

  Math = Math;
}