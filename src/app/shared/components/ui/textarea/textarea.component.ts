import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5 w-full">
      <label *ngIf="label()" class="font-ui text-[10px] font-bold text-[#64748B] uppercase tracking-widest ml-1">
        {{ label() }} <span *ngIf="required()" class="text-destructive font-bold">*</span>
      </label>
      <textarea
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [class]="textareaClasses()"
        (input)="onInput($event)"
        (blur)="onBlur.emit()"
      ></textarea>
    </div>
  `
})
export class UiTextareaComponent {
  label = input<string>('');
  placeholder = input<string>('');
  value = input<any>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  className = input<string>('');

  onValueChange = output<any>();
  onBlur = output<void>();

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.onValueChange.emit(val);
  }

  protected textareaClasses(): string {
    const base = 'w-full p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] focus:bg-white focus:border-[#2e5ba7] focus:ring-4 focus:ring-[#2e5ba7]/5 transition-all outline-none font-body text-sm min-h-[100px] resize-y disabled:opacity-50 disabled:cursor-not-allowed';
    return `${base} ${this.className()}`;
  }
}
