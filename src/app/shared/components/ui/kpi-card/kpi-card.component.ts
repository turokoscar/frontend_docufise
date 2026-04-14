import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowUpRight, lucideArrowDownRight } from '@ng-icons/lucide';

@Component({
  selector: 'app-ui-kpi-card',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({ lucideArrowUpRight, lucideArrowDownRight })
  ],
  template: `
    <div 
      class="bg-card border border-border/40 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md rounded-xl flex"
      [ngClass]="{
        'flex-row': variant === 'left',
        'flex-col': variant === 'bottom' || variant === 'mini'
      }"
    >
      <!-- Accent Border (Not for mini) -->
      @if (variant !== 'mini') {
        <div 
          [style.backgroundColor]="color"
          [ngClass]="{
            'w-1.5 h-full shrink-0': variant === 'left',
            'w-full h-1.5 order-last': variant === 'bottom'
          }"
        ></div>
      }
      
      <div 
        class="p-5 flex gap-5 w-full"
        [ngClass]="{
          'items-center': variant !== 'mini',
          'flex-col items-center justify-center text-center py-6': variant === 'mini'
        }"
      >
        @if (variant !== 'mini') {
          <div 
            class="flex items-center justify-center rounded-2xl border border-border/5 transition-transform group-hover:scale-105" 
            [ngClass]="{
              'w-14 h-14': variant === 'left',
              'w-12 h-12 order-last ml-auto': variant === 'bottom'
            }"
            [style.backgroundColor]="color + '05'"
          >
            <ng-icon [name]="icon" [class]="variant === 'left' ? 'text-3xl' : 'text-xl'" [style.color]="color"></ng-icon>
          </div>
        }

        <div>
           @if (variant === 'mini') {
            <p class="text-3xl font-display font-black leading-tight mb-1" [style.color]="color">
              {{ value }}
            </p>
            <p class="text-[11px] font-ui font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-1">{{ label }}</p>
          } @else {
            <p class="text-[11px] font-ui font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-1">{{ label }}</p>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-display font-black leading-tight text-[#1E293B]">
                {{ value }}
              </p>
            </div>
          }
          
          @if (trend && variant !== 'mini') {
            <div class="flex items-center gap-1.5 mt-2">
              <div 
                class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-ui"
                [ngClass]="{
                  'bg-success/10 text-success': (trend.reverse ? trend.value < 0 : trend.value > 0),
                  'bg-destructive/10 text-destructive': (trend.reverse ? trend.value > 0 : trend.value < 0),
                  'bg-muted text-muted-foreground': trend.value === 0
                }"
              >
                <ng-icon 
                  [name]="trend.value >= 0 ? 'lucideArrowUpRight' : 'lucideArrowDownRight'" 
                  class="text-[10px]"
                ></ng-icon>
                {{ trend.value > 0 ? '+' : '' }}{{ trend.value }}%
              </div>
              <span class="text-[10px] text-muted-foreground/50 font-medium font-ui">{{ trend.label }}</span>
            </div>
          }
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
  @Input() color: string = '#2e5ba7';
  @Input() variant: 'left' | 'bottom' | 'mini' = 'left';
  @Input() trend?: { value: number; label: string; reverse?: boolean };
}
