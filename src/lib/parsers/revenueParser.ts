import Papa from 'papaparse';
import { z } from 'zod';
import { format, parse } from 'date-fns';

// Raw CSV row structure
interface RevenueRowRaw {
  T: string;
  NUMERO: string;
  INICIO: string; // DD/MM/YYYY
  CL: string; // Client code
  'NOMBRE CLIENTE': string;
  SECCION: string;
  HN: string | number;
  CB: string | number;
  PG: string | number;
  E: string;
  FACTURA: string;
}

// Parsed revenue item for creation
export interface ParsedRevenueItem {
  client_code: string;
  client_name: string;
  period: string; // YYYY-MM-DD
  category: string;
  description: string;
  is_recurring: boolean;
  total_amount: number;
  invoice_number: string;
  raw_line: RevenueRowRaw;
}

// Category normalization map
const CATEGORY_MAP: Record<string, { category: string; is_recurring: boolean }> = {
  'SERVICIOS RECURRENTES': { category: 'Servicios Recurrentes', is_recurring: true },
  'SERVICIOS CONTABILIDAD': { category: 'Contabilidad', is_recurring: false },
  'SERVICIOS LABORAL': { category: 'Laboral', is_recurring: false },
  'SERVICIOS NOTIF. ELECTRONICAS': { category: 'Notificaciones Electrónicas', is_recurring: false },
  'LIBROS  IS Y CCAA': { category: 'Libros IS y CCAA', is_recurring: false },
  'TECNICO': { category: 'Técnico', is_recurring: false },
  'SOCIOS': { category: 'Socios', is_recurring: false },
};

// Company detection keywords (for future auto-assignment)
export const COMPANY_KEYWORDS: Record<string, string[]> = {
  'navarro-legal': ['abogados', 'legal', 'juridico', 'tribunal', 'slp'],
  'beglobal': ['beglobal', 'consultoria', 'consulting', 'advisory'],
  'golooper': ['golooper', 'tecnologia', 'desarrollo', 'digital'],
  'spv': ['spv', 'corporate', 'advisor', 'fusion', 'ma', 'inversiones'],
};

/**
 * Parse amount from string or number, handling Spanish decimal format
 */
function parseAmount(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remove thousands separator and convert comma to dot
  const normalized = String(value)
    .replace(/\./g, '') // Remove dots (thousands)
    .replace(',', '.'); // Replace comma with dot (decimals)
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse date from DD/MM/YYYY format
 */
function parseDate(dateStr: string): string {
  try {
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    // Return first day of month in YYYY-MM-DD format
    return format(new Date(parsed.getFullYear(), parsed.getMonth(), 1), 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    throw new Error(`Fecha inválida: ${dateStr}`);
  }
}

/**
 * Normalize section to standard category
 */
function normalizeCategory(section: string): { category: string; is_recurring: boolean } {
  const normalized = section.trim().toUpperCase();
  
  // Exact match
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }
  
  // Partial match for recurring services
  if (normalized.includes('RECURRENT') || normalized.includes('MENSUAL')) {
    return { category: 'Servicios Recurrentes', is_recurring: true };
  }
  
  // Default: use section as category
  return { category: section.trim(), is_recurring: false };
}

/**
 * Parse CSV file and return array of revenue items
 */
export async function parseRevenueCSV(file: File): Promise<{
  items: ParsedRevenueItem[];
  errors: Array<{ row: number; error: string; data?: any }>;
  summary: {
    totalRows: number;
    validRows: number;
    totalAmount: number;
    recurringAmount: number;
    uniqueClients: number;
    categoriesBreakdown: Record<string, number>;
  };
}> {
  return new Promise((resolve, reject) => {
    const items: ParsedRevenueItem[] = [];
    const errors: Array<{ row: number; error: string; data?: any }> = [];
    const clientsSet = new Set<string>();
    const categoriesBreakdown: Record<string, number> = {};
    let totalAmount = 0;
    let recurringAmount = 0;

    Papa.parse<RevenueRowRaw>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        results.data.forEach((row, index) => {
          try {
            // Skip invalid rows
            if (!row['NOMBRE CLIENTE'] || !row.INICIO || !row.FACTURA) {
              errors.push({
                row: index + 2, // +2 for header and 0-index
                error: 'Faltan campos requeridos (NOMBRE CLIENTE, INICIO, FACTURA)',
                data: row,
              });
              return;
            }

            // Parse amounts
            const hn = parseAmount(row.HN);
            const cb = parseAmount(row.CB);
            const pg = parseAmount(row.PG);
            const e = parseAmount(row.E);
            const amount = hn + cb + pg + e;

            // Skip zero amount lines
            if (amount === 0) {
              return;
            }

            // Parse category
            const { category, is_recurring } = normalizeCategory(row.SECCION || 'Otros');

            // Parse date
            const period = parseDate(row.INICIO);

            // Create item
            const item: ParsedRevenueItem = {
              client_code: row.CL?.trim() || '',
              client_name: row['NOMBRE CLIENTE'].trim(),
              period,
              category,
              description: `${category} - ${row['NOMBRE CLIENTE']}`,
              is_recurring,
              total_amount: amount,
              invoice_number: row.FACTURA.trim(),
              raw_line: row,
            };

            items.push(item);
            clientsSet.add(item.client_name);
            totalAmount += amount;
            if (is_recurring) recurringAmount += amount;
            categoriesBreakdown[category] = (categoriesBreakdown[category] || 0) + amount;
          } catch (error: any) {
            errors.push({
              row: index + 2,
              error: error.message || 'Error desconocido',
              data: row,
            });
          }
        });

        resolve({
          items,
          errors,
          summary: {
            totalRows: results.data.length,
            validRows: items.length,
            totalAmount,
            recurringAmount,
            uniqueClients: clientsSet.size,
            categoriesBreakdown,
          },
        });
      },
      error: (error) => {
        reject(new Error(`Error al parsear CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Detect company based on client name and services
 */
export function detectCompanyForClient(clientName: string, categories: string[]): string | null {
  const normalizedClient = clientName.toLowerCase();
  const normalizedCategories = categories.join(' ').toLowerCase();
  
  for (const [companyKey, keywords] of Object.entries(COMPANY_KEYWORDS)) {
    const match = keywords.some(kw => 
      normalizedClient.includes(kw) || normalizedCategories.includes(kw)
    );
    if (match) return companyKey;
  }
  
  return null;
}

/**
 * Parse revenue data from array of objects (for paste functionality)
 */
export async function parseRevenueFromRows(
  rows: Array<Record<string, any>>
): Promise<{
  items: ParsedRevenueItem[];
  errors: Array<{ row: number; error: string; data?: any }>;
  summary: {
    totalRows: number;
    validRows: number;
    totalAmount: number;
    recurringAmount: number;
    uniqueClients: number;
    categoriesBreakdown: Record<string, number>;
  };
}> {
  const items: ParsedRevenueItem[] = [];
  const errors: Array<{ row: number; error: string; data?: any }> = [];
  const clientsSet = new Set<string>();
  const categoriesBreakdown: Record<string, number> = {};
  let totalAmount = 0;
  let recurringAmount = 0;

  rows.forEach((row, index) => {
    try {
      // Detectar columnas flexiblemente
      const clientName = 
        row['NOMBRE CLIENTE'] || 
        row['CLIENTE'] || 
        row['Cliente'] || 
        row['Nombre Cliente'] || 
        row['client_name'] ||
        '';
      
      const clientCode = 
        row['CL'] || 
        row['Código'] || 
        row['CODIGO'] ||
        row['client_code'] ||
        '';

      const section = 
        row['SECCIÓN'] || 
        row['SECCION'] || 
        row['Sección'] || 
        row['CATEGORIA'] ||
        row['Categoría'] ||
        row['category'] ||
        '';

      const inicio = 
        row['INICIO'] || 
        row['Inicio'] || 
        row['FECHA'] ||
        row['Fecha'] ||
        row['period'] ||
        '';

      const factura = 
        row['FACTURA'] || 
        row['Factura'] || 
        row['NÚMERO'] ||
        row['Número'] ||
        row['invoice_number'] ||
        '';

      // Validaciones básicas
      if (!clientName || !inicio || !factura) {
        errors.push({
          row: index + 1,
          error: 'Faltan campos requeridos (NOMBRE CLIENTE, INICIO, FACTURA)',
          data: row,
        });
        return;
      }

      // Parse amounts (pueden estar separados o como TOTAL)
      const hn = parseAmount(row['HN'] || row['hn'] || 0);
      const cb = parseAmount(row['CB'] || row['cb'] || 0);
      const pg = parseAmount(row['PG'] || row['pg'] || 0);
      const e = parseAmount(row['E'] || row['e'] || 0);
      const total = row['TOTAL'] || row['Total'] || row['total']
        ? parseAmount(row['TOTAL'] || row['Total'] || row['total'])
        : hn + cb + pg + e;

      // Skip zero amount lines
      if (total === 0) {
        return;
      }

      // Parse category
      const { category, is_recurring } = normalizeCategory(section || 'Otros');

      // Parse date
      const period = parseDate(inicio);

      // Create item
      const item: ParsedRevenueItem = {
        client_code: clientCode.trim(),
        client_name: clientName.trim(),
        period,
        category,
        description: `${category} - ${clientName}`,
        is_recurring,
        total_amount: total,
        invoice_number: factura.trim(),
        raw_line: row as any,
      };

      items.push(item);
      clientsSet.add(item.client_name);
      totalAmount += total;
      if (is_recurring) recurringAmount += total;
      categoriesBreakdown[category] = (categoriesBreakdown[category] || 0) + total;
    } catch (error: any) {
      errors.push({
        row: index + 1,
        error: error.message || 'Error procesando fila',
        data: row,
      });
    }
  });

  return {
    items,
    errors,
    summary: {
      totalRows: rows.length,
      validRows: items.length,
      totalAmount,
      recurringAmount,
      uniqueClients: clientsSet.size,
      categoriesBreakdown,
    },
  };
}

/**
 * Group items by client for preview
 */
export function groupItemsByClient(items: ParsedRevenueItem[]): Array<{
  client_name: string;
  client_code: string;
  total_amount: number;
  items_count: number;
  categories: string[];
  is_recurring: boolean;
  items: ParsedRevenueItem[];
}> {
  const grouped = new Map<string, {
    client_name: string;
    client_code: string;
    total_amount: number;
    items_count: number;
    categories: Set<string>;
    is_recurring: boolean;
    items: ParsedRevenueItem[];
  }>();

  items.forEach(item => {
    const key = `${item.client_code}-${item.client_name}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        client_name: item.client_name,
        client_code: item.client_code,
        total_amount: 0,
        items_count: 0,
        categories: new Set(),
        is_recurring: false,
        items: [],
      });
    }

    const group = grouped.get(key)!;
    group.total_amount += item.total_amount;
    group.items_count++;
    group.categories.add(item.category);
    group.is_recurring = group.is_recurring || item.is_recurring;
    group.items.push(item);
  });

  return Array.from(grouped.values()).map(g => ({
    ...g,
    categories: Array.from(g.categories),
  }));
}
