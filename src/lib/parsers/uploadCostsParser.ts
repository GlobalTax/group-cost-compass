import Papa from "papaparse";
import { uploadCostRowSchema, type UploadCostRow, type ParsedRow, type UploadValidationResult } from "@/lib/validators/uploadSchema";
import type { Database } from "@/integrations/supabase/types";

type Company = Database['public']['Tables']['companies']['Row'];

const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const parseLocaleNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  
  const cleaned = value
    .toString()
    .trim()
    .replace(/[€$]/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "") // Remove thousands separator
    .replace(/,/g, "."); // Convert decimal to dot
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const normalizeDateToFirstDay = (dateStr: string): string => {
  // Si ya es YYYY-MM, retornar
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Si es YYYY-MM-DD, extraer YYYY-MM
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.substring(0, 7);
  }
  
  // Si es DD/MM/YYYY, convertir
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(ddmmyyyy);
  if (match) {
    const [, , month, year] = match;
    return `${year}-${month.padStart(2, "0")}`;
  }
  
  return dateStr;
};

const findBestCompanyMatch = (
  inputCompany: string,
  companies: Company[]
): { match: Company | null; normalized: string } => {
  const input = inputCompany.trim().toLowerCase();
  
  // 1. Exact match (case-insensitive)
  const exact = companies.find(c => c.name.toLowerCase() === input);
  if (exact) return { match: exact, normalized: exact.name };
  
  // 2. Partial match (contains)
  const partial = companies.find(c => 
    c.name.toLowerCase().includes(input) || input.includes(c.name.toLowerCase())
  );
  if (partial) return { match: partial, normalized: partial.name };
  
  // 3. Match by NIF
  const byNif = companies.find(c => c.nif && input.includes(c.nif.toLowerCase()));
  if (byNif) return { match: byNif, normalized: byNif.name };
  
  return { match: null, normalized: inputCompany };
};

export const parseUploadCostsFile = async (
  file: File,
  companies: Company[]
): Promise<UploadValidationResult<UploadCostRow>> => {
  return new Promise((resolve) => {
    const rows: ParsedRow<UploadCostRow>[] = [];
    const seenKeys = new Set<string>();
    const companyMapping = new Map<string, string>();
    
    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    let duplicates = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeColumnName,
      complete: (results) => {
        const headers = results.meta.fields || [];
        
        // Validar cabeceras requeridas
        const requiredHeaders = ["nif", "name", "company", "date", "bruto", "coste_empresa"];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          rows.push({
            rowNumber: 0,
            data: null,
            errors: [{ field: "headers", message: `Cabeceras faltantes: ${missingHeaders.join(", ")}` }],
            warnings: [],
            isDuplicate: false,
            missingFields: missingHeaders,
          });
          resolve({ rows, validCount, errorCount: 1, warningCount, duplicates, companies: companyMapping });
          return;
        }

        // Procesar cada fila
        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2;
          const errors: Array<{ field: string; message: string }> = [];
          const warnings: string[] = [];
          const missingFields: string[] = [];
          
          // 1. Normalizar datos
          const normalizedDate = row.date ? normalizeDateToFirstDay(row.date.trim()) : "";
          const normalizedBruto = parseLocaleNumber(row.bruto || "0");
          const normalizedCoste = parseLocaleNumber(row.coste_empresa || "0");
          
          // 2. Normalizar empresa
          const { match: companyMatch, normalized: normalizedCompany } = findBestCompanyMatch(
            row.company || "",
            companies
          );
          
          if (!companyMatch) {
            warnings.push(`Empresa "${row.company}" no encontrada en catálogo. Usar nombre exacto.`);
          }
          
          companyMapping.set(row.company || "", normalizedCompany);
          
          // 3. Construir objeto para validación
          const rawData = {
            employee_id: row.employee_id || "",
            nif: row.nif?.trim().toUpperCase() || "",
            name: row.name?.trim() || "",
            company: normalizedCompany,
            date: normalizedDate,
            bruto: normalizedBruto,
            coste_empresa: normalizedCoste,
          };
          
          // 4. Detectar campos faltantes
          if (!rawData.nif) missingFields.push("nif");
          if (!rawData.name) missingFields.push("name");
          if (!rawData.company) missingFields.push("company");
          if (!rawData.date) missingFields.push("date");
          
          // 5. Validar con Zod
          const result = uploadCostRowSchema.safeParse(rawData);
          
          if (!result.success) {
            result.error.errors.forEach(err => {
              errors.push({
                field: err.path.join("."),
                message: err.message,
              });
            });
            errorCount++;
          } else {
            validCount++;
          }
          
          // 6. Detectar duplicados
          const key = `${rawData.nif}-${rawData.date}`;
          const isDuplicate = seenKeys.has(key);
          if (isDuplicate) {
            duplicates++;
            warnings.push("Registro duplicado (mismo NIF + fecha)");
          }
          seenKeys.add(key);
          
          if (warnings.length > 0) warningCount++;
          
          rows.push({
            rowNumber,
            data: result.success ? result.data : null,
            errors,
            warnings,
            isDuplicate,
            missingFields,
            normalizedCompany,
          });
        });

        resolve({ rows, validCount, errorCount, warningCount, duplicates, companies: companyMapping });
      },
      error: (error) => {
        rows.push({
          rowNumber: 0,
          data: null,
          errors: [{ field: "file", message: `Error al leer archivo: ${error.message}` }],
          warnings: [],
          isDuplicate: false,
          missingFields: [],
        });
        resolve({ rows, validCount: 0, errorCount: 1, warningCount: 0, duplicates: 0, companies: companyMapping });
      },
    });
  });
};
