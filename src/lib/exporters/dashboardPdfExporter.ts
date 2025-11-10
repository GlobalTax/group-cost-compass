import { PDFBuilder } from './pdfUtils';
import { formatCurrency } from '@/lib/formatters';

interface DashboardPDFData {
  kpis: {
    totalCost: number;
    activeEmployees: number;
    salaryIncrease: number;
    avgCostPerEmployee: number;
  };
  month: string;
  year: number;
  companyName?: string;
  topEmployees?: Array<{
    name: string;
    company: string;
    bruto: number;
    costeEmpresa: number;
  }>;
}

export async function exportDashboardPDF(data: DashboardPDFData) {
  const pdf = new PDFBuilder({
    orientation: 'portrait',
    format: 'a4',
    title: `Dashboard Ejecutivo - ${data.month}/${data.year}`,
    subject: 'Reporte Mensual de Costes y Plantilla',
  });

  // Header
  pdf.addHeader(
    'Dashboard Ejecutivo',
    `${data.companyName || 'Grupo Navarro'} | ${data.month}/${data.year}`
  );

  // KPIs en grid (2x2)
  pdf.addSection('Indicadores Clave');
  
  // Primera fila de KPIs
  pdf.addKPI('Coste Total Mes', formatCurrency(data.kpis.totalCost), '#3b82f6', 0);
  pdf.addKPI('Empleados Activos', data.kpis.activeEmployees.toString(), '#10b981', 50);
  
  pdf.addSpace(30);
  
  // Segunda fila de KPIs
  pdf.addKPI('Subida Salarial', `${data.kpis.salaryIncrease}%`, '#f59e0b', 0);
  pdf.addKPI('Coste Medio', formatCurrency(data.kpis.avgCostPerEmployee), '#8b5cf6', 50);
  
  pdf.addSpace(40);

  // Capturar gráfico de evolución mensual
  pdf.addSection('Evolución de Costes (últimos 12 meses)');
  await pdf.addChartFromElement('dashboard-cost-chart');
  
  pdf.addSpace(10);

  // Capturar heatmap
  pdf.addSection('Heatmap de Costes por Empresa');
  await pdf.addChartFromElement('dashboard-heatmap');

  // Nueva página para tabla de detalle
  if (data.topEmployees && data.topEmployees.length > 0) {
    pdf.addPage();
    pdf.addSection('Top Empleados por Coste');
    
    const tableData = data.topEmployees.slice(0, 10).map(emp => [
      emp.name,
      emp.company,
      formatCurrency(emp.bruto),
      formatCurrency(emp.costeEmpresa),
    ]);
    
    pdf.addTable(
      ['Empleado', 'Empresa', 'Bruto', 'Coste Empresa'],
      tableData
    );
  }

  // Footer
  pdf.addFooter(1);

  // Guardar
  const filename = `dashboard_${data.companyName?.replace(/\s/g, '_') || 'grupo'}_${data.month}-${data.year}.pdf`;
  pdf.save(filename);
}
