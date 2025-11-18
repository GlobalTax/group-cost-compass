import type { Database } from '@/integrations/supabase/types';

// Base types
export type Company = Database['public']['Tables']['companies']['Row'];
export type Employee = Database['public']['Tables']['hr_employees']['Row'];
export type EmployeeCost = Database['public']['Tables']['hr_employee_costs']['Row'];
export type Transfer = Database['public']['Tables']['hr_transfers']['Row'];
export type RoleConfiguration = Database['public']['Tables']['role_configurations']['Row'];
export type SystemSetting = Database['public']['Tables']['system_settings']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];
export type BonusPayment = Database['public']['Tables']['bonus_payments']['Row'];
export type Deal = Database['public']['Tables']['deals']['Row'];

// Enriched types (con relaciones)
export interface EmployeeWithCompany extends Employee {
  companies: Company | null;
}

export interface EmployeeWithDetails extends Employee {
  companies: Company | null;
  hr_employee_costs: EmployeeCost[];
  hr_transfers: Transfer[];
}

export interface CostWithRelations extends EmployeeCost {
  hr_employees: {
    id: string;
    full_name: string;
    company_id: string;
    team_id: string | null;
    companies: {
      id: string;
      name: string;
    } | null;
    teams: {
      id: string;
      name: string;
    } | null;
  } | null;
}

// Tipos enriquecidos que NO heredan de base (por conflictos de nombres)
export interface TransferWithRelations {
  id: string;
  employee_id: string;
  from_company_id: string;
  to_company_id: string;
  transfer_date: string;
  reason: string | null;
  days_between: number | null;
  created_at: string;
  updated_at: string;
  org_id: string;
  employee: {
    id: string;
    full_name: string;
  } | null;
  from_company: Company | null;
  to_company: Company | null;
}

// Dashboard types
export interface CompanyDashboardData {
  id: string;
  name: string;
  bruto: number;
  coste: number;
  employees: number;
  percentOfTotal: number;
}

export interface HeatmapDataPoint {
  month: string;
  avgCostPerEmployee: number;
  employees: number;
}

// Tipos para transformaciones
export interface MonthlyCostSummary {
  period: string; // YYYY-MM
  bruto: number;
  coste: number;
  employees: number;
}

export interface YearOverYearComparison {
  currentYear: number;
  previousYear: number;
  brutoChange: number;
  costeChange: number;
  brutoChangePercent: number;
  costeChangePercent: number;
}
