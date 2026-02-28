import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Sale, SaleStatus } from '../../../core/models/models';
import { SolPipe } from '../../../shared/pipes/sol.pipe';

@Component({
  selector: 'app-venta-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SolPipe],
  template: `
    <div class="page-header">
      <div class="page-title">
        <h1>🔍 Detalle de venta</h1>
        @if (sale) { <p>{{ sale.description }}</p> }
      </div>
      <button class="btn btn-secondary" (click)="router.navigate(['/ventas'])">← Volver</button>
    </div>

    @if (loading) {
      <div class="loading-wrap"><div class="spinner"></div></div>
    } @else if (sale) {
      <div class="detail-layout">
        <!-- Main info -->
        <div class="detail-main">
          <div class="card">
            <div class="detail-header">
              <div>
                <h2>{{ sale.description }}</h2>
                <div class="flex gap-2 items-center" style="margin-top:8px">
                  <span [class]="badgeClass(sale.status)">{{ statusLabel(sale.status) }}</span>
                  <span [class]="sale.paid ? 'badge badge-paid' : 'badge badge-unpaid'">
                    {{ sale.paid ? '✅ Cobrado' : '⏳ Sin cobrar' }}
                  </span>
                  @if (sale.material) { <span class="badge" style="background:var(--bg-hover)">{{ sale.material }}</span> }
                  @if (sale.color)    { <span class="badge" style="background:var(--bg-hover)">{{ sale.color }}</span> }
                </div>
              </div>
              <div class="detail-price">
                <p>Precio cobrado</p>
                <h1 class="text-success">{{ sale.final_price | sol }}</h1>
                <p class="text-muted" style="font-size:12px">Ganancia: {{ sale.profit | sol }}</p>
              </div>
            </div>

            @if (sale.client) {
              <div class="info-row">
                <span>👤 Cliente</span>
                <strong>{{ sale.client.name }}</strong>
              </div>
            }
            @if (sale.payment_method) {
              <div class="info-row">
                <span>💳 Método de pago</span>
                <strong>{{ sale.payment_method }}</strong>
              </div>
            }
            @if (sale.notes) {
              <div class="info-row">
                <span>📝 Notas</span>
                <strong>{{ sale.notes }}</strong>
              </div>
            }
            <div class="info-row">
              <span>📅 Fecha</span>
              <strong>{{ sale.created_at | date:'dd/MM/yyyy HH:mm' }}</strong>
            </div>
          </div>

          <!-- Edit status -->
          <div class="card">
            <h4 style="margin-bottom:16px">✏️ Actualizar estado</h4>
            <div class="form-grid-2">
              <div class="form-group">
                <label>Estado</label>
                <select [(ngModel)]="editStatus">
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div class="form-group">
                <label>Pago</label>
                <select [(ngModel)]="editPaid">
                  <option [value]="false">Sin cobrar</option>
                  <option [value]="true">Cobrado</option>
                </select>
              </div>
            </div>
            <button class="btn btn-primary" (click)="updateStatus()" [disabled]="updating" style="margin-top:8px">
              {{ updating ? 'Actualizando...' : '💾 Actualizar' }}
            </button>
          </div>
        </div>

        <!-- Cost breakdown -->
        <div class="detail-side">
          <div class="card">
            <h4 style="margin-bottom:16px">📊 Desglose de costos</h4>
            <div class="breakdown-rows">
              <div class="b-row">
                <span>🧵 Filamento ({{ sale.filament_grams }}g)</span>
                <strong>{{ sale.filament_cost | sol }}</strong>
              </div>
              <div class="b-row">
                <span>⚡ Electricidad</span>
                <strong>{{ sale.electricity_cost | sol }}</strong>
              </div>
              <div class="b-row">
                <span>🖨️ Depreciación impresora</span>
                <strong>{{ sale.depreciation_cost | sol }}</strong>
              </div>
              <div class="b-row">
                <span>🔧 Repuestos</span>
                <strong>{{ sale.spare_parts_cost | sol }}</strong>
              </div>
              <div class="b-row total">
                <span>Costo de producción</span>
                <strong class="text-danger">{{ sale.total_production_cost | sol }}</strong>
              </div>
              <div class="b-row">
                <span>💰 Precio sugerido</span>
                <strong>{{ sale.suggested_price | sol }}</strong>
              </div>
              <div class="b-row highlight">
                <span>✅ Precio cobrado</span>
                <strong>{{ sale.final_price | sol }}</strong>
              </div>
              <div class="b-row" [class.text-success]="sale.profit > 0" [class.text-danger]="sale.profit < 0">
                <span>Ganancia neta</span>
                <strong>{{ sale.profit | sol }}</strong>
              </div>
            </div>

            <div class="specs" style="margin-top:20px">
              <h4 style="margin-bottom:12px">🔩 Especificaciones</h4>
              <div class="b-row">
                <span>⏱️ Tiempo de impresión</span>
                <strong>{{ (sale.print_time_minutes / 60).toFixed(1) }}h ({{ sale.print_time_minutes }}min)</strong>
              </div>
              <div class="b-row">
                <span>🧵 Filamento</span>
                <strong>{{ sale.filament_grams }}g</strong>
              </div>
              <div class="b-row">
                <span>📈 Margen aplicado</span>
                <strong>{{ sale.profit_margin_percent }}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
    .detail-main { display: flex; flex-direction: column; gap: 16px; }
    .detail-side { position: sticky; top: 24px; }

    .detail-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border);
      h2 { margin-bottom: 0; }
      .detail-price { text-align: right; p { margin: 0; font-size: 13px; } h1 { font-size: 32px; } }
    }

    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 14px;
      span { color: var(--text-secondary); }
    }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .breakdown-rows { display: flex; flex-direction: column; gap: 6px; }
    .b-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0; font-size: 13px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      span { color: var(--text-secondary); }
      &.total {
        border-top: 1px solid var(--border); margin-top: 4px;
        padding-top: 10px; font-weight: 600;
      }
      &.highlight {
        background: rgba(124,58,237,0.1); border-radius: var(--radius-sm);
        padding: 8px 10px; border: 1px solid rgba(124,58,237,0.2);
        span, strong { color: var(--primary-light); }
      }
    }

    @media (max-width: 1024px) {
      .detail-layout { grid-template-columns: 1fr; }
      .detail-side { position: static; }
    }
  `]
})
export class VentaDetailComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  sale: Sale | null = null;
  loading = true;
  updating = false;
  editStatus: SaleStatus = 'pendiente';
  editPaid = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getVenta(id).subscribe({
      next: s => {
        this.sale = s; this.loading = false;
        this.editStatus = s.status;
        this.editPaid = s.paid;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  updateStatus() {
    if (!this.sale) return;
    this.updating = true;
    this.api.updateVenta(this.sale.id, { status: this.editStatus, paid: this.editPaid }).subscribe({
      next: s => { this.sale = s; this.updating = false; },
      error: () => this.updating = false
    });
  }

  statusLabel(s: SaleStatus) {
    return { pendiente: 'Pendiente', en_proceso: 'En proceso', completado: 'Completado', cancelado: 'Cancelado' }[s] ?? s;
  }
  badgeClass(s: SaleStatus) {
    return { pendiente: 'badge badge-pending', en_proceso: 'badge badge-progress', completado: 'badge badge-completed', cancelado: 'badge badge-cancelled' }[s] ?? 'badge';
  }
}
