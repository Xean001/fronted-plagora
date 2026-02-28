import { Component, inject, OnInit, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, ArrowUpRight, Package, Globe } from 'lucide-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, Sale } from '../../core/models/models';
import { SolPipe } from '../../shared/pipes/sol.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NgApexchartsModule, SolPipe],
  template: `
    <div class="space-y-8">

      <!-- Page header -->
      <div class="page-header-tw">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen general del negocio</p>
        </div>
        <a routerLink="/ventas/nueva" class="btn-primary-tw">
          <lucide-icon [img]="PlusIcon" [size]="16" />
          Nueva venta
        </a>
      </div>

      <!-- Stat Cards -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card animate-pulse min-h-[110px]">
              <div class="h-4 bg-slate-100 rounded w-1/2 mb-3"></div>
              <div class="h-7 bg-slate-100 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <!-- Revenue combinado -->
          <div class="stat-card animate-slide-up animate-stagger-1">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ingresos del mes</p>
                <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{{ stats()!.current_month_revenue | sol }}</p>
                <p class="text-xs text-emerald-600 flex items-center gap-1 mt-1.5">
                  <lucide-icon [img]="TrendingUpIcon" [size]="12" />
                  Ventas web este mes
                </p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="DollarSignIcon" [size]="18" class="text-indigo-600" />
              </div>
            </div>
          </div>

          <!-- Inventario vendido -->
          <div class="stat-card animate-slide-up animate-stagger-2">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ingresos inventario</p>
                <p class="text-2xl font-bold text-orange-500 mt-1.5">{{ invRevenue() | sol }}</p>
                <p class="text-xs text-orange-600 flex items-center gap-1 mt-1.5">
                  <lucide-icon [img]="PackageIcon" [size]="12" />
                  {{ invSoldCount() }} piezas vendidas
                </p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="PackageIcon" [size]="18" class="text-orange-500" />
              </div>
            </div>
          </div>

          <!-- Orders -->
          <div class="stat-card animate-slide-up animate-stagger-3">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ventas totales</p>
                <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{{ stats()!.total_sales }}</p>
                <p class="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                  <lucide-icon [img]="ShoppingCartIcon" [size]="12" />
                  Acumulado
                </p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="ShoppingCartIcon" [size]="18" class="text-violet-600" />
              </div>
            </div>
          </div>

          <!-- Pending -->
          <div class="stat-card animate-slide-up animate-stagger-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sin cobrar</p>
                <p class="text-2xl font-bold text-amber-500 mt-1.5">{{ stats()!.unpaid_sales }}</p>
                <p class="text-xs text-amber-600 flex items-center gap-1 mt-1.5">
                  <lucide-icon [img]="ClockIcon" [size]="12" />
                  Pagos pendientes
                </p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="ClockIcon" [size]="18" class="text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Combined monthly total -->
      @if (stats()) {
        <div class="relative overflow-hidden rounded-2xl border-2 border-orange-200 dark:border-orange-500/30
                    bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50
                    dark:from-orange-500/10 dark:via-amber-500/5 dark:to-orange-500/10
                    px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <!-- Left: total -->
          <div class="flex-1">
            <p class="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-1">Total del mes (web + inventario)</p>
            <p class="text-4xl font-black text-orange-600 dark:text-orange-400">
              {{ (stats()!.current_month_revenue + invThisMonthRevenue()) | sol }}
            </p>
            <p class="text-xs text-orange-500 dark:text-orange-400/70 mt-1">Mes actual · {{ today }}</p>
          </div>
          <!-- Right: breakdown -->
          <div class="flex gap-6 flex-shrink-0">
            <div class="text-center">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">🌐 Ventas web</p>
              <p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ stats()!.current_month_revenue | sol }}</p>
            </div>
            <div class="w-px bg-orange-200 dark:bg-orange-500/30"></div>
            <div class="text-center">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">📦 Inventario</p>
              <p class="text-xl font-bold text-orange-500">{{ invThisMonthRevenue() | sol }}</p>
              <p class="text-xs text-orange-400">{{ invThisMonthCount() }} piezas</p>
            </div>
          </div>
          <!-- Decorative circle -->
          <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-200/30 dark:bg-orange-500/10"></div>
        </div>
      }

      <!-- Chart + Two summary panels -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Area Chart -->
        <div class="card-tw lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white">Resumen de ventas</h3>
              <p class="text-xs text-slate-500 mt-0.5">Ingresos · Costos · Ganancias</p>
            </div>
          </div>
          <apx-chart
            [series]="chartSeries"
            [chart]="chartOptions"
            [xaxis]="chartXAxis"
            [yaxis]="chartYAxis"
            [colors]="chartColors"
            [fill]="chartFill"
            [stroke]="chartStroke"
            [tooltip]="chartTooltip"
            [dataLabels]="chartDataLabels"
            [grid]="chartGrid"
          />
        </div>

        <!-- Two mini panels stacked -->
        @if (stats()) {
          <div class="flex flex-col gap-4">

            <!-- Panel 1: Ventas por web -->
            <div class="card-tw flex-1">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                  <lucide-icon [img]="GlobeIcon" [size]="14" class="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white text-sm">Ventas por web</h3>
              </div>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">Pendientes</span>
                  <span class="badge-pending text-xs">{{ stats()!.pending_sales }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">En proceso</span>
                  <span class="badge-progress text-xs">{{ stats()!.in_progress_sales }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">Ingresos</span>
                  <span class="text-xs font-semibold text-emerald-600">{{ stats()!.total_revenue | sol }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">Costo prod.</span>
                  <span class="text-xs font-semibold text-red-500">{{ stats()!.total_production_cost | sol }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Ganancia neta</span>
                  <span class="text-xs font-bold" [class]="stats()!.total_profit >= 0 ? 'text-emerald-600' : 'text-red-500'">
                    {{ stats()!.total_profit | sol }}
                  </span>
                </div>
              </div>
              <a routerLink="/ventas" class="btn-secondary-tw w-full justify-center mt-4 text-xs py-2">Ver ventas →</a>
            </div>

            <!-- Panel 2: Ventas de inventario -->
            <div class="card-tw flex-1">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/15 flex items-center justify-center">
                  <lucide-icon [img]="PackageIcon" [size]="14" class="text-orange-500" />
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white text-sm">Ventas de inventario</h3>
              </div>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">Por vender</span>
                  <span class="text-xs font-semibold text-orange-500">{{ invPorVender() }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">Vendidas</span>
                  <span class="text-xs font-semibold text-emerald-600">{{ invSoldCount() }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                  <span class="text-xs text-slate-500">Descartadas</span>
                  <span class="text-xs font-semibold text-slate-400">{{ invDescartado() }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Ingresos generados</span>
                  <span class="text-xs font-bold text-orange-500">{{ invRevenue() | sol }}</span>
                </div>
              </div>
              <a routerLink="/inventario" class="btn-secondary-tw w-full justify-center mt-4 text-xs py-2">Ver inventario →</a>
            </div>

          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  stats = signal<DashboardStats | null>(null);
  invItems = signal<any[]>([]);
  loading = signal(true);

  PlusIcon = ArrowUpRight;
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  DollarSignIcon = DollarSign;
  ShoppingCartIcon = ShoppingCart;
  ClockIcon = Clock;
  ArrowUpRightIcon = ArrowUpRight;
  PackageIcon = Package;
  GlobeIcon = Globe;

  invRevenue = computed(() => this.invItems().filter(i => i.status === 'vendido').reduce((s: number, i: any) => s + i.sale_price, 0));
  invSoldCount = computed(() => this.invItems().filter(i => i.status === 'vendido').length);
  invPorVender = computed(() => this.invItems().filter(i => i.status === 'por_vender').length);
  invDescartado = computed(() => this.invItems().filter(i => i.status === 'descartado').length);

  today = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  private currentMonth = new Date().getMonth();
  private currentYear = new Date().getFullYear();

  invThisMonthRevenue = computed(() =>
    this.invItems()
      .filter(i => i.status === 'vendido' && i.sold_at &&
        new Date(i.sold_at).getMonth() === this.currentMonth &&
        new Date(i.sold_at).getFullYear() === this.currentYear)
      .reduce((s: number, i: any) => s + i.sale_price, 0)
  );
  invThisMonthCount = computed(() =>
    this.invItems().filter(i => i.status === 'vendido' && i.sold_at &&
      new Date(i.sold_at).getMonth() === this.currentMonth &&
      new Date(i.sold_at).getFullYear() === this.currentYear).length
  );

  // ─── ApexCharts ───────────────────────────────────────────
  chartSeries = [
    { name: 'Ingresos', data: [820, 932, 901, 1134, 1290, 1330, 1420] },
    { name: 'Costos', data: [320, 432, 401, 534, 590, 530, 620] },
    { name: 'Ganancia', data: [500, 500, 500, 600, 700, 800, 800] },
  ];

  chartOptions = { type: 'area' as any, height: 280, toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 }, fontFamily: 'Inter, sans-serif' };
  chartXAxis = { categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], labels: { style: { colors: '#94a3b8', fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } };
  chartYAxis = { labels: { formatter: (v: number) => `S/ ${v.toFixed(0)}`, style: { colors: '#94a3b8', fontSize: '11px' } } };
  chartColors = ['#4f46e5', '#f97316', '#10b981'];
  chartFill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } };
  chartStroke = { curve: 'smooth' as any, width: 2.5 };
  chartTooltip = { x: { show: false }, y: { formatter: (v: number) => `S/ ${v.toFixed(2)}` } };
  chartDataLabels = { enabled: false };
  chartGrid = { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } };

  ngOnInit() {
    forkJoin({
      stats: this.api.getDashboardStats(),
      inv: this.api.getInventory(),
    }).subscribe({
      next: ({ stats, inv }) => {
        this.stats.set(stats);
        this.invItems.set(inv ?? []);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }
}

