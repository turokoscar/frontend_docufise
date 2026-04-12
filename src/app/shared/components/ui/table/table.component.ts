import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border-none shadow-sm overflow-visible rounded-2xl">
      <div class="overflow-x-auto overflow-y-visible rounded-2xl">
        <table class="w-full text-left border-collapse">
          <thead class="bg-[#2C5AAB] text-white">
            <tr class="h-12 uppercase">
              <ng-content select="[headers]"></ng-content>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <ng-content select="[rows]"></ng-content>
          </tbody>
        </table>
      </div>
      
      <!-- Footer/Pagination Slot -->
      <div class="border-t border-border bg-[#F9FAFB]/50 rounded-b-2xl">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class UiTableComponent {
  // We can add generic functionality here later if needed (e.g., sorting)
}
