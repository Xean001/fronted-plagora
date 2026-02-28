import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, TrendingUp, Eye, EyeOff, Lock, Mail } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4">

      <!-- Card -->
      <div class="w-full max-w-sm animate-bounce-in">

        <!-- Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
            <lucide-icon [img]="TrendingUpIcon" [size]="22" class="text-white" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Plagora</h1>
          <p class="text-sm text-slate-500 mt-1">Gestión de impresión 3D</p>
        </div>

        <!-- Form card -->
        <div class="card-tw shadow-xl">
          <h2 class="text-lg font-semibold text-slate-900 mb-6">Iniciar sesión</h2>

          <form (ngSubmit)="login()" class="space-y-4">
            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-600 uppercase tracking-wide">Email</label>
              <div class="relative">
                <lucide-icon [img]="MailIcon" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  [(ngModel)]="email" name="email"
                  placeholder="admin@plagora.com"
                  class="input-tw pl-9"
                  required
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-slate-600 uppercase tracking-wide">Contraseña</label>
              <div class="relative">
                <lucide-icon [img]="LockIcon" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  [type]="showPw ? 'text' : 'password'"
                  [(ngModel)]="password" name="password"
                  placeholder="••••••••"
                  class="input-tw pl-9 pr-10"
                  required
                />
                <button type="button" (click)="showPw = !showPw"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <lucide-icon [img]="showPw ? EyeOffIcon : EyeIcon" [size]="14" />
                </button>
              </div>
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
                {{ error() }}
              </div>
            }

            <!-- Submit -->
            <button type="submit" [disabled]="loading()" class="btn-primary-tw w-full justify-center h-10 mt-2">
              @if (loading()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
              {{ loading() ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  showPw = false;
  error = signal('');
  loading = signal(false);

  TrendingUpIcon = TrendingUp;
  MailIcon = Mail;
  LockIcon = Lock;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;

  login() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: e => { this.error.set(e.error?.error ?? 'Credenciales incorrectas'); this.loading.set(false); this.cdr.detectChanges(); }
    });
  }
}
