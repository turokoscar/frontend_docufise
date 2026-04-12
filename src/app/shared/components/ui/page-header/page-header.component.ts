import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-ui-page-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="bg-card border border-primary/10 shadow-sm relative overflow-hidden rounded-xl">
      <!-- Subtle gradient bg -->
      <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between p-5 relative z-10">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/10 transition-transform hover:scale-105 duration-300">
            <ng-icon [name]="icon" class="text-3xl text-primary"></ng-icon>
          </div>
          <div>
            <h2 class="font-display text-2xl font-extrabold text-foreground tracking-tight">{{ title }}</h2>
            <p class="text-sm text-muted-foreground font-body mt-0.5 max-w-md leading-relaxed">{{ subtitle }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 mt-4 md:mt-0">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'lucideLayers';
}
