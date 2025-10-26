import Papa from "papaparse";

interface ParsedA3NomCost {
  employee_code: string;
  employee_name: string;
  porcentaje_imputacion: number;
  bruto: number;
  sal_neto: number;
  coste_empresa: number;
  total_tc1: number;
  irpf_dinero: number;
  irpf_especie: number;
  ss_trabajador: number;
  ss_empresa: number;
  anticipos: number | null;
  embargos: number | null;
  dto_preaviso: number | null;
  dtos_varios: number | null;
  prestamos: number | null;
  dto_especial: number | null;
  indemnizacion: number | null;
  enf_acc: number | null;
  bonificacion: number | null;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface A3NomParseResult {
  data: ParsedA3NomCost[];
  errors: ValidationError[];
  warnings: string[];
  summary: {
    totalEmployees: number;
    totalBruto: number;
    totalCoste: number;
  };
}

// Detectar si una fila es válida (contiene código de empleado)
const isValidEmployeeRow = (row: any): boolean => {
  const firstCol = row[Object.keys(row)[0]]?.toString().trim();
  return /^\d{6}$/.test(firstCol); // Código de 6 dígitos (ej: 000097, 005015)
};

// Normalizar número: manejar formatos europeos y limpiar
const parseNumber = (value: string | number): number | null => {
  if (value === null || value === undefined || value === "") return null;
  
  const stringValue = value.toString().trim();
  if (stringValue === "" || stringValue === "-") return null;

  // Remover espacios y reemplazar coma por punto
  const normalized = stringValue
    .replace(/\s/g, "")
    .replace(/,/g, ".");

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
};

// Consolidar múltiples líneas del mismo empleado (sumar valores)
const consolidateDuplicates = (costs: ParsedA3NomCost[]): ParsedA3NomCost[] => {
  const grouped = new Map<string, ParsedA3NomCost>();

  for (const cost of costs) {
    if (grouped.has(cost.employee_code)) {
      const existing = grouped.get(cost.employee_code)!;
      
      // Sumar todos los campos numéricos
      existing.bruto += cost.bruto;
      existing.sal_neto += cost.sal_neto;
      existing.coste_empresa += cost.coste_empresa;
      existing.total_tc1 += cost.total_tc1;
      existing.irpf_dinero += cost.irpf_dinero;
      existing.irpf_especie += cost.irpf_especie;
      existing.ss_trabajador += cost.ss_trabajador;
      existing.ss_empresa += cost.ss_empresa;
      
      // Sumar campos opcionales
      existing.anticipos = (existing.anticipos || 0) + (cost.anticipos || 0);
      existing.embargos = (existing.embargos || 0) + (cost.embargos || 0);
      existing.dto_preaviso = (existing.dto_preaviso || 0) + (cost.dto_preaviso || 0);
      existing.dtos_varios = (existing.dtos_varios || 0) + (cost.dtos_varios || 0);
      existing.prestamos = (existing.prestamos || 0) + (cost.prestamos || 0);
      existing.dto_especial = (existing.dto_especial || 0) + (cost.dto_especial || 0);
      existing.indemnizacion = (existing.indemnizacion || 0) + (cost.indemnizacion || 0);
      existing.enf_acc = (existing.enf_acc || 0) + (cost.enf_acc || 0);
      existing.bonificacion = (existing.bonificacion || 0) + (cost.bonificacion || 0);
    } else {
      grouped.set(cost.employee_code, { ...cost });
    }
  }

  return Array.from(grouped.values());
};

// Mapeo de nombres de columnas del Excel a campos del modelo
const columnMapping: Record<string, string> = {
  "TRABAJADOR": "employee_name",
  "% IMP.": "porcentaje_imputacion",
  "BRUTO": "bruto",
  "SAL.NETO": "sal_neto",
  "COSTE EMPR": "coste_empresa",
  "TOTAL TC1": "total_tc1",
  "IRPF DIN": "irpf_dinero",
  "IRPF ESP.": "irpf_especie",
  "SS. TRAB": "ss_trabajador",
  "SS EMPRESA": "ss_empresa",
  "ANTICIPOS": "anticipos",
  "EMBARGOS": "embargos",
  "DTO PREAVI": "dto_preaviso",
  "DTOS VARIO": "dtos_varios",
  "PRESTAMOS": "prestamos",
  "DTO ESPECI": "dto_especial",
  "INDEMNIZAC": "indemnizacion",
  "ENF/ACC": "enf_acc",
  "BONIFIC": "bonificacion",
};

export const parseA3NomCostsFile = async (
  file: File
): Promise<A3NomParseResult> => {
  return new Promise((resolve) => {
    const parsedData: ParsedA3NomCost[] = [];
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let rowNumber = 0;

    Papa.parse(file, {
      delimiter: "\t", // A3Nom usa tabs
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];

        // Encontrar fila de encabezados
        let headerRow: any = null;
        let headerRowIndex = -1;

        for (let i = 0; i < Math.min(20, rows.length); i++) {
          const row = rows[i];
          const firstCol = row[Object.keys(row)[0]]?.toString().trim().toUpperCase();
          
          if (firstCol && firstCol.includes("TRABAJADOR")) {
            headerRow = row;
            headerRowIndex = i;
            break;
          }
        }

        if (!headerRow) {
          errors.push({
            row: 0,
            field: "header",
            message: "No se encontró la fila de encabezados. Verifica que el archivo tenga formato A3Nom.",
          });
          resolve({ data: [], errors, warnings, summary: { totalEmployees: 0, totalBruto: 0, totalCoste: 0 } });
          return;
        }

        // Normalizar encabezados
        const headers = Object.values(headerRow).map((h: any) => 
          h?.toString().trim().toUpperCase() || ""
        );

        // Procesar filas de datos (después del encabezado)
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          rowNumber = i + 1;
          const row = rows[i];
          
          if (!isValidEmployeeRow(row)) {
            continue; // Saltar totales, encabezados intermedios, filas vacías
          }

          const rowValues = Object.values(row);
          const employeeCode = rowValues[0]?.toString().trim();
          const employeeName = rowValues[1]?.toString().trim();

          if (!employeeCode || !employeeName) {
            errors.push({
              row: rowNumber,
              field: "employee_code",
              message: "Fila sin código o nombre de empleado",
            });
            continue;
          }

          try {
            const cost: ParsedA3NomCost = {
              employee_code: employeeCode,
              employee_name: employeeName,
              porcentaje_imputacion: parseNumber(rowValues[2] as string | number) || 100,
              bruto: parseNumber(rowValues[3] as string | number) || 0,
              sal_neto: parseNumber(rowValues[4] as string | number) || 0,
              coste_empresa: parseNumber(rowValues[5] as string | number) || 0,
              total_tc1: parseNumber(rowValues[6] as string | number) || 0,
              irpf_dinero: parseNumber(rowValues[7] as string | number) || 0,
              irpf_especie: parseNumber(rowValues[8] as string | number) || 0,
              ss_trabajador: parseNumber(rowValues[9] as string | number) || 0,
              ss_empresa: parseNumber(rowValues[10] as string | number) || 0,
              anticipos: parseNumber(rowValues[11] as string | number),
              embargos: parseNumber(rowValues[12] as string | number),
              dto_preaviso: parseNumber(rowValues[13] as string | number),
              dtos_varios: parseNumber(rowValues[14] as string | number),
              prestamos: parseNumber(rowValues[15] as string | number),
              dto_especial: parseNumber(rowValues[16] as string | number),
              indemnizacion: parseNumber(rowValues[17] as string | number),
              enf_acc: parseNumber(rowValues[18] as string | number),
              bonificacion: parseNumber(rowValues[19] as string | number),
            };

            // Validaciones
            if (cost.bruto === 0 && cost.coste_empresa === 0) {
              warnings.push(`Fila ${rowNumber}: ${employeeName} tiene valores en 0`);
            }

            if (cost.coste_empresa < cost.bruto) {
              warnings.push(
                `Fila ${rowNumber}: ${employeeName} - Coste empresa (${cost.coste_empresa}) menor que bruto (${cost.bruto})`
              );
            }

            parsedData.push(cost);
          } catch (error) {
            errors.push({
              row: rowNumber,
              field: "general",
              message: `Error procesando fila: ${(error as Error).message}`,
            });
          }
        }

        // Consolidar duplicados
        const consolidated = consolidateDuplicates(parsedData);

        if (consolidated.length < parsedData.length) {
          warnings.push(
            `Se consolidaron ${parsedData.length - consolidated.length} líneas duplicadas`
          );
        }

        // Calcular resumen
        const summary = {
          totalEmployees: consolidated.length,
          totalBruto: consolidated.reduce((sum, c) => sum + c.bruto, 0),
          totalCoste: consolidated.reduce((sum, c) => sum + c.coste_empresa, 0),
        };

        resolve({
          data: consolidated,
          errors,
          warnings,
          summary,
        });
      },
      error: (error) => {
        errors.push({
          row: 0,
          field: "file",
          message: `Error leyendo archivo: ${error.message}`,
        });
        resolve({ data: [], errors, warnings, summary: { totalEmployees: 0, totalBruto: 0, totalCoste: 0 } });
      },
    });
  });
};
