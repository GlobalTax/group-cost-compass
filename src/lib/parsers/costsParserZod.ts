import Papa from "papaparse";
import { z } from "zod";

// ============================================
// ZOD SCHEMAS
// ============================================

const periodSchema = z.string()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Formato de período inválido. Use YYYY-MM");

const costRowSchema = z.object({
  dni: z.string().trim().min(1, "DNI/NIE es requerido"),
  periodo: periodSchema,
  bruto: z.string().transform((val) => parseNumber(val))
    .pipe(z.number().min(0, "El bruto debe ser positivo")),
  coste_empresa: z.string().transform((val) => parseNumber(val))
    .pipe(z.number().min(0, "El coste empresa debe ser positivo")),
});

// ============================================
// TYPES
// ============================================

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

// ============================================
// UTILITIES
// ============================================

const requiredColumns = ["dni", "periodo", "bruto", "coste_empresa"];

const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const normalizePeriod = (period: string): string => {
  // Convert to YYYY-MM-01 format
  if (/^\d{4}-\d{2}$/.test(period)) {
    return `${period}-01`;
  }
  return period;
};

const parseNumber = (value: string): number => {
  if (!value) throw new Error("Valor vacío");
  
  // Remove currency symbols and spaces
  const cleaned = value
    .replace(/[€$]/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "") // Remove thousands separator
    .replace(/,/g, "."); // Convert decimal separator
  
  const num = parseFloat(cleaned);
  if (isNaN(num)) throw new Error("Número inválido");
  return num;
};

// ============================================
// MAIN PARSER
// ============================================

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

        // Process each row with Zod validation
        results.data.forEach((row: any, index: number) => {
          const rowNum = index + 2;

          try {
            const validated = costRowSchema.parse(row);
            
            const cost: ParsedCost = {
              dni: validated.dni,
              period: normalizePeriod(validated.periodo),
              bruto: validated.bruto,
              coste_empresa: validated.coste_empresa,
            };

            data.push(cost);

            // Add warnings for unusual values
            if (cost.coste_empresa < cost.bruto) {
              warnings.push(
                `Fila ${rowNum}: El coste empresa (${cost.coste_empresa}€) es menor que el bruto (${cost.bruto}€)`
              );
            }
            
            const ratio = cost.coste_empresa / cost.bruto;
            if (ratio > 1.5) {
              warnings.push(
                `Fila ${rowNum}: El ratio coste/bruto (${ratio.toFixed(2)}) parece alto`
              );
            }
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({
                  row: rowNum,
                  field: err.path.join("."),
                  message: err.message,
                });
              });
            } else {
              errors.push({
                row: rowNum,
                field: "unknown",
                message: error instanceof Error ? error.message : "Error desconocido",
              });
            }
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
