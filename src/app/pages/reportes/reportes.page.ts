import { Component, signal, computed, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoService } from '../../core/services/documento.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Documento } from '../../core/models/documento.model';
import { ESTADOS_EXPEDIENTE } from '../../core/constants/states.constants';

// Shared UI Components
import { KpiCardComponent } from '../../shared/components/ui/kpi-card/kpi-card.component';
import { SectionLabelComponent } from '../../shared/components/ui/section-label/section-label.component';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideChartColumn, 
  lucideFileSpreadsheet, 
  lucideArrowRight, 
  lucideInfo,
  lucideTrendingUp,
  lucideChartPie,
  lucideLayoutGrid,
  lucideFile,
  lucideCircleCheck,
  lucideClock,
  lucideTriangleAlert,
  lucideSend,
  lucideActivity,
  lucideFileText,
  lucidePenTool,
  lucideChevronRight
} from '@ng-icons/lucide';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule, 
    NgIconComponent, 
    BaseChartDirective,
    KpiCardComponent,
    SectionLabelComponent
  ],
  providers: [
    provideIcons({ 
      lucideHouse, lucideChartColumn, lucideFileSpreadsheet, lucideArrowRight, 
      lucideInfo, lucideTrendingUp, lucideChartPie, lucideLayoutGrid,
      lucideFile, lucideCircleCheck, lucideClock, lucideTriangleAlert, lucideSend,
      lucideActivity, lucideFileText, lucidePenTool, lucideChevronRight
    })
  ],
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.css'
})
export class ReportesPage implements OnInit {
  private documentoService = inject(DocumentoService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  user = this.authService.user;
  private allDocumentos = signal<Documento[]>([]);
  private estadisticas = signal<any>(null);
  
  constructor() { }

  ngOnInit(): void {
    this.documentoService.loadAll();
    this.loadEstadisticas();
    const sync = setInterval(() => {
      const docs = this.documentoService.documentos();
      if (docs.length > 0) {
        this.allDocumentos.set([...docs]);
        clearInterval(sync);
      }
    }, 500);
  }

  private loadEstadisticas(): void {
    this.apiService.getEstadisticas().subscribe({
      next: (response: any) => {
        // El interceptor ya desenvuelve la respuesta, response YA ES datos
        if (response) {
          this.estadisticas.set(response);
          this.updateBarChart();
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error cargando estadísticas:', err)
    });
  }

  private updateBarChart(): void {
    const stats = this.estadisticas();
    if (!stats || !stats.tendenciaMensual) return;
    
    const meses = stats.tendenciaMensual.map((m: any) => m.mes);
    const cantidadDocs = stats.tendenciaMensual.map((m: any) => m.cantidadDocumentos);
    const cantidadFirmas = stats.tendenciaMensual.map((m: any) => m.cantidadFirmas);
    
    this.barChartData.set({
      labels: meses,
      datasets: [
        { 
          data: cantidadDocs, 
          label: 'Documentos', 
          backgroundColor: '#2C5AAB',
          borderRadius: 8,
          barThickness: 24
        },
        { 
          data: cantidadFirmas, 
          label: 'Firmas', 
          backgroundColor: '#0FBF90',
          borderRadius: 8,
          barThickness: 24
        }
      ]
    });
  }

  kpis = computed(() => {
    const stats = this.estadisticas();
    
    // Si no hay estadísticas cargadas aún, mostramos placeholders o ceros
    const total = stats?.totalDocumentos || 0;
    const firmados = stats?.totalFirmados || 0;
    const pendientes = stats?.totalPendientes || 0;
    const tasaFirma = stats?.tasaFirma || 0;

    return [
      { 
        label: 'Total Expedientes', 
        value: total, 
        icon: 'lucideFileText', 
        color: '#2C5AAB',
        trend: { value: stats?.tendenciaTotalDocumentos || 0, label: 'vs mes anterior' }
      },
      { 
        label: 'Firmas Completadas', 
        value: firmados, 
        icon: 'lucidePenTool', 
        color: '#0FBF90',
        trend: { value: stats?.tendenciaTotalFirmados || 0, label: 'vs mes anterior' }
      },
      { 
        label: 'Pendientes de Firma', 
        value: pendientes, 
        icon: 'lucideClock', 
        color: '#F2B801',
        trend: { value: stats?.tendenciaTotalPendientes || 0, label: 'vs mes anterior', reverse: true }
      },
      { 
        label: 'Tasa de Firma', 
        value: tasaFirma + '%', 
        icon: 'lucideCircleCheck', 
        color: '#0FAEBF',
        trend: { value: stats?.tendenciaTasaFirma || 0, label: 'vs mes anterior' }
      },
    ];
  });

  // Datos dinámicos para gráfica
  datosReporte = computed(() => {
    const docs = this.allDocumentos();
    const count = (s: string) => docs.filter(doc => (doc.estado || '').toUpperCase() === s.toUpperCase()).length;
    return [
      { estado: 'Registrados', cantidad: count(ESTADOS_EXPEDIENTE.REGISTRADO), color: '#3B7DCC' },
      { estado: 'Ingresados', cantidad: count(ESTADOS_EXPEDIENTE.INGRESADO), color: '#2C5AAB' },
      { estado: 'Pendientes', cantidad: count(ESTADOS_EXPEDIENTE.PENDIENTE), color: '#F2B801' },
      { estado: 'Observados', cantidad: count(ESTADOS_EXPEDIENTE.OBSERVADO), color: '#AB2741' },
      { estado: 'Firmados', cantidad: count(ESTADOS_EXPEDIENTE.FIRMADO), color: '#0FBF90' },
    ];
  });

  // Chart 1: Pie (Distribución por Estado)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right', labels: { font: { family: 'Poppins', size: 10 }, usePointStyle: true } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 12 } }
    }
  };
  public pieChartType: ChartType = 'pie';

  // Chart 2: Bar (Tendencia Mensual)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: { padding: 12 }
    }
  };
  
  barChartData = signal<ChartData<'bar'>>({
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { 
        data: [0, 0, 0, 0, 0, 0], 
        label: 'Documentos', 
        backgroundColor: '#2C5AAB',
        borderRadius: 8,
        barThickness: 24
      },
      { 
        data: [0, 0, 0, 0, 0, 0], 
        label: 'Firmas', 
        backgroundColor: '#0FBF90',
        borderRadius: 8,
        barThickness: 24
      }
    ]
  });
  public barChartType: ChartType = 'bar';

  get pieChartData(): ChartData<'pie', number[], string | string[]> {
    const data = this.datosReporte();
    return {
      labels: data.map((d: any) => d.estado),
      datasets: [{
        data: data.map((d: any) => d.cantidad),
        backgroundColor: data.map((d: any) => d.color),
        hoverOffset: 15,
        borderWidth: 0
      }]
    };
  }

  exportToExcel(): void {
    const data = this.datosReporte();
    const wsData = data.map((d: any) => ({
      'Estado': d.estado,
      'Cantidad': d.cantidad
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte General');
    XLSX.writeFile(wb, `Reporte_Documentos_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
