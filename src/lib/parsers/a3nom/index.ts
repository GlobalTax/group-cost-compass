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

// Mapeo de columnas (índices) a campos según formato real A3Nom
const COLUMN_MAPPING = {
  employee_code: 0,        // Código empleado (vacío o número)
  employee_name: 1,        // TRABAJADOR
  employee_nif: 2,         // N.I.F.
  tipo_paga: 3,            // TIPO PAGA (MENSUAL, FINIQUITO, etc.)
  fecha_cobro: 4,          // FECHA COBRO
  bruto: 5,                // BRUTO (mensual)
  bruto_anual: 6,          // BRUTO anualizado
  sal_neto: 7,             // SAL.NETO
  coste_empresa: 8,        // COSTE EMPR (mensual)
  coste_anual: 9,          // COSTE EMPR anualizado
  total_tc1: 10,           // TOTAL TC1
  irpf_dinero: 11,         // IRPF DIN
  alta_marca: 12,          // Alta (si/alta)
  irpf_especie: 13,        // IRPF ESP.
  ss_trabajador: 14,       // SS. TRAB
  ss_empresa: 15,          // SS EMPRESA
  anticipos: 16,           // ANTICIPOS
  embargos: 17,            // EMBARGOS
  dto_preaviso: 18,        // DTO PREAVI
  dtos_varios: 19,         // DTOS VARIO
  prestamos: 20,           // PRESTAMOS
  dto_especial: 21,        // DTO ESPECI
  indemnizacion: 22,       // INDEMNIZAC
  enf_acc: 23,             // ENF/ACC
  bonificacion: 24,        // BONIFIC
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

    // Filtrar solo nóminas mensuales (ignorar finiquitos, pagas extra, etc.)
    const tipoPaga = String(row[COLUMN_MAPPING.tipo_paga] || "").trim().toUpperCase();
    if (tipoPaga !== "MENSUAL") {
      continue;
    }

    // Extraer datos del empleado
    const employeeName = String(row[COLUMN_MAPPING.employee_name] || "").trim();
    const employeeNif = String(row[COLUMN_MAPPING.employee_nif] || "").trim();
    
    // El código puede estar en col 0 o extraerse del NIF como fallback
    let employeeCode = String(row[COLUMN_MAPPING.employee_code] || "").trim();
    if (!employeeCode || employeeCode.length < 2) {
      // Usar NIF como código si no hay código explícito
      employeeCode = employeeNif;
    }

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

    // Parsear campos opcionales (usar índices actualizados)
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
    });

    // Agregar registro con NIF incluido
    data.push({
      employee_code: employeeCode,
      employee_name: employeeName,
      employee_nif: employeeNif,
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
