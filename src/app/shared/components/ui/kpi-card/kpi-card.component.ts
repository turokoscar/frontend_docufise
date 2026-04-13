import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-ui-kpi-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="bg-card border border-border/40 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md rounded-xl flex">
      <!-- Left Accent Border -->
      <div class="w-1.5 h-full shrink-0" [style.backgroundColor]="color"></div>
      
      <div class="p-5 flex items-center gap-5 w-full">
        <div 
          class="flex items-center justify-center w-14 h-14 rounded-2xl border border-border/5 transition-transform group-hover:scale-105" 
          [style.backgroundColor]="color + '05'"
        >
          <ng-icon [name]="icon" class="text-3xl" [style.color]="color"></ng-icon>
        </div>
        <div>
          <p class="text-3xl font-display font-black leading-tight text-[#1E293B]">
            {{ value }}
          </p>
          <p class="text-[11px] font-ui font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">{{ label }}</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class KpiCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = 'lucideLayers';
  @Input() color: string = '#2C5AAB';
}
