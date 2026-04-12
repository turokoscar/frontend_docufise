import { Component, input, signal, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger Slot -->
      <div (click)="toggle($event)">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <!-- Dropdown Menu -->
      <div 
        *ngIf="isOpen()" 
        [class]="menuClasses()"
        (click)="$event.stopPropagation()"
      >
        <div class="py-1">
          <ng-content select="[items]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UiDropdownComponent {
  private elementRef = inject(ElementRef);
  
  width = input<string>('w-48');
  align = input<'left' | 'right'>('right');
  isOpen = signal(false);

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  protected menuClasses(): string {
    const base = 'absolute mt-1 rounded-xl border border-border bg-card shadow-lg z-50 text-foreground animate-in fade-in slide-in-from-top-2 duration-200';
    const alignment = this.align() === 'right' ? 'right-0' : 'left-0';
    return `${base} ${alignment} ${this.width()}`;
  }
}
