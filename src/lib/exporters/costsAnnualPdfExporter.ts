import { PDFBuilder } from './pdfUtils';
import { formatCurrency } from '@/lib/formatters';

interface EmployeeAnnualCost {
  full_name: string;
  company_name: string;
  total_bruto: number;
  total_seguridad_social: number;
  total_bonus?: number;
  total_coste_empresa: number;
}

export async function exportCostsAnnualPDF(
  employees: EmployeeAnnualCost[],
  year: number,
  companyName?: string
) {
  const pdf = new PDFBuilder({
    orientation: 'landscape',
    format: 'a4',
    title: `Coste Anual Plantilla ${year}`,
    subject: 'Desglose Completo de Costes',
  });

  pdf.addHeader(
    `Coste Total de Plantilla ${year}`,
    companyName || 'Todas las Empresas'
  );

  // KPIs globales
  const totalBruto = employees.reduce((sum, e) => sum + e.total_bruto, 0);
  const totalSS = employees.reduce((sum, e) => sum + e.total_seguridad_social, 0);
  const totalCost = employees.reduce((sum, e) => sum + e.total_coste_empresa, 0);
  const avgCost = totalCost / (employees.length || 1);

  pdf.addSection('Resumen Anual');
  pdf.addKPI('Empleados', employees.length.toString(), '#3b82f6', 0);
  pdf.addKPI('Coste Total', formatCurrency(totalCost), '#ef4444', 50);
  pdf.addKPI('Coste Medio', formatCurrency(avgCost), '#8b5cf6', 100);

  pdf.addSpace(40);

  // Tabla de empleados (primeros 20)
  pdf.addSection('Detalle por Empleado (Top 20)');
  
  const tableData = employees
    .sort((a, b) => b.total_coste_empresa - a.total_coste_empresa)
    .slice(0, 20)
    .map(e => [
      e.full_name,
      e.company_name,
      formatCurrency(e.total_bruto),
      formatCurrency(e.total_seguridad_social),
      formatCurrency(e.total_bonus || 0),
      formatCurrency(e.total_coste_empresa),
    ]);

  pdf.addTable(
    ['Empleado', 'Empresa', 'Bruto Anual', 'Seg. Social', 'Bonus', 'Coste Total'],
    tableData,
    { fontSize: 8 }
  );

  // Gráfico de distribución por empresa
  pdf.addPage();
  pdf.addSection('Distribución de Costes por Empresa');
  await pdf.addChartFromElement('costs-by-company-chart');

  pdf.addFooter(1);

  const filename = `costes_plantilla_${year}_${companyName?.replace(/\s/g, '_') || 'grupo'}.pdf`;
  pdf.save(filename);
}
