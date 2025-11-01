import type { EmployeeAnnualCost } from "@/hooks/useCostsOverview";
import { downloadCSV } from "@/lib/utils";

/**
 * Exporta el cuadro de mando de costes de plantilla a CSV
 * Incluye desglose completo: Salarios + SS + Bonus = Total
 */
export const exportCostsOverview = (
  data: EmployeeAnnualCost[],
  year: number
) => {
  const headers = [
    "Nombre",
    "Empresa",
    "Departamento",
    "Equipo",
    "Salario Anual Negociado",
    "Bruto Cobrado",
    "Coste Seguridad Social",
    "Bonus Pagado",
    "COSTE TOTAL",
  ];

  const rows = data.map((employee) => [
    employee.full_name,
    employee.company,
    employee.department_name || "Sin departamento",
    employee.team_name || "Sin equipo",
    (employee.salario_base_anual || 0).toFixed(2),
    employee.bruto_cobrado_anual.toFixed(2),
    employee.coste_ss_anual.toFixed(2),
    employee.bonus_pagado_anual.toFixed(2),
    employee.coste_total_anual.toFixed(2),
  ]);

  // Calcular totales
  const totals = [
    "TOTAL",
    "",
    "",
    "",
    data.reduce((sum, e) => sum + (e.salario_base_anual || 0), 0).toFixed(2),
    data.reduce((sum, e) => sum + e.bruto_cobrado_anual, 0).toFixed(2),
    data.reduce((sum, e) => sum + e.coste_ss_anual, 0).toFixed(2),
    data.reduce((sum, e) => sum + e.bonus_pagado_anual, 0).toFixed(2),
    data.reduce((sum, e) => sum + e.coste_total_anual, 0).toFixed(2),
  ];

  // Construir CSV con BOM para UTF-8
  const csvContent = [headers, ...rows, totals]
    .map((row) => row.join(";"))
    .join("\n");

  downloadCSV(csvContent, `coste_plantilla_${year}.csv`);
};
