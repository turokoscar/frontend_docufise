import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5 w-full">
      <label *ngIf="label()" class="font-ui text-[10px] font-bold text-[#64748B] uppercase tracking-widest ml-1">
        {{ label() }} <span *ngIf="required()" class="text-destructive font-bold">*</span>
      </label>
      <div class="relative group">
        <select
          [value]="value()"
          [disabled]="disabled()"
          [class]="selectClasses()"
          (change)="onChange($event)"
        >
          <ng-content></ng-content>
        </select>
        <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60 group-focus-within:text-primary transition-colors">
          <ng-content select="[icon]"></ng-content>
          <svg *ngIf="showDefaultChevron()" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  `
})
export class UiSelectComponent {
  label = input<string>('');
  value = input<any>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  showDefaultChevron = input<boolean>(true);
  className = input<string>('');

  onValueChange = output<any>();

  onChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.onValueChange.emit(val);
  }

  protected selectClasses(): string {
    const base = 'w-full pl-4 pr-10 h-11 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#2C5AAB] transition-all outline-none font-body text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    return `${base} ${this.className()}`;
  }
}
