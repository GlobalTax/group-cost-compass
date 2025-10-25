import Papa from "papaparse";

export interface ParsedCost {
  dni: string;
  period: string;
  bruto: number;
  coste_empresa: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParseResult {
  data: ParsedCost[];
  errors: ValidationError[];
  warnings: string[];
}

const requiredColumns = ["dni", "periodo", "bruto", "coste_empresa"];

const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const validatePeriod = (period: string): boolean => {
  // Accept YYYY-MM or YYYY-MM-DD format
  return /^\d{4}-\d{2}(-\d{2})?$/.test(period);
};

const normalizePeriod = (period: string): string => {
  // Convert to YYYY-MM-01 format
  if (/^\d{4}-\d{2}$/.test(period)) {
    return `${period}-01`;
  }
  // If already has day, keep it
  return period;
};

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  
  // Remove currency symbols and spaces
  const cleaned = value
    .replace(/[€$]/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "") // Remove thousands separator
    .replace(/,/g, "."); // Convert decimal separator
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

export const parseCostsFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const data: ParsedCost[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeColumnName,
      complete: (results) => {
        const headers = results.meta.fields || [];
        
        // Validate required columns
        const missingColumns = requiredColumns.filter(
          col => !headers.includes(col)
        );
        
        if (missingColumns.length > 0) {
          errors.push({
            row: 0,
            field: "headers",
            message: `Columnas requeridas faltantes: ${missingColumns.join(", ")}`,
          });
          resolve({ data: [], errors, warnings });
          return;
        }

        // Process each row
        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2;

          // Validate required fields
          if (!row.dni || row.dni.trim() === "") {
            errors.push({
              row: rowNum,
              field: "dni",
              message: "DNI/NIE es requerido",
            });
            return;
          }

          if (!row.periodo || row.periodo.trim() === "") {
            errors.push({
              row: rowNum,
              field: "periodo",
              message: "Período es requerido",
            });
            return;
          }

          if (!validatePeriod(row.periodo)) {
            errors.push({
              row: rowNum,
              field: "periodo",
              message: "Formato de período inválido. Use YYYY-MM",
            });
            return;
          }

          // Parse numbers
          const bruto = parseNumber(row.bruto);
          const costeEmpresa = parseNumber(row.coste_empresa);

          if (bruto === null) {
            errors.push({
              row: rowNum,
              field: "bruto",
              message: "Bruto mensual debe ser un número válido",
            });
            return;
          }

          if (costeEmpresa === null) {
            errors.push({
              row: rowNum,
              field: "coste_empresa",
              message: "Coste empresa debe ser un número válido",
            });
            return;
          }

          if (bruto < 0 || costeEmpresa < 0) {
            errors.push({
              row: rowNum,
              field: "valores",
              message: "Los valores no pueden ser negativos",
            });
            return;
          }

          // Parse the cost data
          const cost: ParsedCost = {
            dni: row.dni.trim(),
            period: normalizePeriod(row.periodo.trim()),
            bruto,
            coste_empresa: costeEmpresa,
          };

          data.push(cost);
        });

        // Add warnings for unusual values
        data.forEach((cost, index) => {
          if (cost.coste_empresa < cost.bruto) {
            warnings.push(
              `Fila ${index + 2}: El coste empresa (${cost.coste_empresa}€) es menor que el bruto (${cost.bruto}€)`
            );
          }
          
          const ratio = cost.coste_empresa / cost.bruto;
          if (ratio > 1.5) {
            warnings.push(
              `Fila ${index + 2}: El ratio coste/bruto (${ratio.toFixed(2)}) parece alto`
            );
          }
        });

        resolve({ data, errors, warnings });
      },
      error: (error) => {
        errors.push({
          row: 0,
          field: "file",
          message: `Error al leer el archivo: ${error.message}`,
        });
        resolve({ data: [], errors, warnings });
      },
    });
  });
};
