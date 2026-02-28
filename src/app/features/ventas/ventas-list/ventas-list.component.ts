import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Eye, Trash2, Filter } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { Sale, SaleStatus } from '../../../core/models/models';
import { SolPipe } from '../../../shared/pipes/sol.pipe';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule, SolPipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="page-header-tw">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Ventas</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ ventas().length }} ventas registradas</p>
        </div>
        <a routerLink="/ventas/nueva" class="btn-primary-tw">
          <lucide-icon [img]="PlusIcon" [size]="16" /> Nueva venta
        </a>
      </div>

      <!-- Filters -->
      <div class="card-tw flex flex-wrap gap-4 items-end py-4">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Estado</label>
          <select [(ngModel)]="filterStatus" (change)="load()" class="input-tw h-9 text-sm min-w-[140px]">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Pago</label>
          <select [(ngModel)]="filterPaid" (change)="load()" class="input-tw h-9 text-sm min-w-[130px]">
            <option value="">Todos</option>
            <option value="false">Sin cobrar</option>
            <option value="true">Cobrado</option>
          </select>
        </div>
        <button (click)="clearFilters()" class="btn-ghost-tw h-9 text-sm">
          <lucide-icon [img]="FilterIcon" [size]="14" /> Limpiar
        </button>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="card-tw flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      } @else if (ventas().length === 0) {
        <div class="card-tw text-center py-20">
          <div class="text-5xl mb-4">💰</div>
          <h3 class="font-semibold text-slate-900 dark:text-white">No hay ventas</h3>
          <p class="text-sm text-slate-500 mt-1">Crea tu primera venta para empezar</p>
          <a routerLink="/ventas/nueva" class="btn-primary-tw inline-flex mt-4">+ Nueva venta</a>
        </div>
      } @else {
        <div class="card-tw overflow-hidden p-0">
          <div class="overflow-x-auto">
            <table class="table-tw">
              <thead>
                <tr>
                  <th>Descripción</th><th>Cliente</th><th>Filamento</th>
                  <th>Costo</th><th>Precio</th><th>Ganancia</th>
                  <th>Estado</th><th>Pago</th><th>Fecha</th><th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (v of ventas(); track v.id) {
                  <tr class="animate-fade-in">
                    <td>
                      <p class="font-medium text-slate-900 dark:text-white">{{ v.description }}</p>
                      @if (v.color) { <p class="text-xs text-slate-400">{{ v.color }}</p> }
                    </td>
                    <td class="text-slate-600">{{ v.client?.name || '—' }}</td>
                    <td class="text-slate-600">{{ v.material || '—' }}</td>
                    <td class="text-red-500 font-medium">{{ v.total_production_cost | sol }}</td>
                    <td class="text-emerald-600 font-semibold">{{ v.final_price | sol }}</td>
                    <td [class]="v.profit >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'">{{ v.profit | sol }}</td>
                    <td><span [class]="statusBadge(v.status)">{{ statusLabel(v.status) }}</span></td>
                    <td><span [class]="v.paid ? 'badge-paid' : 'badge-unpaid'">{{ v.paid ? 'Cobrado' : 'Pendiente' }}</span></td>
                    <td class="text-slate-400 text-xs">{{ v.created_at | date:'dd/MM/yy' }}</td>
                    <td>
                      <div class="flex justify-end gap-2">
                        <a [routerLink]="'/ventas/' + v.id" class="btn-ghost-tw w-8 h-8 p-0 justify-center">
                          <lucide-icon [img]="EyeIcon" [size]="14" />
                        </a>
                        <button (click)="delete(v)" class="btn-ghost-tw w-8 h-8 p-0 justify-center text-red-400 hover:text-red-600 hover:bg-red-50">
                          <lucide-icon [img]="TrashIcon" [size]="14" />
                        </button>
                      </div>
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
export class VentasListComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ventas = signal<Sale[]>([]);
  loading = signal(true);
  filterStatus = '';
  filterPaid = '';

  PlusIcon = Plus;
  EyeIcon = Eye;
  TrashIcon = Trash2;
  FilterIcon = Filter;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const params: Record<string, string> = {};
    if (this.filterStatus) params['status'] = this.filterStatus;
    if (this.filterPaid) params['paid'] = this.filterPaid;
    this.api.getVentas(params).subscribe({
      next: vs => { this.ventas.set(vs ?? []); this.loading.set(false); this.cdr.detectChanges(); },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  clearFilters() { this.filterStatus = ''; this.filterPaid = ''; this.load(); }

  delete(v: Sale) {
    if (!confirm(`¿Eliminar "${v.description}"?`)) return;
    this.api.deleteVenta(v.id).subscribe(() => this.load());
  }

  statusLabel(s: SaleStatus) {
    return { pendiente: 'Pendiente', en_proceso: 'En proceso', completado: 'Completado', cancelado: 'Cancelado' }[s] ?? s;
  }
  statusBadge(s: SaleStatus) {
    return { pendiente: 'badge-pending', en_proceso: 'badge-progress', completado: 'badge-completed', cancelado: 'badge-cancelled' }[s] ?? '';
  }
}
