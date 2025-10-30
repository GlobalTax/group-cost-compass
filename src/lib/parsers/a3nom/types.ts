/**
 * Tipos compartidos para el parser A3Nom
 */

export interface ParsedA3NomCost {
  employee_code: string;
  employee_name: string;
  employee_nif: string;
  company_name: string;
  company_nif: string;
  bruto: number;
  coste_empresa: number;
  sal_neto?: number;
  total_tc1?: number;
  irpf_dinero?: number;
  irpf_especie?: number;
  ss_trabajador?: number;
  ss_empresa?: number;
  anticipos?: number;
  embargos?: number;
  dto_preaviso?: number;
  dtos_varios?: number;
  prestamos?: number;
  dto_especial?: number;
  indemnizacion?: number;
  enf_acc?: number;
  bonificacion?: number;
}

export interface CompanySummary {
  name: string;
  nif: string;
  employees: number;
  totalBruto: number;
  totalCoste: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface A3NomParseResult {
  data: ParsedA3NomCost[];
  errors: ValidationError[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    companiesDetected: number;
    totalBruto: number;
    totalCoste: number;
    byCompany: CompanySummary[];
  };
}

export interface CompanyState {
  name: string;
  nif: string;
}
