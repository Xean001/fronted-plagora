import { Component, inject, OnInit, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Zap, Printer, Wrench, TrendingUp, CheckCircle } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { SolPipe } from '../../shared/pipes/sol.pipe';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SolPipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="page-header-tw">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>
          <p class="text-sm text-slate-500 mt-0.5">Parámetros de costo. Precios en S/ (Soles).</p>
        </div>
        <button (click)="save()" [disabled]="saving()" class="btn-primary-tw">
          <lucide-icon [img]="SaveIcon" [size]="16" />
          {{ saving() ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

      @if (success()) {
        <div class="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 animate-fade-in">
          <lucide-icon [img]="CheckCircleIcon" [size]="18" />
          <span class="text-sm font-medium">Configuración guardada correctamente</span>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: params -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Filamento -->
          <div class="card-tw">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <lucide-icon [img]="TrendingUpIcon" [size]="16" class="text-violet-600" />
              </div>
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100 text-sm">Filamento</p>
                <p class="text-xs text-slate-500">Precio por kilogramo</p>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">S/ por kg</label>
              <input type="number" [(ngModel)]="form.filament_price_per_kg" name="fp" min="0" step="0.01" class="input-tw" />
            </div>
          </div>

          <!-- Electricidad -->
          <div class="card-tw">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <lucide-icon [img]="ZapIcon" [size]="16" class="text-amber-500" />
              </div>
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100 text-sm">Electricidad</p>
                <p class="text-xs text-slate-500">Tarifa eléctrica y consumo</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">S/ por kWh</label>
                <input type="number" [(ngModel)]="form.electricity_kwh_price" name="ep" min="0" step="0.0001" class="input-tw" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Watts (W)</label>
                <input type="number" [(ngModel)]="form.printer_wattage" name="pw" min="0" step="1" class="input-tw" />
              </div>
            </div>
          </div>

          <!-- Impresora -->
          <div class="card-tw">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <lucide-icon [img]="PrinterIcon" [size]="16" class="text-indigo-600" />
              </div>
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100 text-sm">Impresora</p>
                <p class="text-xs text-slate-500">Precio y vida útil para depreciación</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Precio S/</label>
                <input type="number" [(ngModel)]="form.printer_price" name="pp" min="0" step="1" class="input-tw" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Horas de vida útil</label>
                <input type="number" [(ngModel)]="form.amortizable_hours" name="ah" min="1" step="100" class="input-tw" />
              </div>
            </div>
          </div>

          <!-- Repuestos -->
          <div class="card-tw">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <lucide-icon [img]="WrenchIcon" [size]="16" class="text-slate-500" />
              </div>
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100 text-sm">Repuestos</p>
                <p class="text-xs text-slate-500">Mantenimiento y piezas de desgaste</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Costo total S/</label>
                <input type="number" [(ngModel)]="form.spare_parts_total_cost" name="sc" min="0" step="1" class="input-tw" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Horas de vida útil</label>
                <input type="number" [(ngModel)]="form.spare_parts_life_hours" name="sl" min="1" step="100" class="input-tw" />
              </div>
            </div>
          </div>

          <!-- Margen -->
          <div class="card-tw">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <lucide-icon [img]="TrendingUpIcon" [size]="16" class="text-emerald-600" />
              </div>
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100 text-sm">Margen de error</p>
                <p class="text-xs text-slate-500">% extra por impresiones fallidas o defectuosas</p>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">%</label>
              <input type="number" [(ngModel)]="form.margin_percent" name="mp" min="0" max="1000" step="1" class="input-tw max-w-[160px]" />
            </div>
          </div>
        </div>

        <!-- Right: live preview -->
        <div class="space-y-4">
          <div class="card-tw sticky top-6">
            <h4 class="font-medium text-slate-900 dark:text-slate-100 mb-4 text-sm">📐 Costo por hora (en vivo)</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span class="text-xs text-slate-500 dark:text-slate-400">⚡ Electricidad/h</span>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ electricityPerHour() | sol:4 }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span class="text-xs text-slate-500 dark:text-slate-400">🖨️ Depreciación/h</span>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ depreciationPerHour() | sol:4 }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span class="text-xs text-slate-500 dark:text-slate-400">🔧 Repuestos/h</span>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ sparePartsPerHour() | sol:4 }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Base/hora</span>
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ baseCostPerHour() | sol }}</span>
              </div>
              <div class="flex justify-between items-center p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 mt-2">
                <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Mínimo/hora ({{ form.margin_percent }}% error)</span>
                <span class="text-sm font-bold text-indigo-700 dark:text-indigo-400">{{ minHourlyRate() | sol }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfigComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  saving = signal(false);
  success = signal(false);

  SaveIcon = Save;
  ZapIcon = Zap;
  PrinterIcon = Printer;
  WrenchIcon = Wrench;
  TrendingUpIcon = TrendingUp;
  CheckCircleIcon = CheckCircle;

  form = {
    filament_price_per_kg: 0, electricity_kwh_price: 0, printer_wattage: 0,
    printer_price: 0, amortizable_hours: 1, spare_parts_total_cost: 0,
    spare_parts_life_hours: 1, margin_percent: 30,
  };

  electricityPerHour = computed(() => (this.form.printer_wattage / 1000) * this.form.electricity_kwh_price);
  depreciationPerHour = computed(() => this.form.amortizable_hours > 0 ? this.form.printer_price / this.form.amortizable_hours : 0);
  sparePartsPerHour = computed(() => this.form.spare_parts_life_hours > 0 ? this.form.spare_parts_total_cost / this.form.spare_parts_life_hours : 0);
  baseCostPerHour = computed(() => this.electricityPerHour() + this.depreciationPerHour() + this.sparePartsPerHour());
  minHourlyRate = computed(() => this.baseCostPerHour() * (1 + this.form.margin_percent / 100));

  ngOnInit() {
    this.api.getCostConfig().subscribe({
      next: cfg => {
        this.form = { filament_price_per_kg: cfg.filament_price_per_kg, electricity_kwh_price: cfg.electricity_kwh_price, printer_wattage: cfg.printer_wattage, printer_price: cfg.printer_price, amortizable_hours: cfg.amortizable_hours, spare_parts_total_cost: cfg.spare_parts_total_cost, spare_parts_life_hours: cfg.spare_parts_life_hours, margin_percent: cfg.margin_percent };
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  save() {
    this.saving.set(true); this.success.set(false);
    this.api.updateCostConfig(this.form).subscribe({
      next: () => { this.saving.set(false); this.success.set(true); this.cdr.detectChanges(); setTimeout(() => { this.success.set(false); this.cdr.detectChanges(); }, 3000); },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }
}
