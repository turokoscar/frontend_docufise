import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-filter-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-primary/5 shadow-sm p-4 rounded-xl">
      <div class="flex flex-wrap items-end gap-5">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class FilterPanelComponent {}
