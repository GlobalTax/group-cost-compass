import type { EmployeeAnnualCost } from "@/hooks/useCostsOverview";
import { downloadCSV } from "@/lib/utils";
import { format } from "date-fns";

/**
 * Exporta el cuadro de mando de costes de plantilla a CSV
 * Incluye desglose completo: Salarios + SS + Bonus = Total
 */
export const exportCostsOverview = (
  data: EmployeeAnnualCost[],
  year: number,
  visibleColumns?: Set<string>
) => {
  const columnsToExport = visibleColumns || new Set([
    "full_name",
    "hire_date",
    "company",
    "department",
    "team",
    "salario_base_anual",
    "bruto_cobrado_anual",
    "coste_ss_anual",
    "bonus_pagado_anual",
    "coste_total_anual",
  ]);

  const headerMap: Record<string, string> = {
    full_name: "Nombre",
    hire_date: "Fecha de Alta",
    company: "Empresa",
    department: "Departamento",
    team: "Equipo",
    salario_base_anual: "Salario Anual Negociado",
    bruto_cobrado_anual: "Bruto Cobrado",
    coste_ss_anual: "Coste Seguridad Social",
    bonus_pagado_anual: "Bonus Pagado",
    coste_total_anual: "COSTE TOTAL",
  };

  const headers = Array.from(columnsToExport)
    .filter(col => headerMap[col])
    .map(col => headerMap[col]);

  const rows = data.map((employee) => {
    const row: string[] = [];
    
    if (columnsToExport.has("full_name")) row.push(employee.full_name);
    if (columnsToExport.has("hire_date")) {
      row.push(employee.hire_date 
        ? format(new Date(employee.hire_date), "dd/MM/yyyy") 
        : "");
    }
    if (columnsToExport.has("company")) row.push(employee.company);
    if (columnsToExport.has("department")) row.push(employee.department_name || "Sin departamento");
    if (columnsToExport.has("team")) row.push(employee.team_name || "Sin equipo");
    if (columnsToExport.has("salario_base_anual")) row.push((employee.salario_base_anual || 0).toFixed(2));
    if (columnsToExport.has("bruto_cobrado_anual")) row.push(employee.bruto_cobrado_anual.toFixed(2));
    if (columnsToExport.has("coste_ss_anual")) row.push(employee.coste_ss_anual.toFixed(2));
    if (columnsToExport.has("bonus_pagado_anual")) row.push(employee.bonus_pagado_anual.toFixed(2));
    if (columnsToExport.has("coste_total_anual")) row.push(employee.coste_total_anual.toFixed(2));
    
    return row;
  });

  // Calcular totales solo para columnas visibles
  const totalsRow: string[] = [];
  if (columnsToExport.has("full_name")) totalsRow.push("TOTAL");
  if (columnsToExport.has("hire_date")) totalsRow.push("");
  if (columnsToExport.has("company")) totalsRow.push("");
  if (columnsToExport.has("department")) totalsRow.push("");
  if (columnsToExport.has("team")) totalsRow.push("");
  if (columnsToExport.has("salario_base_anual")) {
    totalsRow.push(data.reduce((sum, e) => sum + (e.salario_base_anual || 0), 0).toFixed(2));
  }
  if (columnsToExport.has("bruto_cobrado_anual")) {
    totalsRow.push(data.reduce((sum, e) => sum + e.bruto_cobrado_anual, 0).toFixed(2));
  }
  if (columnsToExport.has("coste_ss_anual")) {
    totalsRow.push(data.reduce((sum, e) => sum + e.coste_ss_anual, 0).toFixed(2));
  }
  if (columnsToExport.has("bonus_pagado_anual")) {
    totalsRow.push(data.reduce((sum, e) => sum + e.bonus_pagado_anual, 0).toFixed(2));
  }
  if (columnsToExport.has("coste_total_anual")) {
    totalsRow.push(data.reduce((sum, e) => sum + e.coste_total_anual, 0).toFixed(2));
  }

  const csvContent = [headers, ...rows, totalsRow]
    .map((row) => row.join(";"))
    .join("\n");

  downloadCSV(csvContent, `coste_plantilla_${year}.csv`);
};
