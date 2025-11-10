import * as XLSX from 'xlsx';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppRole } from '@/lib/auth';
import { EMPLOYEE_COST_COLUMNS, filterColumnsForRole, getExportStyleByRole } from './roleBasedExportConfig';

interface EmployeeAnnualCost {
  full_name: string;
  dni?: string;
  company_name: string;
  department_name?: string;
  team_name?: string;
  total_bruto: number;
  total_seguridad_social: number;
  total_bonus?: number;
  total_coste_empresa: number;
  salary_vs_previous_year?: number;
  [key: string]: any;
}

interface AdvancedExportOptions {
  userRole: AppRole;
  year: number;
  companyName?: string;
  includeCharts?: boolean;
  includeKPIs?: boolean;
}

export function exportCostsAdvancedExcel(
  employees: EmployeeAnnualCost[],
  options: AdvancedExportOptions
) {
  const wb = XLSX.utils.book_new();
  const style = getExportStyleByRole(options.userRole);

  // Sheet 1: Portada
  addCoverSheet(wb, options);

  // Sheet 2: Resumen Ejecutivo
  addKPIsSheet(wb, employees, options);

  // Sheet 3-N: Según rol
  if (style === 'detailed') {
    addDetailedSheet(wb, employees, options);
    addMonthlyBreakdownSheet(wb, employees, options);
  } else if (style === 'aggregated') {
    addAggregatedByCompanySheet(wb, employees, options);
    addAggregatedByDepartmentSheet(wb, employees, options);
  } else {
    addSummarySheet(wb, employees, options);
  }

  // Sheet final: Notas
  addNotesSheet(wb, options);

  // Guardar
  const filename = `costes_${options.year}_${options.userRole}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

function addCoverSheet(wb: XLSX.WorkBook, options: AdvancedExportOptions) {
  const coverData = [
    ['REPORTE DE COSTES DE PLANTILLA'],
    [],
    ['Generado por:', 'Control de Costes | Capittal'],
    ['Fecha:', format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })],
    ['Año Fiscal:', options.year.toString()],
    ['Empresa:', options.companyName || 'Todas'],
    ['Nivel de Acceso:', options.userRole.toUpperCase()],
    [],
    ['IMPORTANTE:'],
    ['Este documento contiene información confidencial.'],
    ['Distribución limitada según política de acceso a datos.'],
    [],
    ['Para más información, contactar con RRHH o Finanzas.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(coverData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  ];

  ws['!cols'] = [{ wch: 20 }, { wch: 40 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Portada');
}

function addKPIsSheet(wb: XLSX.WorkBook, employees: EmployeeAnnualCost[], options: AdvancedExportOptions) {
  const totalBruto = employees.reduce((sum, e) => sum + e.total_bruto, 0);
  const totalSS = employees.reduce((sum, e) => sum + e.total_seguridad_social, 0);
  const totalBonus = employees.reduce((sum, e) => sum + (e.total_bonus || 0), 0);
  const totalCost = employees.reduce((sum, e) => sum + e.total_coste_empresa, 0);
  const avgCost = totalCost / (employees.length || 1);

  const kpiData = [
    [`Resumen Ejecutivo - Año ${options.year}`],
    [],
    ['INDICADORES CLAVE'],
    ['Métrica', 'Valor'],
    ['Número de Empleados', employees.length],
    ['Coste Total Anual', totalCost],
    ['Coste Promedio por Empleado', avgCost],
    [],
    ['DESGLOSE DE COSTES'],
    ['Concepto', 'Importe', '% del Total'],
    ['Salarios Brutos', totalBruto, ((totalBruto / totalCost) * 100).toFixed(1) + '%'],
    ['Seguridad Social', totalSS, ((totalSS / totalCost) * 100).toFixed(1) + '%'],
    ['Bonus y Variables', totalBonus, ((totalBonus / totalCost) * 100).toFixed(1) + '%'],
    ['TOTAL', totalCost, '100%'],
  ];

  if (options.userRole === 'super_admin' || options.userRole === 'admin' || options.userRole === 'finance') {
    kpiData.push(
      [],
      ['RATIOS FINANCIEROS'],
      ['Ratio SS / Bruto', ((totalSS / totalBruto) * 100).toFixed(1) + '%'],
      ['Ratio Bonus / Bruto', ((totalBonus / totalBruto) * 100).toFixed(1) + '%'],
      ['Coste Empresa / Bruto', ((totalCost / totalBruto) * 100).toFixed(1) + '%'],
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(kpiData);

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = 4; R <= 6; R++) {
    const cellB = XLSX.utils.encode_cell({ r: R, c: 1 });
    if (ws[cellB] && typeof ws[cellB].v === 'number') {
      ws[cellB].z = '"€"#,##0.00';
    }
  }

  ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
}

function addDetailedSheet(wb: XLSX.WorkBook, employees: EmployeeAnnualCost[], options: AdvancedExportOptions) {
  const allowedColumns = filterColumnsForRole(EMPLOYEE_COST_COLUMNS, options.userRole);

  const headers = allowedColumns.map(col => col.label);
  const rows = employees.map(emp => 
    allowedColumns.map(col => {
      const value = emp[col.key as keyof EmployeeAnnualCost];
      if (typeof value === 'number' && col.key.includes('total')) {
        return value;
      }
      return value || '';
    })
  );

  const totalsRow = allowedColumns.map((col, idx) => {
    if (idx === 0) return 'TOTAL';
    if (col.key.includes('total_')) {
      return employees.reduce((sum, e) => sum + (Number(e[col.key as keyof EmployeeAnnualCost]) || 0), 0);
    }
    return '';
  });

  const sheetData = [
    [`Detalle de Empleados - Año ${options.year}`],
    [],
    headers,
    ...rows,
    [],
    totalsRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = 3; R <= range.e.r; R++) {
    for (let C = 0; C < allowedColumns.length; C++) {
      if (allowedColumns[C].key.includes('total_')) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cell] && typeof ws[cell].v === 'number') {
          ws[cell].z = '"€"#,##0.00';
        }
      }
    }
  }

  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }) };

  ws['!cols'] = allowedColumns.map(() => ({ wch: 18 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Detalle Empleados');
}

function addAggregatedByCompanySheet(wb: XLSX.WorkBook, employees: EmployeeAnnualCost[], options: AdvancedExportOptions) {
  const byCompany = employees.reduce((acc, emp) => {
    const company = emp.company_name || 'Sin Empresa';
    if (!acc[company]) {
      acc[company] = { count: 0, totalCost: 0, totalBruto: 0, totalSS: 0 };
    }
    acc[company].count++;
    acc[company].totalCost += emp.total_coste_empresa;
    acc[company].totalBruto += emp.total_bruto;
    acc[company].totalSS += emp.total_seguridad_social;
    return acc;
  }, {} as Record<string, any>);

  const sheetData = [
    ['Costes Agregados por Empresa'],
    [],
    ['Empresa', 'Empleados', 'Coste Total', 'Coste Medio', '% del Total'],
  ];

  const totalCost = Object.values(byCompany).reduce((sum: number, c: any) => sum + c.totalCost, 0);

  Object.entries(byCompany).forEach(([company, data]: [string, any]) => {
    sheetData.push([
      company,
      data.count,
      data.totalCost,
      data.totalCost / data.count,
      ((data.totalCost / totalCost) * 100).toFixed(1) + '%',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = 3; R <= range.e.r; R++) {
    for (let C = 2; C <= 3; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cell] && typeof ws[cell].v === 'number') {
        ws[cell].z = '"€"#,##0.00';
      }
    }
  }

  ws['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Por Empresa');
}

function addAggregatedByDepartmentSheet(wb: XLSX.WorkBook, employees: EmployeeAnnualCost[], options: AdvancedExportOptions) {
  const byDepartment = employees.reduce((acc, emp) => {
    const dept = emp.department_name || 'Sin Departamento';
    if (!acc[dept]) {
      acc[dept] = { count: 0, totalCost: 0 };
    }
    acc[dept].count++;
    acc[dept].totalCost += emp.total_coste_empresa;
    return acc;
  }, {} as Record<string, any>);

  const sheetData = [
    ['Costes Agregados por Departamento'],
    [],
    ['Departamento', 'Empleados', 'Coste Total', 'Coste Medio'],
  ];

  Object.entries(byDepartment).forEach(([dept, data]: [string, any]) => {
    sheetData.push([
      dept,
      data.count,
      data.totalCost,
      data.totalCost / data.count,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Por Departamento');
}

function addMonthlyBreakdownSheet(wb: XLSX.WorkBook, employees: EmployeeAnnualCost[], options: AdvancedExportOptions) {
  const sheetData = [
    ['Desglose Mensual (Disponible en próxima versión)'],
    [],
    ['Esta funcionalidad requiere datos mensuales detallados.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'Mensual');
}

function addSummarySheet(wb: XLSX.WorkBook, employees: EmployeeAnnualCost[], options: AdvancedExportOptions) {
  const sheetData = [
    [`Resumen de Plantilla - Año ${options.year}`],
    [],
    ['Empresa', 'Empleados', 'Coste Total'],
  ];

  const byCompany = employees.reduce((acc, emp) => {
    const company = emp.company_name || 'Sin Empresa';
    if (!acc[company]) {
      acc[company] = { count: 0, totalCost: 0 };
    }
    acc[company].count++;
    acc[company].totalCost += emp.total_coste_empresa;
    return acc;
  }, {} as Record<string, any>);

  Object.entries(byCompany).forEach(([company, data]: [string, any]) => {
    sheetData.push([company, data.count, data.totalCost]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
}

function addNotesSheet(wb: XLSX.WorkBook, options: AdvancedExportOptions) {
  const notesData = [
    ['NOTAS Y DEFINICIONES'],
    [],
    ['Definiciones de Conceptos:'],
    ['- Bruto Anual: Suma de salarios brutos mensuales (sin bonus)'],
    ['- Seguridad Social: Cotizaciones empresariales obligatorias'],
    ['- Bonus: Variable anual + success fees + extraordinarios'],
    ['- Coste Empresa: Bruto + SS + Bonus + otros costes'],
    [],
    ['Metodología de Cálculo:'],
    ['Los datos se obtienen de la plataforma A3Nom y son validados mensualmente.'],
    ['Los costes incluyen únicamente personal en plantilla activa.'],
    [],
    ['Confidencialidad:'],
    [`Este reporte está filtrado según el nivel de acceso: ${options.userRole.toUpperCase()}`],
    ['No redistribuir sin autorización de RRHH o Dirección.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(notesData);
  ws['!cols'] = [{ wch: 80 }];

  XLSX.utils.book_append_sheet(wb, ws, 'Notas');
}
