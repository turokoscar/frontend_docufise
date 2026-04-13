import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'destructive' | 'primary' | 'muted' | 'none' | 
                           'firmado' | 'pendiente' | 'observado' | 'ingresado' | 'registrado';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()">
      <ng-content></ng-content>
    </span>
  `
})
export class UiBadgeComponent {
  variant = input<BadgeVariant>('none');
  className = input<string>('');

  protected badgeClasses = computed(() => {
    const baseClasses = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-ui tracking-tight inline-block';
    
    const variantClasses: Record<BadgeVariant, string> = {
      // Generic
      success: 'bg-emerald-100 text-emerald-700 border-emerald-200/50',
      warning: 'bg-amber-100 text-amber-700 border-amber-200/50',
      destructive: 'bg-rose-100 text-rose-700 border-rose-200/50',
      primary: 'bg-blue-100 text-blue-700 border-blue-200/50',
      muted: 'bg-slate-100 text-slate-600 border-slate-200',
      none: 'bg-gray-100 text-gray-800 border-gray-200',
      
      // Business Semantic
      firmado: 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20',
      pendiente: 'bg-[#FFFBEB] text-[#F59E0B] border-[#F59E0B]/20',
      observado: 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20',
      ingresado: 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]/20',
      registrado: 'bg-[#EFF6FF] text-[#3B82F6] border-[#3B82F6]/20'
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${this.className()}`;
  });
}
