import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'ventas',
                loadComponent: () => import('./features/ventas/ventas-list/ventas-list.component').then(m => m.VentasListComponent)
            },
            {
                path: 'ventas/nueva',
                loadComponent: () => import('./features/ventas/venta-form/venta-form.component').then(m => m.VentaFormComponent)
            },
            {
                path: 'ventas/:id',
                loadComponent: () => import('./features/ventas/venta-detail/venta-detail.component').then(m => m.VentaDetailComponent)
            },
            {
                path: 'clientes',
                loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent)
            },
            {
                path: 'config',
                loadComponent: () => import('./features/config/config.component').then(m => m.ConfigComponent)
            },
            {
                path: 'calculadora',
                loadComponent: () => import('./features/calculadora/calculadora.component').then(m => m.CalculadoraComponent)
            },
            {
                path: 'inventario',
                loadComponent: () => import('./features/inventario/inventario.component').then(m => m.InventarioComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
