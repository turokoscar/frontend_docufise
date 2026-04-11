import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideLock, lucideEye, lucideEyeOff, lucideArrowRight, lucideInfo } from '@ng-icons/lucide';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({ lucideUser, lucideLock, lucideEye, lucideEyeOff, lucideArrowRight, lucideInfo })
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);

  usuario = '';
  contrasena = '';
  showPassword = signal(false);
  error = signal('');

  async handleSubmit(): Promise<void> {
    this.error.set('');
    
    if (!this.usuario || !this.contrasena) {
      this.error.set('Ingrese usuario y contraseña');
      return;
    }

    const success = await this.authService.login(this.usuario, this.contrasena);
    
    if (success) {
      const user = this.authService.user();
      if (user) {
        const rol = user.rol as 'CTD' | 'Firmante' | 'Administrador';
        const route = this.dataService.getDefaultRouteByRol(rol);
        this.router.navigate([route]);
      }
    } else {
      this.error.set('Credenciales incorrectas');
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  quickLogin(user: string, pass: string): void {
    this.usuario = user;
    this.contrasena = pass;
  }
}