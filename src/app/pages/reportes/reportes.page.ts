import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Expediente, EstadoExpediente } from '../../core/models/user.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, 
  lucideBarChart3, 
  lucideFileSpreadsheet, 
  lucideArrowRight, 
  lucideInfo,
  lucideTrendingUp,
  lucidePieChart,
  lucideLayoutGrid,
  lucideFile,
  lucideCheckCircle2,
  lucideClock,
  lucideAlertTriangle,
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
      lucideHome, lucideBarChart3, lucideFileSpreadsheet, lucideArrowRight, 
      lucideInfo, lucideTrendingUp, lucidePieChart, lucideLayoutGrid,
      lucideFile, lucideCheckCircle2, lucideClock, lucideAlertTriangle, lucideSend,
      lucideActivity, lucideFileText, lucidePenTool
    })
  ],
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.css'
})
export class ReportesPage implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

  user = this.authService.user;
  private allExpedientes = signal<Expediente[]>(this.dataService.expedientesMock);
  private allFirmas = signal(this.dataService.firmasMock);

  // Toast
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  kpis = computed(() => {
    const exp = this.allExpedientes();
    const firmas = this.allFirmas();
    const count = (s: EstadoExpediente) => exp.filter(e => e.estado === s).length;
    const countFirmas = (s: string) => firmas.filter((f: any) => f.estado === s).length;
    const firmasFirmadas = countFirmas('Firmado');
    const totalFirmas = firmas.length;
    const tasaFirma = totalFirmas > 0 ? Math.round((firmasFirmadas / totalFirmas) * 100) : 0;
    return [
      { label: 'Total Expedientes', value: exp.length, icon: 'lucideFileText', color: '#2C5AAB' },
      { label: 'Firmas Completadas', value: firmasFirmadas, icon: 'lucidePenTool', color: '#0FBF90' },
      { label: 'Pendientes de Firma', value: countFirmas('Pendiente'), icon: 'lucideClock', color: '#F2B801' },
      { label: 'Tasa de Firma', value: tasaFirma + '%', icon: 'lucideTrendingUp', color: '#0FAEBF' },
    ];
  });

  // Datos dinámicos para gráfica
  datosReporte = computed(() => {
    const exp = this.allExpedientes();
    const count = (s: EstadoExpediente) => exp.filter(e => e.estado === s).length;
    return [
      { estado: 'Registrados', cantidad: count('Registrado'), color: '#3B7DCC' },
      { estado: 'Ingresados', cantidad: count('Ingresado'), color: '#2C5AAB' },
      { estado: 'Pendientes', cantidad: count('Pendiente'), color: '#F2B801' },
      { estado: 'Observados', cantidad: count('Observado'), color: '#AB2741' },
      { estado: 'Firmados', cantidad: count('Firmado'), color: '#0FBF90' },
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

  // Chart 2: Bar (Tendencia Mensual - Mock data for now based on React version)
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
        label: 'Expedientes', 
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

  ngOnInit(): void {
    this.allExpedientes.set(this.dataService.expedientesMock);
    this.allFirmas.set(this.dataService.firmasMock);
  }

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
    XLSX.writeFile(wb, `Reporte_Ejecutivo_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.showNotification('Archivo Excel descargado exitosamente', 'success');
  }

  Math = Math;
}