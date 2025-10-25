interface EmployeeDetail {
  id: string;
  name: string;
  company: string;
  bruto: number;
  costeEmpresa: number;
  variation: number;
}

interface ExportFilters {
  company?: string;
  year: number;
  month: number;
}

export const exportCostsToCSV = (
  data: EmployeeDetail[],
  filters: ExportFilters
) => {
  // Preparar encabezados
  const headers = ['Empleado', 'Empresa', 'Bruto', 'Coste Empresa', 'Variación %'];
  
  // Preparar filas de datos
  const rows = data.map(employee => [
    employee.name,
    employee.company,
    employee.bruto.toFixed(2),
    employee.costeEmpresa.toFixed(2),
    employee.variation.toFixed(2) + '%'
  ]);
  
  // Combinar encabezados y filas
  const csvContent = [headers, ...rows]
    .map(row => row.join(';'))
    .join('\n');
  
  // Agregar BOM para UTF-8 (importante para Excel español)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  
  // Crear nombre de archivo descriptivo
  const monthName = new Date(filters.year, filters.month - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const filename = `costes_${monthName.replace(' ', '_')}.csv`;
  
  // Crear link de descarga y hacer clic automático
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
