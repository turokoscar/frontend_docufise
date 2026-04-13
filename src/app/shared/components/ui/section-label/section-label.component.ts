import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCircleHelp } from '@ng-icons/lucide';

@Component({
  selector: 'app-ui-section-label',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({ lucideCircleHelp })
  ],
  template: `
    <div class="flex items-center justify-between gap-2 mt-8 mb-4 first:mt-2 relative">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-primary rounded-full"></div>
        <div class="flex items-center gap-1.5 group cursor-default">
          <h3 class="font-ui text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">{{ label }}</h3>
          
          @if (tooltip) {
            <div class="relative flex items-center">
              <ng-icon name="lucideCircleHelp" class="text-muted-foreground/40 hover:text-primary transition-colors text-xs"></ng-icon>
              
              <!-- Custom Popover -->
              <div class="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-white border border-border shadow-xl p-3 rounded-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-white border-l border-b border-border rotate-45"></div>
                <p class="text-[11px] leading-relaxed text-foreground font-medium normal-case tracking-normal">
                  {{ tooltip }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Right Side Slot -->
      <div class="flex items-center">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class SectionLabelComponent {
  @Input() label: string = '';
  @Input() tooltip: string = '';
}
