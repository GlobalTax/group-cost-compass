/**
 * Parser A3Nom modular - Orquestador principal
 * Reemplaza a3nomCostsParser.ts con arquitectura modular
 */

import Papa from "papaparse";
import { detectCompanyInfo, isValidNif } from "./companyDetector";
import { isValidEmployeeRow, validateNumericFields } from "./rowValidator";
import { parseNumber, parseNumericFields } from "./numberParser";
import { consolidateDuplicates } from "./consolidator";
import type {
  A3NomParseResult,
  ParsedA3NomCost,
  CompanyState,
  ValidationError,
  CompanySummary,
} from "./types";

// Re-exportar tipos para mantener compatibilidad
export type {
  A3NomParseResult,
  ParsedA3NomCost,
  CompanyState,
  ValidationError,
  CompanySummary,
} from "./types";

// Mapeo de columnas (índices) a campos
const COLUMN_MAPPING = {
  employee_code: 0,
  employee_name: 1,
  bruto: 2,
  coste_empresa: 3,
  sal_neto: 4,
  total_tc1: 5,
  irpf_dinero: 6,
  irpf_especie: 7,
  ss_trabajador: 8,
  ss_empresa: 9,
  anticipos: 10,
  embargos: 11,
  dto_preaviso: 12,
  dtos_varios: 13,
  prestamos: 14,
  dto_especial: 15,
  indemnizacion: 16,
  enf_acc: 17,
  bonificacion: 18,
  porcentaje_imputacion: 19,
};

/**
 * Parsea un archivo A3Nom completo con detección automática de empresas
 */
export const parseA3NomCostsFile = async (
  file: File
): Promise<A3NomParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: "\t",
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed = processA3NomRows(results.data);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Error parsing file: ${error.message}`));
      },
    });
  });
};

/**
 * Procesa las filas parseadas y extrae datos estructurados
 */
const processA3NomRows = (rows: any[]): A3NomParseResult => {
  const data: ParsedA3NomCost[] = [];
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  let currentCompany: CompanyState | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Detectar información de empresa
    const companyInfo = detectCompanyInfo(row);
    if (companyInfo) {
      if (!isValidNif(companyInfo.nif)) {
        warnings.push(`Fila ${i + 1}: NIF inválido ${companyInfo.nif}`);
      } else {
        currentCompany = companyInfo;
      }
      continue;
    }

    // Validar si es fila de empleado
    if (!isValidEmployeeRow(row)) {
      continue;
    }

    if (!currentCompany) {
      warnings.push(
        `Fila ${i + 1}: Empleado encontrado sin empresa asociada`
      );
      continue;
    }

    // Extraer datos del empleado
    const employeeCode = String(row[COLUMN_MAPPING.employee_code] || "").trim();
    const employeeName = String(row[COLUMN_MAPPING.employee_name] || "").trim();

    if (!employeeCode || !employeeName) {
      errors.push({
        row: i + 1,
        field: "employee_code/name",
        message: "Código o nombre de empleado vacío",
      });
      continue;
    }

    // Parsear campos numéricos
    const bruto = parseNumber(row[COLUMN_MAPPING.bruto]);
    const costeEmpresa = parseNumber(row[COLUMN_MAPPING.coste_empresa]);

    if (bruto === null || costeEmpresa === null) {
      errors.push({
        row: i + 1,
        field: "bruto/coste_empresa",
        message: "Valores numéricos requeridos inválidos",
      });
      continue;
    }

    // Validar coherencia numérica
    const numericErrors = validateNumericFields({
      bruto,
      coste_empresa: costeEmpresa,
    });
    if (numericErrors.length > 0) {
      numericErrors.forEach((msg) => {
        errors.push({ row: i + 1, field: "numeric", message: msg });
      });
      continue;
    }

    // Parsear campos opcionales
    const optionalFields = parseNumericFields(row, {
      sal_neto: COLUMN_MAPPING.sal_neto,
      total_tc1: COLUMN_MAPPING.total_tc1,
      irpf_dinero: COLUMN_MAPPING.irpf_dinero,
      irpf_especie: COLUMN_MAPPING.irpf_especie,
      ss_trabajador: COLUMN_MAPPING.ss_trabajador,
      ss_empresa: COLUMN_MAPPING.ss_empresa,
      anticipos: COLUMN_MAPPING.anticipos,
      embargos: COLUMN_MAPPING.embargos,
      dto_preaviso: COLUMN_MAPPING.dto_preaviso,
      dtos_varios: COLUMN_MAPPING.dtos_varios,
      prestamos: COLUMN_MAPPING.prestamos,
      dto_especial: COLUMN_MAPPING.dto_especial,
      indemnizacion: COLUMN_MAPPING.indemnizacion,
      enf_acc: COLUMN_MAPPING.enf_acc,
      bonificacion: COLUMN_MAPPING.bonificacion,
      porcentaje_imputacion: COLUMN_MAPPING.porcentaje_imputacion,
    });

    // Agregar registro
    data.push({
      employee_code: employeeCode,
      employee_name: employeeName,
      company_name: currentCompany.name,
      company_nif: currentCompany.nif,
      bruto,
      coste_empresa: costeEmpresa,
      ...optionalFields,
    });
  }

  // Consolidar duplicados
  const consolidated = consolidateDuplicates(data);

  // Generar resumen
  const summary = generateSummary(consolidated);

  return {
    data: consolidated,
    errors,
    warnings,
    summary,
  };
};

/**
 * Genera resumen estadístico de los datos parseados
 */
const generateSummary = (data: ParsedA3NomCost[]) => {
  const byCompany = new Map<string, CompanySummary>();

  for (const cost of data) {
    if (!byCompany.has(cost.company_nif)) {
      byCompany.set(cost.company_nif, {
        name: cost.company_name,
        nif: cost.company_nif,
        employees: 0,
        totalBruto: 0,
        totalCoste: 0,
      });
    }

    const summary = byCompany.get(cost.company_nif)!;
    summary.employees++;
    summary.totalBruto += cost.bruto;
    summary.totalCoste += cost.coste_empresa;
  }

  const companySummaries = Array.from(byCompany.values());

  return {
    totalRows: data.length,
    validRows: data.length,
    companiesDetected: byCompany.size,
    totalBruto: companySummaries.reduce((sum, c) => sum + c.totalBruto, 0),
    totalCoste: companySummaries.reduce((sum, c) => sum + c.totalCoste, 0),
    byCompany: companySummaries,
  };
};
