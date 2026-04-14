import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-ui-page-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div class="bg-card border border-border/40 shadow-sm relative overflow-hidden rounded-xl">
      <!-- Clean background pattern -->
      <div class="absolute inset-0 bg-[#F8FAFC]"></div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-[#2e5ba7]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between p-6 relative z-10">
        <div class="flex items-center gap-5">
          <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-border/10">
            <ng-icon [name]="icon" class="text-3xl text-[#2e5ba7]"></ng-icon>
          </div>
          <div>
            <h2 class="font-display text-2xl font-extrabold text-[#1E293B] tracking-tight">{{ title }}</h2>
            <p class="text-[13px] text-[#64748B] font-body mt-0.5 max-w-md leading-relaxed">{{ subtitle }}</p>
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
