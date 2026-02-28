import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100 dark:bg-zinc-900">
      <app-sidebar [collapsed]="sidebarCollapsed()" [dark]="dark()" (toggle)="toggleSidebar()" />
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <app-topbar [dark]="dark()" (toggleDark)="toggleDark()" />
        <main class="flex-1 overflow-y-auto p-6 lg:p-8">
          <div class="max-w-7xl mx-auto">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  private platformId = inject(PLATFORM_ID);

  sidebarCollapsed = signal(false);
  dark = signal(false);

  constructor() {
    // Keep <html> class in sync — needed for Tailwind's darkMode: 'class'
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        if (this.dark()) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  toggleSidebar() { this.sidebarCollapsed.update(v => !v); }
  toggleDark() { this.dark.update(v => !v); }
}
