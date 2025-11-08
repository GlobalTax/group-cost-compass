/**
 * Utilidades para generación de plantillas y contenido predefinido
 */

/**
 * Genera el contenido CSV de la plantilla de empleados
 */
export const generateEmployeeTemplate = (): string => {
  const headers = 'nombre,empresa,fecha_alta,dni,fecha_baja,fecha_antiguedad,traslado,notas';
  const rows = [
    'María García López,Navarro Legal y Tributario,01/01/2020,12345678A,,,false,',
    'Juan Pérez Martínez,Beglobal Worldwide,15/03/2021,87654321B,,,false,',
    'Ana Rodríguez Sánchez,GoLooper,10/06/2022,11223344C,,,false,',
    'Carlos Fernández Torres,SPV Corporate Advisor,01/09/2019,55667788D,,,false,Ejemplo con antigüedad',
    'Laura Martín Ruiz,Navarro Legal y Tributario,20/02/2023,99887766E,,,false,'
  ];
  
  return [headers, ...rows].join('\n');
};

/**
 * Genera el contenido CSV de la plantilla de costes
 */
export const generateCostsTemplate = (): string => {
  const headers = 'employee_id,periodo,bruto,coste_empresa,notas';
  const rows = [
    'emp-uuid-1,2025-01,3500.00,4200.00,',
    'emp-uuid-2,2025-01,2800.00,3360.00,',
    'emp-uuid-3,2025-01,4200.00,5040.00,Incluye bonus'
  ];
  
  return [headers, ...rows].join('\n');
};

/**
 * Genera el contenido CSV de la plantilla de ingresos
 */
export const generateRevenueTemplate = (): string => {
  const headers = 'fecha,cliente,concepto,importe,empresa,notas';
  const rows = [
    '2025-01-15,Cliente A,Consultoría Legal,5000.00,Navarro Legal y Tributario,',
    '2025-01-20,Cliente B,Auditoría,8000.00,Beglobal Worldwide,',
    '2025-01-25,Cliente C,Desarrollo Software,12000.00,GoLooper,'
  ];
  
  return [headers, ...rows].join('\n');
};

/**
 * Genera un CSV genérico a partir de datos estructurados
 */
export const generateCSV = (headers: string[], rows: (string | number)[][]): string => {
  const csvRows = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escapar comas y comillas en los valores
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ];
  
  return csvRows.join('\n');
};

/**
 * Genera un nombre de archivo con timestamp
 */
export const generateFilename = (prefix: string, extension: string = 'csv'): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}_${timestamp}.${extension}`;
};
