import type { AIParseResponse } from "@/lib/types/aiParse";
import { importEmployees, importCosts } from "../importService";
import { supabase } from "@/integrations/supabase/client";

interface TransformedRow {
  [key: string]: any;
}

/**
 * Transforma una fila según el mapeo ajustado por el usuario
 */
const transformRowWithMapping = (
  row: Record<string, any>,
  mapping: Record<string, string>
): TransformedRow => {
  const transformed: TransformedRow = {};

  for (const [originalColumn, targetField] of Object.entries(mapping)) {
    if (targetField === "ignored") continue;
    transformed[targetField] = row[originalColumn];
  }

  return transformed;
};

/**
 * Importa datos desde el resultado del análisis de IA
 */
export const importFromAIResult = async (
  aiResult: AIParseResponse,
  userAdjustments: Record<string, string>,
  period: string,
  fullDataset: Array<Record<string, any>>, // ✅ Dataset completo
  onProgress?: (current: number, total: number) => void
): Promise<{ employeesCreated: number; costsImported: number }> => {
  
  // Validar que hay datos
  if (!fullDataset || fullDataset.length === 0) {
    throw new Error("No hay datos para importar");
  }

  // Aplicar ajustes del usuario al mapeo
  const finalMapping = { ...aiResult.column_mapping, ...userAdjustments };

  // ✅ Transformar dataset COMPLETO (no solo preview)
  const transformedData = fullDataset.map((row) =>
    transformRowWithMapping(row, finalMapping)
  );

  // Obtener empresas
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name, nif");

  if (companiesError || !companies || companies.length === 0) {
    throw new Error("No se pudo obtener el catálogo de empresas");
  }

  let employeesCreated = 0;
  let costsImported = 0;

  // Detectar tipo y delegar a servicio correspondiente
  if (aiResult.detected_type === "employees") {
    // Mapear a estructura ParsedEmployee esperada por importEmployees
    const parsedEmployees = transformedData.map((d: any) => ({
      full_name: d.employee_name ?? d.name ?? "",
      company_name: d.company ?? "",
      hire_date: d.hire_date ?? "",
      dni: d.nif ?? d.employee_nif ?? undefined,
      termination_date: d.termination_date ?? undefined,
      seniority_date: d.seniority_date ?? undefined,
    })).filter((e: any) => e.full_name && e.company_name && e.hire_date);

    if (parsedEmployees.length === 0) {
      throw new Error("No hay filas válidas para empleados (faltan nombre/empresa/fecha de alta)");
    }

    const result = await importEmployees({
      employees: parsedEmployees as any[],
      companies: companies as any[],
      onProgress,
    });
    employeesCreated = result.created;
    
    // Actualizar annual_salary si la IA detectó el campo
    if (result.created > 0) {
      for (let i = 0; i < transformedData.length; i++) {
        const d = transformedData[i];
        const salaryValue = d.salary ?? d.annual_salary ?? d.salario_anual ?? d.salario;
        
        if (salaryValue) {
          const annualSalary = parseFloat(salaryValue);
          if (!isNaN(annualSalary) && annualSalary > 0) {
            const employeeName = d.employee_name ?? d.name;
            const companyName = d.company;
            
            // Buscar el employee_id creado
            const { data: employee } = await supabase
              .from("hr_employees")
              .select("id")
              .eq("full_name", employeeName)
              .eq("company_id", companies.find((c: any) => c.name === companyName)?.id)
              .maybeSingle();
            
            if (employee) {
              await supabase
                .from("hr_employees")
                .update({ annual_salary: annualSalary })
                .eq("id", employee.id);
            }
          }
        }
      }
    }
    
    console.info("Empleados importados:", { empleados: employeesCreated, total: fullDataset.length });
  } else if (aiResult.detected_type === "costs" || aiResult.detected_type === "payroll") {
    // Preparar validación mock (ya que los datos vienen validados por IA)
    const mockValidation = {
      rows: transformedData.map((data, i) => ({
        rowNumber: i + 1,
        data: {
          employee_id: data.employee_id ?? data.employee_code ?? data.codigo ?? data.codigo_empleado ?? undefined,
          nif: data.employee_nif || data.nif || undefined,
          name: data.employee_name || data.name || "",
          company: data.company || "",
          date: data.period || period || "",
          bruto: parseFloat(data.bruto) || 0,
          coste_empresa: parseFloat(data.coste_empresa) || 0,
        } as any,
        errors: [],
        warnings: [],
        isDuplicate: false,
        missingFields: [],
      })),
      validCount: transformedData.length,
      errorCount: 0,
      warningCount: 0,
      duplicates: 0,
      companies: new Map(
        aiResult.companies_detected.map((c) => [c.original, c.normalized])
      ),
    };

    const result = await importCosts({
      validation: mockValidation as any,
      companies: companies as any[],
      onProgress,
    });
    costsImported = result.imported;
  } else {
    // Tipo mixto: separar empleados de costes
    const employees = transformedData.filter((row) => row.hire_date || row.termination_date);
    const costs = transformedData.filter((row) => row.bruto && row.coste_empresa);

    if (employees.length > 0) {
      const empResult = await importEmployees({
        employees: employees as any[],
        companies: companies as any[],
        onProgress,
      });
      employeesCreated = empResult.created;
    }

    if (costs.length > 0) {
      const mockValidation = {
        rows: costs.map((data, i) => ({
          rowNumber: i + 1,
          data: {
            employee_id: data.employee_id ?? data.employee_code ?? data.codigo ?? data.codigo_empleado ?? undefined,
            nif: data.employee_nif || data.nif || undefined,
            name: data.employee_name || data.name || "",
            company: data.company || "",
            date: data.period || period || "",
            bruto: parseFloat(data.bruto) || 0,
            coste_empresa: parseFloat(data.coste_empresa) || 0,
          } as any,
          errors: [],
          warnings: [],
          isDuplicate: false,
          missingFields: [],
        })),
        validCount: costs.length,
        errorCount: 0,
        warningCount: 0,
        duplicates: 0,
        companies: new Map(
          aiResult.companies_detected.map((c) => [c.original, c.normalized])
        ),
      };

      const costResult = await importCosts({
        validation: mockValidation as any,
        companies: companies as any[],
        onProgress,
      });
      costsImported = costResult.imported;
    }
  }

  return { employeesCreated, costsImported };
};
