import { z } from "zod";

// Schema para validación de fila de costes en upload
export const uploadCostRowSchema = z.object({
  employee_id: z.string().optional(),
  nif: z.string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{8}[A-Z]$|^[XYZ][0-9]{7}[A-Z]$/i.test(val),
      { message: "Formato NIF/NIE inválido" }
    ),
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  company: z.string().min(1, "Empresa requerida"),
  date: z.string().regex(/^\d{4}-\d{2}$/, "Formato fecha debe ser YYYY-MM"),
  bruto: z.number().nonnegative("Bruto debe ser >= 0"),
  coste_empresa: z.number().nonnegative("Coste empresa debe ser >= 0"),
}).refine(
  (data) => data.nif || data.name,
  { message: "Debe proporcionar NIF o nombre", path: ["nif"] }
).refine(
  (data) => data.coste_empresa >= data.bruto,
  { message: "Coste empresa debe ser >= bruto", path: ["coste_empresa"] }
);

export type UploadCostRow = z.infer<typeof uploadCostRowSchema>;

// Tipos para datos parseados con metadata
export interface ParsedRow<T> {
  rowNumber: number;
  data: T | null;
  errors: Array<{ field: string; message: string }>;
  warnings: string[];
  isDuplicate: boolean;
  missingFields: string[];
  normalizedCompany?: string;
}

export interface UploadValidationResult<T> {
  rows: ParsedRow<T>[];
  validCount: number;
  errorCount: number;
  warningCount: number;
  duplicates: number;
  companies: Map<string, string>; // original -> normalized
}
