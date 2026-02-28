import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutDashboard, ShoppingBag, Users, Settings, ChevronLeft, LogOut, Calculator, Archive } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; icon: any; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  template: `
    <aside
      class="relative flex flex-col h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out z-20 flex-shrink-0"
      [class]="collapsed ? 'w-16' : 'w-60'"
    >
      <!-- Brand / Logo -->
      <div class="flex items-center justify-center px-3 py-4 border-b border-zinc-800 overflow-hidden min-h-[64px]">
        <img
          src="logo-white.svg"
          alt="Plagora"
          [class]="collapsed
            ? 'object-contain h-8 w-8'
            : 'object-contain h-10 w-auto max-w-[188px] mx-auto'"
        />
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            class="sidebar-link group relative"
            [title]="collapsed ? item.label : ''"
          >
            <lucide-icon [img]="item.icon" [size]="18" class="flex-shrink-0" />
            <span
              class="text-sm whitespace-nowrap transition-all duration-300 overflow-hidden"
              [class]="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
            >{{ item.label }}</span>

            <!-- Tooltip when collapsed -->
            @if (collapsed) {
              <div class="absolute left-full ml-2 px-2 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-xs
                          whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                          transition-opacity duration-200 z-50 shadow-xl border border-zinc-700">
                {{ item.label }}
              </div>
            }
          </a>
        }
      </nav>

      <!-- Collapse toggle -->
      <button
        (click)="toggle.emit()"
        class="absolute -right-3 top-5 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700
               flex items-center justify-center text-zinc-400
               hover:bg-orange-500 hover:border-orange-500 hover:text-white
               transition-all duration-200 z-30 shadow-md"
      >
        <lucide-icon
          [img]="ChevronLeftIcon"
          [size]="12"
          class="transition-transform duration-300"
          [class]="collapsed ? 'rotate-180' : ''"
        />
      </button>
    </aside>
  `,
  styles: [`
    :host ::ng-deep .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      color: #a1a1aa;          /* zinc-400 */
      text-decoration: none;
      font-weight: 500;
      transition: all 0.15s;
      cursor: pointer;
      background: transparent;
      border: none;
      font-family: inherit;
      font-size: 14px;
    }
    :host ::ng-deep .sidebar-link:hover {
      background: rgba(249,115,22,0.12); /* orange glow */
      color: #fb923c;                    /* orange-400 */
    }
    :host ::ng-deep .sidebar-link.active {
      background: rgba(249,115,22,0.20);
      color: #f97316;                    /* orange-500 — cat eye 🐈 */
      font-weight: 600;
    }
    /* Dark mode: same (sidebar is always dark) */
    html.dark :host ::ng-deep .sidebar-link {
      color: #a1a1aa;
    }
    html.dark :host ::ng-deep .sidebar-link:hover {
      background: rgba(249,115,22,0.12);
      color: #fb923c;
    }
    html.dark :host ::ng-deep .sidebar-link.active {
      background: rgba(249,115,22,0.20);
      color: #f97316;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() dark = false;
  @Output() toggle = new EventEmitter<void>();
  auth = inject(AuthService);

  userMenuOpen = false;
  toggleUserMenu() { this.userMenuOpen = !this.userMenuOpen; }

  get isDark() { return document.documentElement.classList.contains('dark'); }

  ChevronLeftIcon = ChevronLeft;
  LogOutIcon = LogOut;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Ventas', icon: ShoppingBag, route: '/ventas' },
    { label: 'Clientes', icon: Users, route: '/clientes' },
    { label: 'Calculadora', icon: Calculator, route: '/calculadora' },
    { label: 'Inventario', icon: Archive, route: '/inventario' },
    { label: 'Configuración', icon: Settings, route: '/config' },
  ];
}
