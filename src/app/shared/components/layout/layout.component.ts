import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLES } from '../../../core/constants/roles.constants';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHouse, 
  lucideChartColumn, 
  lucideFileText, 
  lucidePenTool, 
  lucideUsers, 
  lucideBuilding2, 
  lucideShield, 
  lucideLayoutList,
  lucideChevronLeft,
  lucideChevronRight,
  lucideLogOut,
  lucideUser,
  lucideInfo,
  lucideChevronDown,
  lucideSettings,
  lucideMenu
} from '@ng-icons/lucide';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NgIconComponent],
  providers: [
    provideIcons({ 
      lucideHouse, 
      lucideChartColumn, 
      lucideFileText, 
      lucidePenTool, 
      lucideUsers, 
      lucideBuilding2, 
      lucideShield, 
      lucideLayoutList,
      lucideChevronLeft,
      lucideChevronRight,
      lucideLogOut,
      lucideUser,
      lucideMenu,
      lucideInfo,
      lucideChevronDown,
      lucideSettings
    })
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.user;
  allMenus = computed(() => this.authService.getMenus());
  
  mainMenus = computed(() => 
    this.allMenus().filter(m => !m.ruta.startsWith('/admin'))
  );
  
  adminMenus = computed(() => 
    this.allMenus().filter(m => m.ruta.startsWith('/admin'))
  );
  
  collapsed = signal(false);
  mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.mobileSidebarOpen.update(v => !v);
    }
    // On desktop, do nothing - sidebar stays visible
  }

  closeMobileSidebarIfNeeded(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.mobileSidebarOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleStyle(rol?: string): string {
    if (rol === ROLES.ADMIN) return "bg-primary text-primary-foreground border-transparent";
    if (rol === ROLES.CTD) return "bg-success/15 text-success border-success/30";
    return "bg-secondary/15 text-secondary border-secondary/30";
  }

  getMenuIcon(name: string): string {
    const icons: Record<string, string> = {
      'BarChart3': 'lucideChartColumn',
      'FileText': 'lucideFileText',
      'PenTool': 'lucidePenTool',
      'Users': 'lucideUsers',
      'Building2': 'lucideBuilding2',
      'Shield': 'lucideShield',
      'LayoutList': 'lucideLayoutList',
      'Settings': 'lucideSettings'
    };
    return icons[name] || 'lucideHouse';
  }
}