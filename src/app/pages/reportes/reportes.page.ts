import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoService } from '../../core/services/documento.service';
import { AuthService } from '../../core/services/auth.service';
import { Documento, EstadoDocumentoLabel } from '../../core/models/documento.model';
import { ESTADOS_EXPEDIENTE } from '../../core/constants/states.constants';
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
  lucidePenTool
} from '@ng-icons/lucide';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgIconComponent, BaseChartDirective],
  providers: [
    provideIcons({ 
      lucideHouse, lucideChartColumn, lucideFileSpreadsheet, lucideArrowRight, 
      lucideInfo, lucideTrendingUp, lucideChartPie, lucideLayoutGrid,
      lucideFile, lucideCircleCheck, lucideClock, lucideTriangleAlert, lucideSend,
      lucideActivity, lucideFileText, lucidePenTool
    })
  ],
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.css'
})
export class ReportesPage implements OnInit {
  private documentoService = inject(DocumentoService);
  private authService = inject(AuthService);

  user = this.authService.user;
  private allDocumentos = signal<Documento[]>([]);
  
  constructor() { }

  ngOnInit(): void {
    // Load from API for reports
    this.documentoService.loadAll();
    const sync = setInterval(() => {
      const docs = this.documentoService.documentos();
      if (docs.length > 0) {
        this.allDocumentos.set([...docs]);
        clearInterval(sync);
      }
    }, 500);
  }

  recentActivity = [
    { action: 'Documento firmado', detail: '001-2026-FISE', time: 'Hace 2h', type: 'success' },
    { action: 'Nuevo documento registrado', detail: '012-2026-FISE', time: 'Hace 4h', type: 'info' },
    { action: 'Firma pendiente', detail: 'REG-552', time: 'Hace 5h', type: 'warning' },
    { action: 'Documento observado', detail: 'REG-102', time: 'Hace 1d', type: 'error' },
    { action: 'Documento derivado', detail: '006-2026-FISE', time: 'Hace 1d', type: 'info' },
  ];

  kpis = computed(() => {
    const docs = this.allDocumentos();
    const count = (s: string) => docs.filter(doc => (doc.estado || '').toUpperCase() === s.toUpperCase()).length;
    
    const firmados = count(ESTADOS_EXPEDIENTE.FIRMADO);
    const total = docs.length;
    const tasaFirma = total > 0 ? Math.round((firmados / total) * 100) : 0;
    
    return [
      { label: 'Total Documentos', value: total, icon: 'lucideFileText', color: '#2C5AAB' },
      { label: 'Firmados', value: firmados, icon: 'lucidePenTool', color: '#0FBF90' },
      { label: 'Pendientes', value: count(ESTADOS_EXPEDIENTE.PENDIENTE), icon: 'lucideClock', color: '#F2B801' },
      { label: 'Tasa de Firma', value: tasaFirma + '%', icon: 'lucideTrendingUp', color: '#0FAEBF' },
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
  public barChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { 
        data: [15, 28, 42, 35, 56, 48], 
        label: 'Documentos', 
        backgroundColor: '#2C5AAB',
        borderRadius: 8,
        barThickness: 24
      },
      { 
        data: [10, 22, 38, 30, 48, 42], 
        label: 'Firmas', 
        backgroundColor: '#0FBF90',
        borderRadius: 8,
        barThickness: 24
      }
    ]
  };
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

  Math = Math;
}