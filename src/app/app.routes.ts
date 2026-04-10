import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { 
    path: 'index', 
    loadComponent: () => import('./pages/index/index.page').then(m => m.IndexPage) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) 
  },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'expedientes', 
        loadComponent: () => import('./pages/expedientes/expedientes.page').then(m => m.ExpedientesPage) 
      },
      { 
        path: 'firmas', 
        loadComponent: () => import('./pages/firmas/firmas.page').then(m => m.FirmasPage) 
      },
      { 
        path: 'reportes', 
        loadComponent: () => import('./pages/reportes/reportes.page').then(m => m.ReportesPage) 
      },
      { 
        path: 'admin/usuarios', 
        loadComponent: () => import('./pages/admin/usuarios/usuarios.page').then(m => m.UsuariosPage) 
      },
      { 
        path: 'admin/areas', 
        loadComponent: () => import('./pages/admin/areas/areas.page').then(m => m.AreasPage) 
      },
      { 
        path: 'admin/roles', 
        loadComponent: () => import('./pages/admin/roles/roles.page').then(m => m.RolesPage) 
      },
      { 
        path: 'admin/menus', 
        loadComponent: () => import('./pages/admin/menus/menus.page').then(m => m.MenusPage) 
      },
    ]
  },
  { path: '**', redirectTo: 'index' }
];