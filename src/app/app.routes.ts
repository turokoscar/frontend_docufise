import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES } from './core/constants/roles.constants';

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
        loadComponent: () => import('./pages/expedientes/expedientes.page').then(m => m.ExpedientesPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.CTD, ROLES.ADMIN] }
      },
      { 
        path: 'firmas', 
        loadComponent: () => import('./pages/firmas/firmas.page').then(m => m.FirmasPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.FIRMANTE, ROLES.ADMIN] }
      },
      { 
        path: 'reportes', 
        loadComponent: () => import('./pages/reportes/reportes.page').then(m => m.ReportesPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      { 
        path: 'admin/usuarios', 
        loadComponent: () => import('./pages/admin/usuarios/usuarios.page').then(m => m.UsuariosPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      { 
        path: 'admin/areas', 
        loadComponent: () => import('./pages/admin/areas/areas.page').then(m => m.AreasPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      { 
        path: 'admin/roles', 
        loadComponent: () => import('./pages/admin/roles/roles.page').then(m => m.RolesPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
      { 
        path: 'admin/menus', 
        loadComponent: () => import('./pages/admin/menus/menus.page').then(m => m.MenusPage),
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN] }
      },
    ]
  },
  { path: '**', redirectTo: 'index' }
];