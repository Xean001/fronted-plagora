import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule],
    template: `
    <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950" [class.dark]="dark()">
      <!-- Sidebar -->
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggle)="toggleSidebar()" />

      <!-- Main area -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Topbar -->
        <app-topbar [dark]="dark()" (toggleDark)="toggleDark()" />

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-6 lg:p-8">
          <div class="max-w-7xl mx-auto animate-slide-up">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
    sidebarCollapsed = signal(false);
    dark = signal(false);

    toggleSidebar() { this.sidebarCollapsed.update(v => !v); }
    toggleDark() { this.dark.update(v => !v); }
}
