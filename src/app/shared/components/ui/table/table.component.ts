import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-border/40 shadow-sm overflow-visible">
      <div class="overflow-x-auto overflow-y-visible">
        <table class="w-full text-left border-collapse">
          <thead class="bg-[#2e5ba7] text-white">
            <tr class="h-11">
              <ng-content select="[headers]"></ng-content>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30 bg-white">
            <ng-content select="[rows]"></ng-content>
          </tbody>
        </table>
      </div>
      
      <!-- Footer/Pagination Slot -->
      <div class="border-t border-border/50 bg-[#F9FAFB] py-3 px-4">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class UiTableComponent {
  // We can add generic functionality here later if needed (e.g., sorting)
}
