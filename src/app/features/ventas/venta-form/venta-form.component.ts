import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CostBreakdown, Client } from '../../../core/models/models';
import { SolPipe } from '../../../shared/pipes/sol.pipe';

@Component({
    selector: 'app-venta-form',
    standalone: true,
    imports: [CommonModule, FormsModule, SolPipe],
    template: `
    <div class="page-header">
      <div class="page-title">
        <h1>➕ Nueva venta</h1>
        <p>Calcula el costo y registra la venta</p>
      </div>
      <button class="btn btn-secondary" (click)="router.navigate(['/ventas'])">← Volver</button>
    </div>

    <div class="form-layout">
      <!-- Left: Form -->
      <div class="form-col">
        <!-- Step 1: Job info -->
        <div class="card">
          <h3 style="margin-bottom:20px">📋 Datos del trabajo</h3>
          <div class="form-grid">
            <div class="form-group" style="grid-column:span 2">
              <label>Descripción *</label>
              <input [(ngModel)]="form.description" name="description" placeholder="Ej: Soporte para escritorio, figura de dragón..." required />
            </div>
            <div class="form-group">
              <label>Material</label>
              <select [(ngModel)]="form.material" name="material">
                <option value="">Seleccionar...</option>
                <option>PLA</option><option>PETG</option><option>ABS</option>
                <option>TPU</option><option>Resina</option><option>Nylon</option>
              </select>
            </div>
            <div class="form-group">
              <label>Color</label>
              <input [(ngModel)]="form.color" name="color" placeholder="Rojo, Azul, Natural..." />
            </div>
            <div class="form-group">
              <label>Cliente (opcional)</label>
              <select [(ngModel)]="form.client_id" name="client_id">
                <option value="">Sin cliente</option>
                @for (c of clientes; track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Estado inicial</label>
              <select [(ngModel)]="form.status" name="status">
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 2: Calculator inputs -->
        <div class="card">
          <h3 style="margin-bottom:4px">🧮 Calculadora de costos</h3>
          <p class="text-muted" style="margin-bottom:20px;font-size:13px">Ingresa los parámetros del trabajo para calcular el costo real</p>
          <div class="form-grid">
            <div class="form-group">
              <label>Filamento usado</label>
              <div style="position:relative">
                <input type="number" [(ngModel)]="form.filament_grams" name="filament_grams"
                       min="0" step="1" (input)="onCalcInput()" placeholder="0" />
                <span class="input-suffix">g</span>
              </div>
            </div>
            <div class="form-group">
              <label>Tiempo de impresión</label>
              <div style="position:relative">
                <input type="number" [(ngModel)]="form.print_time_minutes" name="print_time_minutes"
                       min="1" step="1" (input)="onCalcInput()" placeholder="0" />
                <span class="input-suffix">min</span>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary" (click)="calcular()" [disabled]="calculating"
                  style="margin-top:8px">
            {{ calculating ? '⏳ Calculando...' : '⚡ Calcular costo' }}
          </button>
        </div>

        <!-- Step 3: Final price -->
        @if (breakdown) {
          <div class="card">
            <h3 style="margin-bottom:20px">💰 Precio final</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Precio a cobrar (S/) *</label>
                <input type="number" [(ngModel)]="form.final_price" name="final_price"
                       min="0" step="0.01" placeholder="0.00" />
                <span class="field-hint">Precio sugerido: {{ breakdown.suggested_price | sol }}</span>
              </div>
              <div class="form-group">
                <label>Método de pago</label>
                <select [(ngModel)]="form.payment_method" name="payment_method">
                  <option value="">No especificado</option>
                  <option>Efectivo</option><option>Yape</option><option>Plin</option>
                  <option>Transferencia</option><option>Otros</option>
                </select>
              </div>
              <div class="form-group" style="grid-column:span 2">
                <label>Notas</label>
                <textarea [(ngModel)]="form.notes" name="notes" placeholder="Detalles adicionales..."></textarea>
              </div>
            </div>

            @if (saveError) {
              <div class="error-msg">⚠️ {{ saveError }}</div>
            }

            <div class="flex gap-2 mt-4">
              <button class="btn btn-primary" (click)="save()" [disabled]="saving">
                {{ saving ? 'Guardando...' : '💾 Guardar venta' }}
              </button>
              <button class="btn btn-secondary" (click)="router.navigate(['/ventas'])">Cancelar</button>
            </div>
          </div>
        }
      </div>

      <!-- Right: Cost breakdown -->
      @if (breakdown) {
        <div class="breakdown-col">
          <div class="card">
            <h4 style="margin-bottom:16px">📊 Desglose de costos</h4>

            <div class="breakdown-section">
              <p class="section-label">Por hora</p>
              <div class="breakdown-row">
                <span>⚡ Electricidad/hora</span>
                <strong>{{ breakdown.electricity_cost_per_hour | sol:4 }}</strong>
              </div>
              <div class="breakdown-row">
                <span>🖨️ Depreciación/hora</span>
                <strong>{{ breakdown.depreciation_per_hour | sol:4 }}</strong>
              </div>
              <div class="breakdown-row">
                <span>🔧 Repuestos/hora</span>
                <strong>{{ breakdown.spare_parts_per_hour | sol:4 }}</strong>
              </div>
              <div class="breakdown-row total">
                <span>Base/hora</span>
                <strong>{{ breakdown.base_cost_per_hour | sol }}</strong>
              </div>
              <div class="breakdown-row highlight">
                <span>✅ Mínimo/hora</span>
                <strong>{{ breakdown.min_hourly_rate | sol }}</strong>
              </div>
            </div>

            <div class="breakdown-section">
              <p class="section-label">Este trabajo ({{ (breakdown.print_time_minutes / 60).toFixed(1) }}h)</p>
              <div class="breakdown-row">
                <span>🧵 Filamento ({{ breakdown.filament_grams }}g)</span>
                <strong>{{ breakdown.filament_cost | sol }}</strong>
              </div>
              <div class="breakdown-row">
                <span>⚡ Electricidad</span>
                <strong>{{ breakdown.electricity_cost | sol }}</strong>
              </div>
              <div class="breakdown-row">
                <span>🖨️ Depreciación</span>
                <strong>{{ breakdown.depreciation_cost | sol }}</strong>
              </div>
              <div class="breakdown-row">
                <span>🔧 Repuestos</span>
                <strong>{{ breakdown.spare_parts_cost | sol }}</strong>
              </div>
              <div class="breakdown-row total">
                <span>Costo total producción</span>
                <strong class="text-danger">{{ breakdown.total_production_cost | sol }}</strong>
              </div>
              <div class="breakdown-row highlight">
                <span>💰 Precio sugerido ({{ breakdown.margin_percent }}% margen)</span>
                <strong>{{ breakdown.suggested_price | sol }}</strong>
              </div>
            </div>

            <!-- Step by step -->
            <details style="margin-top:16px">
              <summary style="cursor:pointer;font-size:13px;color:var(--text-secondary);padding:8px 0">
                📐 Ver cálculo paso a paso
              </summary>
              <div class="steps" style="margin-top:12px">
                @for (step of breakdown.explanation; track step.step) {
                  <div class="step">
                    <div class="step-num">{{ step.step }}</div>
                    <div class="step-content">
                      <strong>{{ step.label }}</strong>
                      <code>{{ step.formula }}</code>
                      <span class="step-result">= {{ step.result | sol }}</span>
                    </div>
                  </div>
                }
              </div>
            </details>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .form-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
      align-items: start;
    }
    .form-col { display: flex; flex-direction: column; gap: 16px; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .input-suffix {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); font-size: 13px; pointer-events: none;
    }

    .field-hint { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

    .breakdown-col { position: sticky; top: 24px; }

    .breakdown-section {
      margin-bottom: 16px;
      .section-label {
        font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
        color: var(--text-muted); margin-bottom: 8px; font-weight: 600;
      }
    }

    .breakdown-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      span { color: var(--text-secondary); }
      &.total {
        border-bottom: none; border-top: 1px solid var(--border);
        padding-top: 10px; margin-top: 4px;
        span, strong { font-weight: 600; }
      }
      &.highlight {
        background: rgba(124,58,237,0.1);
        border-radius: var(--radius-sm);
        padding: 8px 10px;
        border: 1px solid rgba(124,58,237,0.2);
        span, strong { color: var(--primary-light); }
      }
    }

    .steps { display: flex; flex-direction: column; gap: 10px; }
    .step {
      display: flex; gap: 10px; align-items: flex-start;
      .step-num {
        width: 22px; height: 22px; min-width: 22px;
        background: var(--primary);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700;
        margin-top: 2px;
      }
      .step-content {
        flex: 1;
        strong { display: block; font-size: 12px; color: var(--text-secondary); }
        code {
          display: block; font-family: monospace; font-size: 11px;
          color: var(--accent-light); margin: 2px 0;
        }
        .step-result { font-size: 13px; font-weight: 600; color: var(--text-primary); }
      }
    }

    .error-msg {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--radius-sm); padding: 10px 14px;
      color: var(--danger); font-size: 13px; margin-bottom: 12px;
    }

    @media (max-width: 1024px) {
      .form-layout { grid-template-columns: 1fr; }
      .breakdown-col { position: static; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class VentaFormComponent implements OnInit {
    router = inject(Router);
    private api = inject(ApiService);

    clientes: Client[] = [];
    breakdown: CostBreakdown | null = null;
    calculating = false;
    saving = false;
    saveError = '';

    form = {
        description: '', material: '', color: '',
        client_id: '', status: 'pendiente',
        filament_grams: 0, print_time_minutes: 0,
        final_price: 0, payment_method: '', notes: '',
        paid: false,
    };

    ngOnInit() {
        this.api.getClientes().subscribe(cs => this.clientes = cs ?? []);
    }

    onCalcInput() {
        if (this.form.filament_grams > 0 && this.form.print_time_minutes > 0) {
            this.calcular();
        }
    }

    calcular() {
        if (!this.form.print_time_minutes) return;
        this.calculating = true;
        this.api.calcularCosto({
            filament_grams: this.form.filament_grams,
            print_time_minutes: this.form.print_time_minutes,
        }).subscribe({
            next: bd => {
                this.breakdown = bd;
                if (!this.form.final_price) this.form.final_price = bd.suggested_price;
                this.calculating = false;
            },
            error: () => this.calculating = false
        });
    }

    save() {
        if (!this.breakdown) return;
        this.saving = true;
        this.saveError = '';
        const body = {
            ...this.form,
            client_id: this.form.client_id || null,
        };
        this.api.createVenta(body).subscribe({
            next: v => this.router.navigate(['/ventas', v.id]),
            error: e => { this.saveError = e.error?.error ?? 'Error al guardar'; this.saving = false; }
        });
    }
}
