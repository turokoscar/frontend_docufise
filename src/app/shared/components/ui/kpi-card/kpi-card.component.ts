import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-ui-kpi-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="bg-card border-none shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md rounded-xl">
      <div class="p-4 flex items-center gap-4">
        <div 
          class="flex items-center justify-center w-12 h-12 rounded-xl transition-transform group-hover:scale-110" 
          [style.backgroundColor]="color + '15'"
        >
          <ng-icon [name]="icon" class="text-2xl" [style.color]="color"></ng-icon>
        </div>
        <div>
          <p class="text-2xl font-display font-extrabold leading-none mb-1" [style.color]="color">
            {{ value }}
          </p>
          <p class="text-[10px] font-ui font-bold text-muted-foreground uppercase tracking-widest">{{ label }}</p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-1" [style.backgroundColor]="color"></div>
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
