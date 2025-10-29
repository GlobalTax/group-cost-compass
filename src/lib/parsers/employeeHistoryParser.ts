/**
 * Parser para el histórico de empleados desde Excel
 * Normaliza, valida y agrupa datos de contratos históricos
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
    .replace(/[\/\-()€]/g, '');       // quitar /, -, (), €
  
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
  
  return headerMap[normalized] || normalized; // Si no está mapeado, devolver normalizado
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
 * Soporta múltiples formatos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, Date objects
 */
function parseDate(dateStr: string | Date): string | null {
  // Si es un objeto Date, formatear directamente
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return null;
    const year = dateStr.getFullYear();
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const day = String(dateStr.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (!dateStr || dateStr === '—' || String(dateStr).trim() === '') {
    return null;
  }
  
  const str = String(dateStr).trim();
  
  // Detectar separador (/ o -)
  const separator = str.includes('/') ? '/' : '-';
  const parts = str.split(separator);
  
  if (parts.length !== 3) {
    console.warn(`Formato de fecha no reconocido: "${str}"`);
    return null;
  }
  
  const [part1, part2, part3] = parts.map(p => parseInt(p, 10));
  
  // Detectar formato basado en el rango de valores
  let year: number, month: number, day: number;
  
  // Si part1 > 31, es YYYY-MM-DD
  if (part1 > 31) {
    year = part1;
    month = part2;
    day = part3;
  }
  // Si part3 > 31, es DD/MM/YYYY o DD-MM-YYYY
  else if (part3 > 31) {
    day = part1;
    month = part2;
    year = part3;
  }
  // Si part3 <= 31 pero es un año de 2 dígitos (< 100)
  else if (part3 < 100) {
    day = part1;
    month = part2;
    year = part3 + 2000; // Asumimos 20XX
  }
  // Ambiguo: asumir DD/MM/YYYY (formato europeo por defecto)
  else {
    day = part1;
    month = part2;
    year = part3;
  }
  
  // Validar rangos
  if (month < 1 || month > 12) {
    console.error(`Mes inválido: ${month} en fecha "${str}"`);
    return null;
  }
  
  if (day < 1 || day > 31) {
    console.error(`Día inválido: ${day} en fecha "${str}"`);
    return null;
  }
  
  if (year < 1900 || year > 2100) {
    console.error(`Año inválido: ${year} en fecha "${str}"`);
    return null;
  }
  
  const result = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  console.log(`📅 Fecha parseada: "${str}" → "${result}"`);
  return result;
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
 * Construye el resultado ParsedHistory a partir de filas ya parseadas
 * Reutilizable para CSV y Excel
 */
function buildParsedHistory(rows: any[]): ParsedHistory {
  const allEmployees: ParsedEmployee[] = [];
  const allErrors: ValidationError[] = [];
  
  rows.forEach((row: any, index: number) => {
    const { employee, errors } = validateRow(row, index + 2); // +2 por header
    
    if (employee) {
      allEmployees.push(employee);
    }
    
    allErrors.push(...errors);
  });
  
  const groups = groupByDNI(allEmployees);
  const potentialTransfers = detectPotentialTransfers(groups);
  
  const stats = {
    totalRows: rows.length,
    validRows: allEmployees.length,
    errorRows: allErrors.filter(e => e.severity === 'error').length,
    warningRows: allErrors.filter(e => e.severity === 'warning').length,
    uniqueEmployees: groups.length,
    potentialTransfers,
  };
  
  return {
    employees: allEmployees,
    groups,
    errors: allErrors,
    stats,
  };
}

/**
 * Parsea archivo Excel (.xlsx/.xls) usando SheetJS
 */
async function parseExcel(file: File): Promise<ParsedHistory> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  
  // Tomar la primera hoja
  const ws = wb.Sheets[wb.SheetNames[0]];
  
  // Obtener datos como matriz (primera fila = cabeceras)
  const matrix = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
    raw: false,
    dateNF: 'dd/mm/yyyy'
  }) as any[][];
  
  if (matrix.length === 0) {
    throw new Error('El archivo Excel está vacío');
  }
  
  // Separar cabeceras y datos
  const [headerRow = [], ...dataRows] = matrix;
  
  // Normalizar cabeceras
  const normalizedHeaders = headerRow
    .map(h => normalizeHeader(String(h ?? '')))
    .filter(Boolean);
  
  console.log('📊 Headers (XLSX):', headerRow, '→', normalizedHeaders);
  
  // Validar columnas requeridas
  const requiredColumns = ['nombre', 'dni', 'empresa', 'fechaAlta', 'ingresosAnuales'];
  const missingColumns = requiredColumns.filter(col => !normalizedHeaders.includes(col));
  
  if (missingColumns.length > 0) {
    console.error('📋 Columnas disponibles:', normalizedHeaders);
    console.error('❌ Columnas faltantes:', missingColumns);
    throw new Error(
      `Faltan columnas requeridas: ${missingColumns.join(', ')}.\n` +
      `Columnas encontradas: ${normalizedHeaders.join(', ')}`
    );
  }
  
  // Mapear filas a objetos
  const rowsObjects = dataRows.map(row => {
    const obj: any = {};
    normalizedHeaders.forEach((key, i) => {
      if (key) obj[key] = row[i];
    });
    return obj;
  });
  
  return buildParsedHistory(rowsObjects);
}

/**
 * Parsea archivo CSV usando PapaParse
 */
async function parseCSV(file: File): Promise<ParsedHistory> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => {
        const normalized = normalizeHeader(header);
        console.log(`📊 Header (CSV): "${header}" → "${normalized}"`);
        return normalized;
      },
      complete: (results) => {
        if (results.data.length === 0) {
          return reject(new Error('El archivo está vacío o no tiene datos válidos'));
        }
        
        const firstRow = results.data[0] as any;
        const requiredColumns = ['nombre', 'dni', 'empresa', 'fechaAlta', 'ingresosAnuales'];
        const availableColumns = Object.keys(firstRow);
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          console.error('📋 Columnas disponibles:', availableColumns);
          console.error('❌ Columnas faltantes:', missingColumns);
          return reject(new Error(
            `Faltan columnas requeridas: ${missingColumns.join(', ')}.\n` +
            `Columnas encontradas: ${availableColumns.join(', ')}`
          ));
        }
        
        resolve(buildParsedHistory(results.data));
      },
      error: (error) => {
        reject(new Error(`Error al parsear CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Parsea archivo Excel/CSV con histórico de empleados
 * Detecta automáticamente el formato según la extensión
 */
export async function parseEmployeeHistory(file: File): Promise<ParsedHistory> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext === 'csv' || file.type === 'text/csv') {
    return parseCSV(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error(
      `Formato de archivo no soportado: ${ext || file.type}. ` +
      `Por favor, sube un archivo CSV o Excel (.xlsx, .xls)`
    );
  }
}
