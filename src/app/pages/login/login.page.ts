import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideUser, 
  lucideLock, 
  lucideEye, 
  lucideEyeOff, 
  lucideArrowRight, 
  lucideInfo 
} from '@ng-icons/lucide';

// UI Library Components
import { UiButtonComponent } from '../../shared/components/ui/button/button.component';
import { UiInputComponent } from '../../shared/components/ui/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    NgIconComponent, 
    UiButtonComponent, 
    UiInputComponent
  ],
  providers: [
    provideIcons({ 
      lucideUser, 
      lucideLock, 
      lucideEye, 
      lucideEyeOff, 
      lucideArrowRight, 
      lucideInfo 
    })
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = '';
  contrasena = '';
  showPassword = signal(false);
  error = signal<string | null>(null);
  loading = signal(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  handleSubmit(): void {
    if (!this.usuario || !this.contrasena) {
      this.error.set('Por favor, ingrese sus credenciales');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.usuario, this.contrasena).then((success: boolean) => {
      this.loading.set(false);
      if (success) {
        this.router.navigate([this.authService.getDefaultRoute()]);
      } else {
        this.error.set('Error de autenticación: verifique sus credenciales');
      }
    }).catch((err: any) => {
      this.loading.set(false);
      this.error.set(err.message || 'Error de conexión con el servidor');
    });
  }

  quickLogin(user: string, pass: string): void {
    this.usuario = user;
    this.contrasena = pass;
    this.handleSubmit();
  }
}
