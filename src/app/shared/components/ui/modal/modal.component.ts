import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        (click)="onBackdropClick()"
      ></div>
      
      <!-- Modal Container -->
      <div 
        [class]="modalClasses()"
        (click)="$event.stopPropagation()"
      >
        <!-- Close Button (Top Right) -->
        <button 
          *ngIf="showCloseButton()" 
          (click)="close()" 
          class="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors z-10 text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <!-- Header Slot -->
        <div class="px-6 py-4 border-b border-border">
          <ng-content select="[header]"></ng-content>
        </div>

        <!-- Body Slot -->
        <div [class]="bodyClasses()">
          <ng-content select="[body]"></ng-content>
        </div>

        <!-- Footer Slot -->
        <div *ngIf="hasFooter()" class="px-6 py-4 border-t border-border bg-muted/30">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UiModalComponent {
  isOpen = input<boolean>(false);
  maxWidth = input<string>('max-w-lg');
  closeOnBackdrop = input<boolean>(true);
  showCloseButton = input<boolean>(true);
  hasFooter = input<boolean>(true);
  paddingBody = input<boolean>(true);
  
  onClose = output<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  close(): void {
    this.onClose.emit();
  }

  protected modalClasses(): string {
    const base = 'relative bg-card rounded-[24px] shadow-2xl w-full overflow-hidden border border-border/50 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300';
    return `${base} ${this.maxWidth()}`;
  }

  protected bodyClasses(): string {
    const padding = this.paddingBody() ? 'p-6' : '';
    return `max-h-[80vh] overflow-y-auto ${padding}`;
  }
}
