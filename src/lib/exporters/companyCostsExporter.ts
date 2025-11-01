import type { CompanyCostsSummary } from "@/hooks/useCompanyCostsComparison";
import { downloadCSV } from "@/lib/utils";

/**
 * Exporta la tabla de costes por empresa a CSV
 */
export const exportCompanyCostsToCSV = (
  data: CompanyCostsSummary[],
  year: number,
  month?: number
) => {
  const periodLabel = month ? `${month}/${year}` : `Acumulado ${year}`;
  
  const headers = [
    "Empresa",
    "Nº Empleados Actual",
    "Nº Empleados Anterior",
    "Coste Mensual (€)",
    `Acumulado ${year} (€)`,
    `Acumulado ${year - 1} (€)`,
    "Variación %",
    "Variación €",
  ].join(";");

  const rows = data.map((company) => [
    company.company_name,
    company.num_employees_current,
    company.num_employees_previous,
    company.coste_mensual_actual.toFixed(2),
    company.coste_acumulado_ytd.toFixed(2),
    company.coste_acumulado_year_anterior.toFixed(2),
    company.variacion_percent.toFixed(2),
    company.variacion_euros.toFixed(2),
  ].join(";"));

  // Calcular totales
  const totals = {
    num_employees_current: data.reduce((sum, c) => sum + c.num_employees_current, 0),
    num_employees_previous: data.reduce((sum, c) => sum + c.num_employees_previous, 0),
    coste_mensual: data.reduce((sum, c) => sum + c.coste_mensual_actual, 0),
    coste_acumulado_ytd: data.reduce((sum, c) => sum + c.coste_acumulado_ytd, 0),
    coste_acumulado_anterior: data.reduce((sum, c) => sum + c.coste_acumulado_year_anterior, 0),
    variacion_euros: data.reduce((sum, c) => sum + c.variacion_euros, 0),
  };

  const totalRow = [
    "TOTAL GRUPO",
    totals.num_employees_current,
    totals.num_employees_previous,
    totals.coste_mensual.toFixed(2),
    totals.coste_acumulado_ytd.toFixed(2),
    totals.coste_acumulado_anterior.toFixed(2),
    "-",
    totals.variacion_euros.toFixed(2),
  ].join(";");

  const content = [headers, ...rows, totalRow].join("\n");
  const filename = `costes_empresas_${periodLabel.replace("/", "_")}.csv`;

  downloadCSV(content, filename);
};
