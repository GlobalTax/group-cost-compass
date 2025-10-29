/**
 * Parser para el histórico de empleados desde Excel
 * Normaliza, valida y agrupa datos de contratos históricos
 */

import Papa from 'papaparse';

export interface HistoryRow {
  nombre: string;
  empresa: string;
  dni: string;
  fechaAlta: string;
  fechaBaja: string;
  antiguedad: string;
  ingresosAnuales: string;
  tipoContrato: string;
}

export interface ParsedEmployee {
  full_name: string;
  dni: string;
  company_id: string;
  company_name: string;
  hire_date: string;
  termination_date: string | null;
  seniority_date: string | null;
  contract_type: string;
  annual_income: number;
  monthly_bruto: number;
  monthly_coste: number;
  rowNumber: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface EmployeeGroup {
  dni: string;
  full_name: string;
  contracts: ParsedEmployee[];
  hasMultipleCompanies: boolean;
  hasMultipleContractsInSameCompany: boolean;
}

export interface ParsedHistory {
  employees: ParsedEmployee[];
  groups: EmployeeGroup[];
  errors: ValidationError[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    uniqueEmployees: number;
    potentialTransfers: number;
  };
}

// Mapeo de empresas
const COMPANY_MAP: Record<string, string> = {
  'SPV Corporate Advisor, SL': 'd24b302c-dae7-4810-90c9-880a6da5ba17',
  'Navarro Legal y Tributario, SLP': '1ae4a6a4-94cc-4074-9663-1026b91daf0f',
  'Beglobal Worldwide, S.L.': '24d05806-971e-4287-b2bb-ad5617b3f824',
  'Beglobal Worldwide, SL': '24d05806-971e-4287-b2bb-ad5617b3f824',
  'GoLooper, S.L.': 'cb760402-f84d-43b0-9256-8fa79b9a9ea5',
  'GoLooper, SL': 'cb760402-f84d-43b0-9256-8fa79b9a9ea5',
  'Navarro Empresarial, S.L.': '35ccb77c-90df-446e-a27a-d55891a6fd0a',
  'Navarro Empresarial, SL': '35ccb77c-90df-446e-a27a-d55891a6fd0a',
};

/**
 * Normaliza cabeceras del Excel para que sean case-insensitive
 * Mapea: "Nombre" | "NOMBRE" | "nombre" -> "nombre"
 *        "Fecha Alta" | "fecha alta" -> "fechaAlta"
 *        "DNI / NIE" | "dni nie" -> "dni"
 */
function normalizeHeader(header: string): string {
  const normalized = header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/\s+/g, '')              // quitar espacios
    .replace(/[\/\-()]/g, '');        // quitar /, -, ()
  
  // Mapeo explícito de cabeceras conocidas
  const headerMap: Record<string, string> = {
    'nombre': 'nombre',
    'empresa': 'empresa',
    'dninie': 'dni',
    'fechaalta': 'fechaAlta',
    'fechabaja': 'fechaBaja',
    'antiguedad': 'antiguedad',
    'ingresosanuales': 'ingresosAnuales',
    'ingresosanuales€': 'ingresosAnuales',
    'tipocontrato': 'tipoContrato',
    'tipocontratoactualizado': 'tipoContrato',
  };
  
  return headerMap[normalized] || header; // Si no está mapeado, devolver original
}

/**
 * Normaliza nombre: "Apellido, Nombre" -> "Nombre Apellido"
 */
function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim());
    return `${parts[1]} ${parts[0]}`;
  }
  return trimmed;
}

/**
 * Normaliza DNI/NIE eliminando espacios y guiones
 */
function normalizeDNI(dni: string): string {
  return dni.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Convierte fecha DD/MM/YYYY a YYYY-MM-DD
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr === '—' || dateStr.trim() === '') {
    return null;
  }
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Parsea ingresos anuales con múltiples formatos:
 * - "28.349,96 €" (español con símbolo)
 * - "28.349,96" (español sin símbolo)
 * - "28349.96" (inglés)
 * - "28,349.96" (inglés con separador miles)
 */
function parseIncome(incomeStr: string): number {
  if (!incomeStr || incomeStr === '—' || incomeStr.trim() === '') {
    return 0;
  }
  
  // Eliminar símbolo €, espacios, y otros caracteres no numéricos excepto . y ,
  let clean = incomeStr.replace(/[€\s]/g, '');
  
  // Detectar formato: si tiene punto antes que coma, es formato español (28.349,96)
  // Si tiene coma antes que punto, es formato inglés (28,349.96)
  const lastDot = clean.lastIndexOf('.');
  const lastComma = clean.lastIndexOf(',');
  
  if (lastComma > lastDot) {
    // Formato español: . = miles, , = decimales
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else {
    // Formato inglés o sin separadores: , = miles, . = decimales
    clean = clean.replace(/,/g, '');
  }
  
  return parseFloat(clean) || 0;
}

/**
 * Valida una fila del Excel (ahora con cabeceras normalizadas)
 */
function validateRow(row: any, rowNumber: number): { employee: ParsedEmployee | null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  // Detectar fila completamente vacía
  const allFieldsEmpty = Object.values(row).every(v => !v || String(v).trim() === '');
  if (allFieldsEmpty) {
    return { employee: null, errors: [] }; // Ignorar silenciosamente
  }
  
  // Campos requeridos (ahora usando nombres normalizados)
  if (!row.nombre || row.nombre.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'nombre',
      message: 'Nombre es requerido',
      severity: 'error',
    });
  }
  
  if (!row.dni || row.dni.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'dni',
      message: 'DNI/NIE es requerido',
      severity: 'error',
    });
  }
  
  if (!row.empresa || row.empresa.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'empresa',
      message: 'Empresa es requerida',
      severity: 'error',
    });
  }
  
  // Validar empresa existe en catálogo
  const companyId = COMPANY_MAP[row.empresa?.trim()];
  if (row.empresa && !companyId) {
    errors.push({
      row: rowNumber,
      field: 'empresa',
      message: `Empresa no encontrada: ${row.empresa}`,
      severity: 'error',
    });
  }
  
  // Validar fechas
  const hireDate = parseDate(row.fechaAlta);
  if (!hireDate) {
    errors.push({
      row: rowNumber,
      field: 'fechaAlta',
      message: 'Fecha de alta inválida o requerida',
      severity: 'error',
    });
  }
  
  const terminationDate = parseDate(row.fechaBaja);
  const seniorityDate = parseDate(row.antiguedad);
  
  // Advertencias
  const annualIncome = parseIncome(row.ingresosAnuales);
  if (annualIncome === 0) {
    errors.push({
      row: rowNumber,
      field: 'ingresosAnuales',
      message: 'Sin datos económicos',
      severity: 'warning',
    });
  }
  
  // Si hay errores críticos, no crear employee
  if (errors.some(e => e.severity === 'error')) {
    return { employee: null, errors };
  }
  
  // Calcular costes mensuales
  const monthlyBruto = annualIncome / 12;
  const monthlyCoste = monthlyBruto * 1.35; // Estimación SS (35%)
  
  const employee: ParsedEmployee = {
    full_name: normalizeName(row.nombre),
    dni: normalizeDNI(row.dni),
    company_id: companyId!,
    company_name: row.empresa?.trim(),
    hire_date: hireDate!,
    termination_date: terminationDate,
    seniority_date: seniorityDate,
    contract_type: row.tipoContrato?.trim() || null,
    annual_income: annualIncome,
    monthly_bruto: monthlyBruto,
    monthly_coste: monthlyCoste,
    rowNumber,
  };
  
  return { employee, errors };
}

/**
 * Agrupa empleados por DNI
 */
function groupByDNI(employees: ParsedEmployee[]): EmployeeGroup[] {
  const groups = new Map<string, EmployeeGroup>();
  
  for (const emp of employees) {
    if (!groups.has(emp.dni)) {
      groups.set(emp.dni, {
        dni: emp.dni,
        full_name: emp.full_name,
        contracts: [],
        hasMultipleCompanies: false,
        hasMultipleContractsInSameCompany: false,
      });
    }
    
    const group = groups.get(emp.dni)!;
    group.contracts.push(emp);
  }
  
  // Analizar cada grupo
  for (const group of groups.values()) {
    // Ordenar por fecha de alta
    group.contracts.sort((a, b) => 
      new Date(a.hire_date).getTime() - new Date(b.hire_date).getTime()
    );
    
    // Detectar múltiples empresas
    const companies = new Set(group.contracts.map(c => c.company_id));
    group.hasMultipleCompanies = companies.size > 1;
    
    // Detectar múltiples contratos en misma empresa
    const companyContractCount = new Map<string, number>();
    for (const contract of group.contracts) {
      const count = companyContractCount.get(contract.company_id) || 0;
      companyContractCount.set(contract.company_id, count + 1);
    }
    group.hasMultipleContractsInSameCompany = Array.from(companyContractCount.values()).some(c => c > 1);
  }
  
  return Array.from(groups.values());
}

/**
 * Detecta potenciales traslados (empleados con múltiples empresas)
 */
function detectPotentialTransfers(groups: EmployeeGroup[]): number {
  return groups.filter(g => g.hasMultipleCompanies).length;
}

/**
 * Parsea archivo Excel/CSV con histórico de empleados
 */
export async function parseEmployeeHistory(file: File): Promise<ParsedHistory> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy', // Ignorar filas completamente vacías
      transformHeader: (header) => normalizeHeader(header), // ✅ Normalizar cabeceras
      complete: (results) => {
        // Validar que existan columnas mínimas requeridas
        if (results.data.length === 0) {
          return reject(new Error('El archivo está vacío o no tiene datos válidos'));
        }
        
        const firstRow = results.data[0] as any;
        const requiredColumns = ['nombre', 'dni', 'empresa', 'fechaAlta', 'ingresosAnuales'];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          return reject(new Error(
            `Faltan columnas requeridas: ${missingColumns.join(', ')}. ` +
            `Asegúrate de que el Excel tenga las cabeceras correctas: ` +
            `Nombre, DNI/NIE, Empresa, Fecha Alta, Ingresos Anuales.`
          ));
        }
        
        const allEmployees: ParsedEmployee[] = [];
        const allErrors: ValidationError[] = [];
        
        results.data.forEach((row: any, index: number) => {
          const { employee, errors } = validateRow(row, index + 2); // +2 por header
          
          if (employee) {
            allEmployees.push(employee);
          }
          
          allErrors.push(...errors);
        });
        
        const groups = groupByDNI(allEmployees);
        const potentialTransfers = detectPotentialTransfers(groups);
        
        const stats = {
          totalRows: results.data.length,
          validRows: allEmployees.length,
          errorRows: allErrors.filter(e => e.severity === 'error').length,
          warningRows: allErrors.filter(e => e.severity === 'warning').length,
          uniqueEmployees: groups.length,
          potentialTransfers,
        };
        
        resolve({
          employees: allEmployees,
          groups,
          errors: allErrors,
          stats,
        });
      },
      error: (error) => {
        reject(new Error(`Error al parsear archivo: ${error.message}`));
      },
    });
  });
}
