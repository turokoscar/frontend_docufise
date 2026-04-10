import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { IndexPage } from './pages/index/index.page';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ExpedientesPage } from './pages/expedientes/expedientes.page';
import { FirmasPage } from './pages/firmas/firmas.page';
import { ReportesPage } from './pages/reportes/reportes.page';
import { UsuariosPage } from './pages/admin/usuarios/usuarios.page';
import { AreasPage } from './pages/admin/areas/areas.page';
import { RolesPage } from './pages/admin/roles/roles.page';
import { MenusPage } from './pages/admin/menus/menus.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: IndexPage },
  { path: 'login', component: LoginPage },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'expedientes', component: ExpedientesPage },
      { path: 'firmas', component: FirmasPage },
      { path: 'reportes', component: ReportesPage },
      { path: 'admin/usuarios', component: UsuariosPage },
      { path: 'admin/areas', component: AreasPage },
      { path: 'admin/roles', component: RolesPage },
      { path: 'admin/menus', component: MenusPage },
    ]
  },
  { path: '**', redirectTo: 'index' }
];