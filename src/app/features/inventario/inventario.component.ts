import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Package, Search, Trash2, Tag, TrendingUp, ShoppingCart, Archive, ChevronDown } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { SolPipe } from '../../shared/pipes/sol.pipe';

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule, SolPipe],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="page-header-tw">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Inventario</h1>
          <p class="text-sm text-slate-500 mt-0.5">Tus piezas guardadas desde la calculadora</p>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="card-tw py-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">Total piezas</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ items().length }}</p>
        </div>
        <div class="card-tw py-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">Por vender</p>
          <p class="text-2xl font-black text-orange-500 mt-1">{{ countByStatus('por_vender') }}</p>
        </div>
        <div class="card-tw py-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">Vendidos</p>
          <p class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{{ countByStatus('vendido') }}</p>
        </div>
        <div class="card-tw py-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">Ingresos (vendidos)</p>
          <p class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{{ soldRevenue() | sol }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card-tw py-3">
        <div class="flex flex-wrap gap-3 items-center">
          <!-- Search -->
          <div class="relative flex-1 min-w-[200px] max-w-sm">
            <lucide-icon [img]="SearchIcon" [size]="13"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="load()"
              placeholder="Buscar por nombre..."
              class="input-tw pl-8 py-2 text-sm" />
          </div>

          <!-- Status filter -->
          <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="input-tw py-2 text-sm w-auto">
            <option value="">Todos</option>
            <option value="por_vender">Por vender</option>
            <option value="vendido">Vendidos</option>
            <option value="descartado">Descartados</option>
          </select>

          <!-- Sort -->
          <select [(ngModel)]="sortBy" (ngModelChange)="load()" class="input-tw py-2 text-sm w-auto">
            <option value="created_desc">Más recientes</option>
            <option value="price_desc">Mayor precio</option>
            <option value="price_asc">Menor precio</option>
          </select>
        </div>
      </div>

      <!-- Table / List -->
      @if (loading()) {
        <div class="card-tw flex items-center justify-center py-12">
          <div class="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (items().length === 0) {
        <div class="card-tw flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
            <lucide-icon [img]="PackageIcon" [size]="28" class="text-orange-400" />
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-sm">No hay piezas en el inventario</p>
          <p class="text-xs text-slate-400 mt-1">Usa la Calculadora para añadir piezas</p>
        </div>
      } @else {
        <div class="card-tw p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pieza</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Costo</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Precio</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Margen</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700/40">
                @for (item of items(); track item.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-100">
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-800 dark:text-slate-200">{{ item.piece_name || 'Sin nombre' }}</p>
                      <p class="text-xs text-slate-400">{{ item.created_at | date:'dd/MM/yy HH:mm' }}</p>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span class="text-sm text-slate-600 dark:text-slate-400">{{ item.production_cost | sol }}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <!-- Inline editable sale price -->
                      @if (editingId() === item.id) {
                        <input type="number" [(ngModel)]="editPrice" (keydown.enter)="saveEdit(item)"
                          (keydown.escape)="cancelEdit()" (blur)="saveEdit(item)"
                          class="w-24 text-right input-tw py-1 text-sm font-bold" autofocus />
                      } @else {
                        <button (click)="startEdit(item)"
                          class="text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline">
                          {{ item.sale_price | sol }}
                        </button>
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                        [class]="item.margin_percent >= 0
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'">
                        {{ item.margin_percent >= 0 ? '+' : '' }}{{ item.margin_percent | number:'1.0-0' }}%
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <select [(ngModel)]="item.status" (change)="updateStatus(item)"
                        class="text-xs rounded-lg px-2 py-1 font-semibold border-0 cursor-pointer
                               outline outline-1 focus:outline-orange-400 transition-all duration-150"
                        [class]="statusClass(item.status)">
                        <option value="por_vender">Por vender</option>
                        <option value="vendido">Vendido</option>
                        <option value="descartado">Descartado</option>
                      </select>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button (click)="deleteItem(item.id)"
                        class="p-1.5 rounded-lg text-slate-300 dark:text-slate-600
                               hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500
                               transition-colors duration-150">
                        <lucide-icon [img]="TrashIcon" [size]="14" />
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class InventarioComponent implements OnInit {
    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);

    PackageIcon = Package;
    SearchIcon = Search;
    TrashIcon = Trash2;
    TagIcon = Tag;
    TrendingUpIcon = TrendingUp;
    CartIcon = ShoppingCart;
    ArchiveIcon = Archive;
    ChevronDownIcon = ChevronDown;

    items = signal<any[]>([]);
    loading = signal(false);
    searchQuery = '';
    statusFilter = '';
    sortBy = 'created_desc';

    editingId = signal<string | null>(null);
    editPrice = 0;

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        const params: any = { sort: this.sortBy };
        if (this.searchQuery) params.search = this.searchQuery;
        if (this.statusFilter) params.status = this.statusFilter;

        this.api.getInventory(params).subscribe({
            next: (data) => { this.items.set(data ?? []); this.loading.set(false); this.cdr.detectChanges(); },
            error: () => { this.loading.set(false); this.cdr.detectChanges(); }
        });
    }

    countByStatus(st: string) { return this.items().filter(i => i.status === st).length; }

    soldRevenue() { return this.items().filter(i => i.status === 'vendido').reduce((s, i) => s + i.sale_price, 0); }

    statusClass(s: string) {
        if (s === 'vendido') return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 outline-emerald-200 dark:outline-emerald-500/30';
        if (s === 'descartado') return 'bg-slate-100 dark:bg-slate-700 text-slate-500 outline-slate-200';
        return 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 outline-orange-200 dark:outline-orange-500/30';
    }

    updateStatus(item: any) {
        this.api.updateInventory(item.id, { sale_price: item.sale_price, status: item.status, notes: item.notes || '' })
            .subscribe({ next: () => this.load(), error: () => { } });
    }

    startEdit(item: any) { this.editingId.set(item.id); this.editPrice = item.sale_price; }
    cancelEdit() { this.editingId.set(null); }

    saveEdit(item: any) {
        if (this.editingId() !== item.id) return;
        this.api.updateInventory(item.id, { sale_price: this.editPrice, status: item.status, notes: item.notes || '' })
            .subscribe({ next: () => { this.editingId.set(null); this.load(); }, error: () => { } });
    }

    deleteItem(id: string) {
        if (!confirm('¿Eliminar esta pieza del inventario?')) return;
        this.api.deleteInventory(id).subscribe({ next: () => this.load(), error: () => { } });
    }
}
