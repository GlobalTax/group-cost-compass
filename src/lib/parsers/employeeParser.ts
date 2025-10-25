import Papa from "papaparse";

export interface ParsedEmployee {
  full_name: string;
  dni?: string;
  company_name: string;
  hire_date: string;
  termination_date?: string;
  seniority_date?: string;
  transfer_group?: boolean;
  notes?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParseResult {
  data: ParsedEmployee[];
  errors: ValidationError[];
  warnings: string[];
}

const requiredColumns = ["nombre", "empresa", "fecha_alta"];

const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const validateDate = (dateStr: string): boolean => {
  if (!dateStr) return true; // Optional dates are valid
  
  // Try DD/MM/YYYY format
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (ddmmyyyy.test(dateStr)) {
    return true;
  }
  
  // Try YYYY-MM-DD format
  const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/;
  return yyyymmdd.test(dateStr);
};

const parseDate = (dateStr: string): string | undefined => {
  if (!dateStr) return undefined;
  
  // If already in YYYY-MM-DD format, return as is
  const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/;
  if (yyyymmdd.test(dateStr)) {
    return dateStr;
  }
  
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(ddmmyyyy);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  
  return undefined;
};

export const parseEmployeesFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    const data: ParsedEmployee[] = [];

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
          const rowNum = index + 2; // +2 because index is 0-based and we have a header row

          // Validate required fields
          if (!row.nombre || row.nombre.trim() === "") {
            errors.push({
              row: rowNum,
              field: "nombre",
              message: "Nombre es requerido",
            });
            return;
          }

          if (!row.empresa || row.empresa.trim() === "") {
            errors.push({
              row: rowNum,
              field: "empresa",
              message: "Empresa es requerida",
            });
            return;
          }

          if (!row.fecha_alta || row.fecha_alta.trim() === "") {
            errors.push({
              row: rowNum,
              field: "fecha_alta",
              message: "Fecha de alta es requerida",
            });
            return;
          }

          // Validate dates
          if (!validateDate(row.fecha_alta)) {
            errors.push({
              row: rowNum,
              field: "fecha_alta",
              message: "Formato de fecha inválido. Use DD/MM/YYYY o YYYY-MM-DD",
            });
            return;
          }

          if (row.fecha_baja && !validateDate(row.fecha_baja)) {
            errors.push({
              row: rowNum,
              field: "fecha_baja",
              message: "Formato de fecha inválido. Use DD/MM/YYYY o YYYY-MM-DD",
            });
            return;
          }

          if (row.fecha_antiguedad && !validateDate(row.fecha_antiguedad)) {
            errors.push({
              row: rowNum,
              field: "fecha_antiguedad",
              message: "Formato de fecha inválido. Use DD/MM/YYYY o YYYY-MM-DD",
            });
            return;
          }

          // Parse the employee data
          const employee: ParsedEmployee = {
            full_name: row.nombre.trim(),
            company_name: row.empresa.trim(),
            hire_date: parseDate(row.fecha_alta)!,
            dni: row.dni ? row.dni.trim() : undefined,
            termination_date: parseDate(row.fecha_baja),
            seniority_date: parseDate(row.fecha_antiguedad),
            transfer_group: row.traslado === "true" || row.traslado === "1" || row.traslado === "sí",
            notes: row.notas ? row.notas.trim() : undefined,
          };

          data.push(employee);
        });

        // Add warnings for duplicates
        const nameCount = new Map<string, number>();
        data.forEach((emp) => {
          const count = nameCount.get(emp.full_name) || 0;
          nameCount.set(emp.full_name, count + 1);
        });

        nameCount.forEach((count, name) => {
          if (count > 1) {
            warnings.push(`El empleado "${name}" aparece ${count} veces en el archivo`);
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
