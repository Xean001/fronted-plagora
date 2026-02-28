import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    CostBreakdown, CostConfig, Client, Sale, DashboardStats
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
    readonly BASE = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    // ─── Dashboard ───────────────────────────────────────────────────────
    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.BASE}/dashboard/stats`);
    }

    // ─── Ventas ──────────────────────────────────────────────────────────
    getVentas(params?: Record<string, string>): Observable<Sale[]> {
        let p = new HttpParams();
        if (params) Object.entries(params).forEach(([k, v]) => p = p.set(k, v));
        return this.http.get<Sale[]>(`${this.BASE}/ventas`, { params: p });
    }

    getVenta(id: string): Observable<Sale> {
        return this.http.get<Sale>(`${this.BASE}/ventas/${id}`);
    }

    calcularCosto(body: { filament_grams: number; print_time_minutes: number }): Observable<CostBreakdown> {
        return this.http.post<CostBreakdown>(`${this.BASE}/ventas/calcular`, body);
    }

    createVenta(body: object): Observable<Sale> {
        return this.http.post<Sale>(`${this.BASE}/ventas`, body);
    }

    updateVenta(id: string, body: object): Observable<Sale> {
        return this.http.put<Sale>(`${this.BASE}/ventas/${id}`, body);
    }

    deleteVenta(id: string): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/ventas/${id}`);
    }

    // ─── Clientes ────────────────────────────────────────────────────────
    getClientes(): Observable<Client[]> {
        return this.http.get<Client[]>(`${this.BASE}/clientes`);
    }

    createCliente(body: object): Observable<Client> {
        return this.http.post<Client>(`${this.BASE}/clientes`, body);
    }

    updateCliente(id: string, body: object): Observable<Client> {
        return this.http.put<Client>(`${this.BASE}/clientes/${id}`, body);
    }

    deleteCliente(id: string): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/clientes/${id}`);
    }

    // ─── Config costos ───────────────────────────────────────────────────
    getCostConfig(): Observable<CostConfig> {
        return this.http.get<CostConfig>(`${this.BASE}/config/costos`);
    }

    updateCostConfig(body: object): Observable<CostConfig> {
        return this.http.put<CostConfig>(`${this.BASE}/config/costos`, body);
    }

    // ─── Calculadora ─────────────────────────────────────────────────────
    getCalculations(): Observable<any[]> {
        return this.http.get<any[]>(`${this.BASE}/calculadora`);
    }

    saveCalculation(body: object): Observable<any> {
        return this.http.post<any>(`${this.BASE}/calculadora`, body);
    }

    deleteCalculation(id: string): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/calculadora/${id}`);
    }

    // ─── Inventario ───────────────────────────────────────────────────
    getInventory(params?: { search?: string; status?: string; sort?: string }): Observable<any[]> {
        let p = new HttpParams();
        if (params?.search) p = p.set('search', params.search);
        if (params?.status) p = p.set('status', params.status);
        if (params?.sort) p = p.set('sort', params.sort);
        return this.http.get<any[]>(`${this.BASE}/inventario`, { params: p });
    }

    addToInventory(body: object): Observable<any> {
        return this.http.post<any>(`${this.BASE}/inventario`, body);
    }

    updateInventory(id: string, body: object): Observable<any> {
        return this.http.put<any>(`${this.BASE}/inventario/${id}`, body);
    }

    deleteInventory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/inventario/${id}`);
    }
}
