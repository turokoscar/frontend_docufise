import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-index',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center page-pattern">
      <div class="flex flex-col items-center gap-4 animate-pulse">
        <img src="/assets/fise-logo.png" alt="FISE" class="h-16 opacity-20">
        <div class="h-1 w-48 bg-muted rounded-full overflow-hidden">
          <div class="h-full bg-primary w-1/2 animate-[slide_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
  `]
})
export class IndexPage implements OnInit {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      const defaultRoute = this.dataService.getDefaultRouteByRol(user.rol);
      this.router.navigate([defaultRoute]);
    } else {
      this.router.navigate(['/login']);
    }
  }
}