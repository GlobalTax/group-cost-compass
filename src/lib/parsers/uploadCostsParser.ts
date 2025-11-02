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
  companies: Company[],
  mapping?: Record<string, string>
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
        let headers = results.meta.fields || [];
        
        // Aplicar mapeo si existe
        let processedData = results.data;
        if (mapping && Object.keys(mapping).length > 0) {
          // ✅ Normalizar keys del mapping
          const normalizedMapping: Record<string, string> = {};
          Object.entries(mapping).forEach(([targetField, sourceHeader]) => {
            if (sourceHeader) {
              normalizedMapping[targetField] = normalizeColumnName(sourceHeader);
            }
          });
          
          console.log("🔍 Mapping original:", mapping);
          console.log("🔍 Mapping normalizado:", normalizedMapping);
          
          processedData = results.data.map((row: any) => {
            const mappedRow: any = {};
            Object.entries(normalizedMapping).forEach(([targetField, normalizedSource]) => {
              if (normalizedSource && row[normalizedSource] !== undefined) {
                mappedRow[targetField] = row[normalizedSource];
              }
            });
            // Preservar campos no mapeados
            Object.keys(row).forEach(key => {
              if (!mappedRow[key]) mappedRow[key] = row[key];
            });
            return mappedRow;
          });
          
          console.log("🔍 Primera fila procesada:", processedData[0]);
          
          // Actualizar headers con los campos mapeados
          headers = Array.from(new Set([...headers, ...Object.keys(normalizedMapping).filter(k => normalizedMapping[k])]));
        }
        
        // Validar cabeceras requeridas (reducidas: solo obligatorias)
        const requiredHeaders = ["company", "date", "bruto", "coste_empresa"];
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

        // Procesar cada fila (usar processedData si hay mapeo)
        processedData.forEach((row: any, index: number) => {
          const rowNumber = index + 2;
          const errors: Array<{ field: string; message: string }> = [];
          const warnings: string[] = [];
          const missingFields: string[] = [];
          
          // Helper para leer el primer valor no vacío de varios alias
          const pick = (...keys: string[]) => {
            for (const k of keys) {
              const v = row[k];
              if (v != null && String(v).trim() !== "") return String(v).trim();
            }
            return "";
          };
          
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
          
          // 3. Leer campos con alias
          const employeeCode = pick(
            "employee_id",
            "employee_code",
            "codigo",
            "codigo_empleado"
          );
          
          const nameCandidate = pick(
            "name",
            "employee_name",
            "nombre",
            "nombre_empleado",
            "empleado",
            "trabajador",
            "full_name",
            "fullname",
            "nombre_y_apellidos"
          );
          
          const nifCandidate = pick(
            "nif",
            "employee_nif",
            "nif_empleado",
            "dni",
            "nie"
          );

          // 4. Construir objeto para validación
          const rawData = {
            employee_id: employeeCode,
            nif: nifCandidate.toUpperCase(),
            name: nameCandidate,
            company: normalizedCompany,
            date: normalizedDate,
            bruto: normalizedBruto,
            coste_empresa: normalizedCoste,
          };
          
          // 5. Detectar campos faltantes y validar que haya al menos un identificador
          if (!rawData.employee_id && !rawData.nif && !rawData.name) {
            warnings.push("Sin identificador (Código/NIF/Nombre). Mapea al menos uno.");
          }
          
          if (!employeeCode) missingFields.push("Código empleado");
          if (!nifCandidate) missingFields.push("NIF");
          if (!nameCandidate) missingFields.push("Nombre");
          if (!rawData.company) missingFields.push("company");
          if (!rawData.date) missingFields.push("date");
          
          // 6. Validar con Zod
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
          
          // 7. Detectar duplicados (usar identificador disponible preferente)
          const dupKeyBase = rawData.employee_id || rawData.nif || rawData.name;
          const key = `${dupKeyBase}-${rawData.date}`;
          const isDuplicate = seenKeys.has(key);
          if (isDuplicate && dupKeyBase) {
            duplicates++;
            warnings.push("Registro duplicado (mismo identificador + fecha)");
          }
          if (dupKeyBase) {
            seenKeys.add(key);
          }
          
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
