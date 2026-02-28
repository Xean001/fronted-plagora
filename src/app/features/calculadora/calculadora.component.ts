import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calculator, Save, Trash2, Clock, Weight, Package, TrendingUp, DollarSign, Tag } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { SolPipe } from '../../shared/pipes/sol.pipe';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SolPipe],
  template: `
    <div class="space-y-6">
      <div class="page-header-tw">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Calculadora</h1>
          <p class="text-sm text-slate-500 mt-0.5">Calcula el precio de tu pieza 3D al instante</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- LEFT: Inputs -->
        <div class="space-y-4">
          <div class="card-tw">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <lucide-icon [img]="PackageIcon" [size]="16" class="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100 text-sm">Pieza</p>
                <p class="text-xs text-slate-500">Datos de impresión</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</label>
                <input type="text" [(ngModel)]="form.piece_name" placeholder="ej: Soporte LED" class="input-tw" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <lucide-icon [img]="ClockIcon" [size]="12" class="inline mr-1" />Horas
                  </label>
                  <input type="number" [(ngModel)]="form.print_hours" min="0" step="1" class="input-tw" />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Minutos extra</label>
                  <input type="number" [(ngModel)]="form.print_minutes_extra" min="0" max="59" step="1" class="input-tw" />
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <lucide-icon [img]="WeightIcon" [size]="12" class="inline mr-1" />Gramos de filamento
                </label>
                <input type="number" [(ngModel)]="form.filament_grams" min="0" step="1" class="input-tw" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <lucide-icon [img]="PackageIcon" [size]="12" class="inline mr-1" />Insumos S/
                </label>
                <input type="number" [(ngModel)]="form.supplies_cost" min="0" step="0.01" class="input-tw" />
              </div>
            </div>
          </div>

          <div class="card-tw">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <lucide-icon [img]="TrendingUpIcon" [size]="16" class="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100 text-sm">Ganancia</p>
                <p class="text-xs text-slate-500">Multiplicador sobre costo base</p>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Multiplicador (× costo)</label>
              <input type="number" [(ngModel)]="form.multiplier" min="1" step="0.5" class="input-tw max-w-[180px]" />
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="text-xs text-slate-500 dark:text-slate-400 self-center font-medium">Referencia:</span>
              @for (ref of multiplierRefs; track ref.label) {
                <button (click)="form.multiplier = ref.value" class="px-2.5 py-1 rounded-lg text-xs font-medium
                  bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                  hover:bg-orange-100 dark:hover:bg-orange-500/20 hover:text-orange-700 dark:hover:text-orange-400
                  transition-colors duration-150">
                  {{ ref.label }} ×{{ ref.value }}
                </button>
              }
            </div>
          </div>

          <button (click)="calcular()" class="w-full btn-primary-tw justify-center py-3 text-base">
            <lucide-icon [img]="CalculatorIcon" [size]="18" />
            Calcular
          </button>
        </div>

        <!-- RIGHT: Results -->
        <div class="space-y-4">
          @if (result()) {
            <div class="card-tw">
              <h4 class="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm flex items-center gap-2">
                <lucide-icon [img]="DollarIcon" [size]="15" class="text-orange-500" />
                Resultado
              </h4>

              <div class="space-y-2.5">
                <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                  <span class="text-xs text-slate-500 dark:text-slate-400">💧 Material (filamento)</span>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ result()!.material_cost | sol:2 }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                  <span class="text-xs text-slate-500 dark:text-slate-400">⚡ Electricidad</span>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ result()!.electricity_cost | sol:2 }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                  <span class="text-xs text-slate-500 dark:text-slate-400">🖨️ Desgaste máquina</span>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ result()!.machine_wear | sol:2 }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Subtotal producción</span>
                  <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ result()!.subtotal_production | sol }}</span>
                </div>

                <!-- Precio sugerido -->
                <div class="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Total sugerido (×{{ form.multiplier }})</span>
                  <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ result()!.total_with_supplies | sol }}</span>
                </div>

                <!-- PRECIO FINAL EDITABLE -->
                <div class="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-200 dark:border-orange-500/30">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-bold text-orange-800 dark:text-orange-400">🏷️ PRECIO FINAL A COBRAR</span>
                    @if (finalMarginPercent() !== null) {
                      <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                        [class]="finalMarginPercent()! >= 0
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'">
                        {{ finalMarginPercent()! >= 0 ? '+' : '' }}{{ finalMarginPercent()! | number:'1.0-0' }}% margen
                      </span>
                    }
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-lg font-black text-orange-700 dark:text-orange-400 flex-shrink-0">S/</span>
                    <input
                      type="number"
                      [(ngModel)]="finalPrice"
                      (ngModelChange)="onFinalPriceChange()"
                      min="0" step="0.5"
                      class="flex-1 text-2xl font-black text-orange-700 dark:text-orange-400
                             bg-transparent border-b-2 border-orange-300 dark:border-orange-500/50
                             focus:border-orange-500 dark:focus:border-orange-400
                             focus:outline-none pb-1 min-w-0"
                    />
                  </div>
                  @if (finalPrice > 0 && result()!) {
                    <p class="text-xs mt-2"
                      [class]="finalPrice >= result()!.subtotal_production
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'">
                      {{ finalPrice >= result()!.subtotal_production ? '✅ Ganancia:' : '⚠️ Pérdida:' }}
                      <strong>{{ (finalPrice - result()!.subtotal_production) | sol }}</strong>
                    </p>
                  }
                </div>
              </div>

              <!-- Guardar al inventario -->
              <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button (click)="guardarInventario()" [disabled]="saving()"
                  class="w-full btn-primary-tw justify-center">
                  <lucide-icon [img]="SaveIcon" [size]="14" />
                  {{ saving() ? 'Guardando...' : 'Guardar en Inventario' }}
                </button>
                @if (savedMsg()) {
                  <p class="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-2 font-medium">✅ {{ savedMsg() }}</p>
                }
              </div>
            </div>
          } @else {
            <div class="card-tw flex flex-col items-center justify-center py-16 text-center">
              <div class="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                <lucide-icon [img]="CalculatorIcon" [size]="28" class="text-orange-400" />
              </div>
              <p class="text-slate-500 dark:text-slate-400 text-sm">Ingresa los datos y presiona</p>
              <p class="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-1">«Calcular» para ver el resultado</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class CalculadoraComponent {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  CalculatorIcon = Calculator;
  SaveIcon = Save;
  TrashIcon = Trash2;
  ClockIcon = Clock;
  WeightIcon = Weight;
  PackageIcon = Package;
  TrendingUpIcon = TrendingUp;
  DollarIcon = DollarSign;
  TagIcon = Tag;

  form = {
    piece_name: '',
    print_hours: 0,
    print_minutes_extra: 0,
    filament_grams: 0,
    supplies_cost: 0,
    multiplier: 3,
  };

  finalPrice = 0;
  saving = signal(false);
  savedMsg = signal<string | null>(null);
  result = signal<any | null>(null);

  multiplierRefs = [
    { label: 'Minorista', value: 4 },
    { label: 'Mayorista', value: 3 },
    { label: 'Llaveros', value: 5 },
    { label: 'Costo+30%', value: 1.3 },
  ];

  finalMarginPercent() {
    const r = this.result();
    if (!r || r.subtotal_production === 0 || this.finalPrice === 0) return null;
    return Math.round((this.finalPrice / r.subtotal_production - 1) * 100);
  }

  onFinalPriceChange() { this.cdr.detectChanges(); }

  calcular() {
    const totalMinutes = (this.form.print_hours * 60) + this.form.print_minutes_extra;
    this.api.calcularCosto({
      filament_grams: this.form.filament_grams,
      print_time_minutes: Math.max(1, Math.round(totalMinutes)),
    }).subscribe({
      next: (breakdown) => {
        const subtotal = breakdown.total_production_cost;
        const suggested = subtotal * this.form.multiplier;
        const total_with_supplies = suggested + this.form.supplies_cost;

        this.result.set({
          material_cost: breakdown.filament_cost,
          electricity_cost: breakdown.electricity_cost,
          machine_wear: breakdown.depreciation_cost + breakdown.spare_parts_cost,
          subtotal_production: subtotal,
          suggested_price: suggested,
          total_with_supplies,
        });
        // Set default final price to suggested
        this.finalPrice = Math.round(total_with_supplies * 10) / 10;
        this.savedMsg.set(null);
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); }
    });
  }

  guardarInventario() {
    const r = this.result();
    if (!r) return;
    this.saving.set(true);

    const body = {
      piece_name: this.form.piece_name || 'Sin nombre',
      production_cost: r.subtotal_production,
      suggested_price: r.total_with_supplies,
      supplies_cost: this.form.supplies_cost,
      sale_price: this.finalPrice,
      notes: '',
    };

    this.api.addToInventory(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.savedMsg.set('¡Guardado en inventario!');
        this.cdr.detectChanges();
        setTimeout(() => { this.savedMsg.set(null); this.cdr.detectChanges(); }, 3000);
      },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }
}
