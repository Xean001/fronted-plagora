export interface LoginRequest { email: string; password: string; }
export interface TokenPair { access_token: string; refresh_token: string; }

export interface Client {
    id: string; name: string; phone: string; email: string; notes: string; created_at: string;
}

export interface CostConfig {
    id: string;
    filament_price_per_kg: number;
    electricity_kwh_price: number;
    printer_wattage: number;
    printer_price: number;
    amortizable_hours: number;
    spare_parts_total_cost: number;
    spare_parts_life_hours: number;
    margin_percent: number;
    updated_at: string;
}

export interface ExplanationStep { step: number; label: string; formula: string; result: number; }

export interface CostBreakdown {
    filament_grams: number;
    print_time_minutes: number;
    electricity_cost_per_hour: number;
    depreciation_per_hour: number;
    spare_parts_per_hour: number;
    base_cost_per_hour: number;
    min_hourly_rate: number;
    filament_cost: number;
    electricity_cost: number;
    depreciation_cost: number;
    spare_parts_cost: number;
    total_production_cost: number;
    margin_percent: number;
    suggested_price: number;
    explanation: ExplanationStep[];
}

export type SaleStatus = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';

export interface Sale {
    id: string;
    client_id: string | null;
    client?: { name: string; phone: string };
    user_id: string;
    description: string;
    material: string;
    color: string;
    filament_grams: number;
    print_time_minutes: number;
    filament_cost: number;
    electricity_cost: number;
    depreciation_cost: number;
    spare_parts_cost: number;
    total_production_cost: number;
    profit_margin_percent: number;
    suggested_price: number;
    final_price: number;
    profit: number;
    status: SaleStatus;
    payment_method: string;
    paid: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    total_sales: number;
    total_revenue: number;
    total_production_cost: number;
    total_profit: number;
    pending_sales: number;
    in_progress_sales: number;
    unpaid_sales: number;
    current_month_revenue: number;
    current_month_profit: number;
}
