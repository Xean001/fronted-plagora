import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Bell, Sun, Moon, LogOut, ChevronDown } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-10 flex items-center gap-4 px-6 h-14 flex-shrink-0
                   bg-white dark:bg-zinc-900
                   border-b border-slate-200 dark:border-zinc-800">
      <div class="flex items-center gap-2 ml-auto">

        <!-- Dark mode toggle -->
        <button
          (click)="toggleDark.emit()"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                 transition-all duration-200 border
                 bg-slate-100 dark:bg-zinc-800
                 border-slate-200 dark:border-white/10
                 text-slate-700 dark:text-slate-300
                 hover:bg-slate-900 hover:border-slate-900 hover:text-white
                 dark:hover:bg-orange-500 dark:hover:border-orange-500 dark:hover:text-white"
          [title]="dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        >
          <lucide-icon [img]="dark ? SunIcon : MoonIcon" [size]="14" />
          <span class="hidden sm:inline">{{ dark ? 'Claro' : 'Oscuro' }}</span>
        </button>

        <!-- Notification -->
        <div class="relative">
          <button class="flex items-center justify-center w-8 h-8 rounded-xl
                         bg-slate-100 dark:bg-zinc-800
                         border border-slate-200 dark:border-white/10
                         text-slate-500 dark:text-slate-400
                         hover:bg-slate-200 dark:hover:bg-zinc-700
                         transition-all duration-200">
            <lucide-icon [img]="BellIcon" [size]="15" />
          </button>
          <span class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-zinc-900"></span>
        </div>

        <!-- Avatar + Admin dropdown -->
        <div class="relative">
          <button
            (click)="toggleMenu()"
            class="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl
                   hover:bg-slate-100 dark:hover:bg-zinc-800
                   transition-colors duration-200 cursor-pointer"
          >
            <div class="w-7 h-7 rounded-full bg-orange-500
                        flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                        shadow-md shadow-orange-500/30">
              A
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">Admin</span>
            <lucide-icon [img]="ChevronDownIcon" [size]="13"
              class="text-slate-400 transition-transform duration-200"
              [class]="menuOpen ? 'rotate-180' : ''" />
          </button>

          <!-- Dropdown panel -->
          @if (menuOpen) {
            <div class="absolute right-0 top-full mt-2 w-52 rounded-2xl
                        bg-white dark:bg-zinc-900
                        border border-slate-200 dark:border-white/10
                        shadow-xl shadow-slate-900/10 dark:shadow-black/40
                        overflow-hidden z-50">
              <!-- User info -->
              <div class="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center
                              text-sm font-bold text-white shadow-md shadow-orange-500/30 flex-shrink-0">
                    A
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin</p>
                    <p class="text-xs text-slate-400">Plagora</p>
                  </div>
                </div>
              </div>
              <!-- Actions -->
              <div class="p-1.5">
                <button
                  (click)="auth.logout()"
                  class="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm
                         text-red-500 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-500/10
                         transition-colors duration-150 font-medium"
                >
                  <lucide-icon [img]="LogOutIcon" [size]="15" class="flex-shrink-0" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          }
        </div>

      </div>
    </header>
  `,
})
export class TopbarComponent {
  @Input() dark = false;
  @Output() toggleDark = new EventEmitter<void>();
  auth = inject(AuthService);

  menuOpen = false;
  toggleMenu() { this.menuOpen = !this.menuOpen; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!(e.target as HTMLElement).closest('app-topbar')) {
      this.menuOpen = false;
    }
  }

  BellIcon = Bell;
  SunIcon = Sun;
  MoonIcon = Moon;
  LogOutIcon = LogOut;
  ChevronDownIcon = ChevronDown;
}
