import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5 w-full">
      <label *ngIf="label()" class="font-ui text-[10px] font-bold text-[#64748B] uppercase tracking-widest ml-1">
        {{ label() }} <span *ngIf="required()" class="text-destructive font-bold">*</span>
      </label>
      <div class="relative group">
        <div *ngIf="icon()" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors">
          <ng-content select="[icon]"></ng-content>
        </div>
        <input
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [class]="inputClasses()"
          (input)="onInput($event)"
          (blur)="onBlur.emit()"
        />
        <div class="absolute right-4 top-1/2 -translate-y-1/2">
          <ng-content select="[trailing]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UiInputComponent {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  value = input<any>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  icon = input<boolean>(false);
  className = input<string>('');

  onValueChange = output<any>();
  onBlur = output<void>();

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.onValueChange.emit(val);
  }

  protected inputClasses(): string {
    const base = 'w-full h-11 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#2C5AAB] focus:ring-4 focus:ring-[#2C5AAB]/5 transition-all outline-none font-body text-sm';
    const padding = this.icon() ? 'pl-11 pr-4' : 'px-4';
    return `${base} ${padding} ${this.className()}`;
  }
}
