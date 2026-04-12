import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-section-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 mb-3 mt-4 first:mt-0">
      <div class="w-1 h-4 bg-primary rounded-full"></div>
      <h3 class="font-ui text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{{ label }}</h3>
    </div>
  `,
  styles: []
})
export class SectionLabelComponent {
  @Input() label: string = '';
}
