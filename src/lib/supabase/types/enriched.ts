import type { Database } from '@/integrations/supabase/types';

// Base types
export type Company = Database['public']['Tables']['companies']['Row'];
export type Employee = Database['public']['Tables']['hr_employees']['Row'];
export type EmployeeCost = Database['public']['Tables']['hr_employee_costs']['Row'];
export type Transfer = Database['public']['Tables']['hr_transfers']['Row'];

// Enriched types (con relaciones)
export interface EmployeeWithCompany extends Employee {
  companies: Company | null;
}

export interface CostWithRelations extends EmployeeCost {
  hr_employees: {
    id: string;
    full_name: string;
    company_id: string;
    companies: {
      id: string;
      name: string;
    } | null;
  } | null;
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
