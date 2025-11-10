import type { AppRole } from '@/lib/auth';

export interface ExportColumn {
  key: string;
  label: string;
  sensitive: boolean;
  roles: AppRole[];
}

export const EMPLOYEE_COST_COLUMNS: ExportColumn[] = [
  { key: 'full_name', label: 'Empleado', sensitive: false, roles: ['super_admin', 'admin', 'manager', 'finance', 'senior'] },
  { key: 'dni', label: 'DNI', sensitive: true, roles: ['super_admin', 'admin'] },
  { key: 'company_name', label: 'Empresa', sensitive: false, roles: ['super_admin', 'admin', 'manager', 'finance', 'senior'] },
  { key: 'department_name', label: 'Departamento', sensitive: false, roles: ['super_admin', 'admin', 'manager', 'finance', 'senior'] },
  { key: 'team_name', label: 'Equipo', sensitive: false, roles: ['super_admin', 'admin', 'manager', 'senior'] },
  { key: 'total_bruto', label: 'Bruto Anual', sensitive: true, roles: ['super_admin', 'admin', 'finance'] },
  { key: 'total_seguridad_social', label: 'Seguridad Social', sensitive: true, roles: ['super_admin', 'admin', 'finance'] },
  { key: 'total_bonus', label: 'Bonus', sensitive: true, roles: ['super_admin', 'admin'] },
  { key: 'total_coste_empresa', label: 'Coste Total', sensitive: true, roles: ['super_admin', 'admin', 'finance'] },
  { key: 'salary_vs_previous_year', label: '% vs Año Anterior', sensitive: false, roles: ['super_admin', 'admin', 'manager', 'finance'] },
];

export function filterColumnsForRole(columns: ExportColumn[], userRole: AppRole): ExportColumn[] {
  return columns.filter(col => col.roles.includes(userRole));
}

export function getExportStyleByRole(userRole: AppRole): 'detailed' | 'summary' | 'aggregated' {
  switch (userRole) {
    case 'super_admin':
    case 'admin':
      return 'detailed';
    case 'manager':
    case 'senior':
      return 'summary';
    case 'finance':
      return 'aggregated';
    default:
      return 'summary';
  }
}
