import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'destructive' | 'primary' | 'muted' | 'none';

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
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-bold border font-ui uppercase tracking-tight inline-block';
    
    const variantClasses: Record<BadgeVariant, string> = {
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      destructive: 'bg-destructive/10 text-destructive border-destructive/20',
      primary: 'bg-primary/10 text-primary border-primary/20',
      muted: 'bg-muted text-muted-foreground border-muted',
      none: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${this.className()}`;
  });
}
