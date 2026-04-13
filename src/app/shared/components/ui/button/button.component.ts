import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'white' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()"
      (click)="onClick.emit($event)"
    >
      <div class="flex items-center justify-center gap-2">
        <span *ngIf="loading()" class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
        <ng-content></ng-content>
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class UiButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  className = input<string>('');

  onClick = output<MouseEvent>();

  protected buttonClasses = computed(() => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-ui font-bold transition-all duration-200 outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-[#2C5AAB] text-white hover:bg-[#204381] shadow-md shadow-[#2C5AAB]/20 focus:ring-[#2C5AAB]/10',
      secondary: 'bg-[#0FAEBF] text-white hover:bg-[#0d9aa9] shadow-md shadow-[#0FAEBF]/20 focus:ring-[#0FAEBF]/10',
      outline: 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#2C5AAB] hover:border-[#2C5AAB]/30 focus:ring-[#F1F5F9]',
      ghost: 'bg-transparent text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#2C5AAB] focus:ring-muted',
      destructive: 'bg-[#AB2741] text-white hover:bg-[#8B1F33] shadow-sm focus:ring-[#AB2741]/10',
      white: 'bg-white text-[#334155] hover:bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm',
      warning: 'bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-md shadow-[#F59E0B]/20 focus:ring-[#F59E0B]/10'
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-[10px] tracking-wider',
      md: 'h-10 px-4 text-xs',
      lg: 'h-11 px-5 text-xs',
      xl: 'h-12 px-6 text-sm'
    };

    // Hover effect for premium feel (slight lift)
    const hoverLift = this.disabled() || this.loading() ? '' : 'hover:-translate-y-0.5';

    return `${baseClasses} ${variantClasses[this.variant()]} ${sizeClasses[this.size()]} ${hoverLift} ${this.className()}`;
  });
}
