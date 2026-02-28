import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, X } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models/models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="page-header-tw">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ clientes().length }} clientes registrados</p>
        </div>
        <button (click)="openForm()" class="btn-primary-tw">
          <lucide-icon [img]="PlusIcon" [size]="16" /> Nuevo cliente
        </button>
      </div>

      <!-- Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
             (click)="closeForm()">
          <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-bounce-in"
               (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-slate-900 dark:text-white">{{ editing() ? 'Editar' : 'Nuevo' }} cliente</h3>
              <button (click)="closeForm()" class="btn-ghost-tw w-8 h-8 p-0 justify-center">
                <lucide-icon [img]="XIcon" [size]="16" />
              </button>
            </div>
            <form (ngSubmit)="save()" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Nombre *</label>
                <input [(ngModel)]="form.name" name="name" class="input-tw" placeholder="Nombre completo" required />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Teléfono</label>
                  <input [(ngModel)]="form.phone" name="phone" class="input-tw" placeholder="+51 999..." />
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
                  <input [(ngModel)]="form.email" name="email" type="email" class="input-tw" placeholder="email@..." />
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-slate-500 uppercase tracking-wide">Notas</label>
                <textarea [(ngModel)]="form.notes" name="notes" class="input-tw min-h-[80px] resize-none" placeholder="Detalles adicionales..."></textarea>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="button" (click)="closeForm()" class="btn-secondary-tw flex-1 justify-center">Cancelar</button>
                <button type="submit" [disabled]="saving()" class="btn-primary-tw flex-1 justify-center">
                  {{ saving() ? 'Guardando...' : (editing() ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Table -->
      @if (loading()) {
        <div class="card-tw flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      } @else if (clientes().length === 0) {
        <div class="card-tw text-center py-20">
          <div class="text-5xl mb-4">👥</div>
          <h3 class="font-semibold text-slate-900">Sin clientes aún</h3>
          <p class="text-sm text-slate-500 mt-1">Agrega tu primer cliente</p>
        </div>
      } @else {
        <div class="card-tw overflow-hidden p-0">
          <table class="table-tw">
            <thead><tr>
              <th>Nombre</th><th>Teléfono</th><th>Email</th><th>Notas</th><th class="text-right">Acciones</th>
            </tr></thead>
            <tbody>
              @for (c of clientes(); track c.id) {
                <tr>
                  <td><p class="font-medium text-slate-900 dark:text-white">{{ c.name }}</p></td>
                  <td class="text-slate-600">{{ c.phone || '—' }}</td>
                  <td class="text-slate-600">{{ c.email || '—' }}</td>
                  <td class="text-slate-400 text-xs max-w-[200px] truncate">{{ c.notes || '—' }}</td>
                  <td>
                    <div class="flex justify-end gap-2">
                      <button (click)="edit(c)" class="btn-ghost-tw w-8 h-8 p-0 justify-center">
                        <lucide-icon [img]="PencilIcon" [size]="14" />
                      </button>
                      <button (click)="delete(c)" class="btn-ghost-tw w-8 h-8 p-0 justify-center text-red-400 hover:text-red-600 hover:bg-red-50">
                        <lucide-icon [img]="TrashIcon" [size]="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ClientesComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  clientes = signal<Client[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editing = signal<Client | null>(null);
  saving = signal(false);
  form = { name: '', phone: '', email: '', notes: '' };

  PlusIcon = Plus;
  PencilIcon = Pencil;
  TrashIcon = Trash2;
  XIcon = X;

  ngOnInit() { this.load(); }

  load() {
    this.api.getClientes().subscribe({
      next: cs => { this.clientes.set(cs ?? []); this.loading.set(false); this.cdr.detectChanges(); },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  openForm() { this.editing.set(null); this.form = { name: '', phone: '', email: '', notes: '' }; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editing.set(null); }
  edit(c: Client) { this.editing.set(c); this.form = { name: c.name, phone: c.phone, email: c.email, notes: c.notes }; this.showForm.set(true); }

  save() {
    this.saving.set(true);
    const obs = this.editing() ? this.api.updateCliente(this.editing()!.id, this.form) : this.api.createCliente(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.load(); },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }

  delete(c: Client) {
    if (!confirm(`¿Eliminar a ${c.name}?`)) return;
    this.api.deleteCliente(c.id).subscribe(() => this.load());
  }
}
