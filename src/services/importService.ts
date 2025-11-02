/**
 * Servicio de importación centralizado
 * Extrae toda la lógica de negocio de Upload.tsx
 */

import { supabase } from "@/integrations/supabase/client";
import type { UploadCostRow, UploadValidationResult } from "@/lib/validators/uploadSchema";
import type { ParsedEmployee } from "@/lib/parsers/employeeParser";
import { IMPORT } from "@/lib/constants";

export interface ImportEmployeesOptions {
  employees: ParsedEmployee[];
  companies: Array<{ id: string; name: string }>;
  onProgress?: (current: number, total: number) => void;
}

export interface ImportCostsOptions {
  validation: UploadValidationResult<UploadCostRow>;
  companies: Array<{ id: string; name: string }>;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Importa empleados verificando que las empresas existan
 */
export const importEmployees = async ({
  employees,
  companies,
  onProgress,
}: ImportEmployeesOptions) => {
  const results = { created: 0, errors: [] as string[] };

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const company = companies.find((c) => c.name === emp.company_name);

    if (!company) {
      results.errors.push(`Empresa no encontrada: ${emp.company_name}`);
      continue;
    }

    try {
      const { error } = await supabase.from("hr_employees").insert({
        full_name: emp.full_name,
        dni: emp.dni || null,
        company_id: company.id,
        hire_date: emp.hire_date,
        termination_date: emp.termination_date || null,
        seniority_date: emp.seniority_date || null,
        transfer_group: emp.transfer_group || false,
        notes: emp.notes || null,
      });

      if (error) throw error;
      results.created++;
    } catch (error) {
      results.errors.push(`Error al crear ${emp.full_name}: ${(error as Error).message}`);
    }

    onProgress?.(i + 1, employees.length);
  }

  return results;
};

/**
 * Normaliza nombres de empleados para matching
 */
const normalizeEmployeeName = (name: string): string => {
  let normalized = name.trim();
  
  // Detectar formato "Apellidos, Nombre" e invertir
  if (normalized.includes(',')) {
    const [apellidos, nombre] = normalized.split(',').map(s => s.trim());
    normalized = `${nombre} ${apellidos}`;
  }
  
  // Normalizar: lowercase + sin acentos
  return normalized
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Tokeniza un nombre eliminando signos, acentos y stopwords comunes; colapsa espacios
const tokenizeName = (name: string): string[] => {
  const STOPWORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "da", "do", "das", "dos"]);
  const cleaned = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[.,;:()"'`]/g, " ") // quitar puntuación
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .split(" ")
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));
};

// Canonicaliza el nombre para matching insensible a orden y acentos
const canonicalizeName = (name: string): string => {
  // Reordenar si viene como "Apellidos, Nombre"
  let base = name.trim();
  if (base.includes(',')) {
    const [last, first] = base.split(',').map((s) => s.trim());
    base = `${first} ${last}`;
  }
  const tokens = tokenizeName(base);
  return tokens.sort().join(" ");
};

/**
 * Mapea NIFs o nombres a employee_ids desde la base de datos
 */
export const mapEmployeeIdentifier = async (
  identifiers: string[],
  useNames = false,
  options?: { companyByIdentifier?: Map<string, string> }
): Promise<Map<string, string>> => {
  if (useNames) {
    // Buscar por nombre con canonicalización y posible scope por empresa
    const canonicalByIdentifier = new Map<string, string>();
    identifiers.forEach((id) => canonicalByIdentifier.set(id, canonicalizeName(id)));

    const { data: employees } = await supabase
      .from("hr_employees")
      .select("id, full_name, company_id");

    const byCanonicalAndCompany = new Map<string, string>(); // key: canonical|companyId -> employeeId
    const byCanonical = new Map<string, Array<{ id: string; company_id: string }>>();

    employees?.forEach((e) => {
      const canon = canonicalizeName(e.full_name);
      const comp = e.company_id as unknown as string;
      if (comp) byCanonicalAndCompany.set(`${canon}|${comp}`, e.id);
      const arr = byCanonical.get(canon) || [];
      arr.push({ id: e.id, company_id: comp });
      byCanonical.set(canon, arr);
    });

    const map = new Map<string, string>();
    let exactScoped = 0;
    let uniqueGlobal = 0;

    identifiers.forEach((original) => {
      const canon = canonicalByIdentifier.get(original)!;
      const companyId = options?.companyByIdentifier?.get(original);

      if (companyId) {
        const key = `${canon}|${companyId}`;
        const eid = byCanonicalAndCompany.get(key);
        if (eid) {
          map.set(original, eid);
          exactScoped++;
          return;
        }
      }

      const matches = byCanonical.get(canon) || [];
      if (matches.length === 1) {
        map.set(original, matches[0].id);
        uniqueGlobal++;
      }
      // si >1, ambigüo; si 0, no encontrado → no mapear
    });

    console.log(
      `🔎 Matching nombres → scoped: ${exactScoped}, unicos global: ${uniqueGlobal}, total identifiers: ${identifiers.length}`
    );

    return map;
  } else {
    // Buscar por NIF (comportamiento original)
    const { data: employees } = await supabase
      .from("hr_employees")
      .select("id, dni")
      .in("dni", identifiers);

    return new Map(employees?.map((e) => [e.dni, e.id]) || []);
  }
};

/**
 * Verifica si ya existen costes para los períodos dados
 */
export const checkDuplicatePeriods = async (
  periods: string[]
): Promise<boolean> => {
  const { data: existing } = await supabase
    .from("hr_employee_costs")
    .select("period")
    .in("period", periods)
    .limit(1);

  return !!existing && existing.length > 0;
};

/**
 * Importa costes en lotes con manejo de duplicados
 */
export const importCosts = async ({
  validation,
  companies,
  onProgress,
}: ImportCostsOptions) => {
  // Filtrar solo filas válidas
  const validRows = validation.rows
    .filter((r) => r.data && r.errors.length === 0)
    .map((r) => r.data!);

  if (validRows.length === 0) {
    throw new Error("No hay datos válidos para importar");
  }

  // Mapa de empresa (nombre→id)
  const companyByName = new Map<string, string>(
    companies.map((c) => [c.name.toLowerCase().trim(), c.id])
  );

  // Soporte de código de empleado (employee_id/employee_code)
  const hasCode = validRows.some(
    (r) => typeof (r as any).employee_id === "string" && ((r as any).employee_id || "").trim() !== ""
  );

  if (hasCode) {
    console.log("🔍 Debug importCosts (codes) - Primera fila:", validRows[0]);
    const codes = Array.from(
      new Set(
        validRows
          .map((r) => ((((r as any).employee_id as string) || "").trim()))
          .filter(Boolean)
      )
    );

    if (codes.length === 0) {
      throw new Error("Ningún código de empleado válido detectado en el archivo (columna vacía)");
    }

    const { data: emps, error: empErr } = await supabase
      .from("hr_employees")
      .select("id, employee_code, company_id")
      .in("employee_code", codes);

    if (empErr) throw empErr;

    const byCode = new Map<string, Array<{ id: string; company_id: string }>>();
    const byCodeAndCompany = new Map<string, string>(); // code|companyId -> employeeId

    emps?.forEach((e: any) => {
      const code = (e.employee_code || "").trim();
      const comp = (e.company_id as string) || "";
      if (!code) return;
      const arr = byCode.get(code) || [];
      arr.push({ id: e.id, company_id: comp });
      byCode.set(code, arr);
      if (comp) byCodeAndCompany.set(`${code}|${comp}`, e.id);
    });

    const matchedCodes = new Set<string>();

    const costsToImportCode = validRows
      .map((r) => {
        const code = ((((r as any).employee_id as string) || "").trim());
        if (!code) return null;
        const compName = (r.company as string | undefined)?.toLowerCase().trim();
        const compId = compName ? companyByName.get(compName) : undefined;

        if (compId) {
          const eid = byCodeAndCompany.get(`${code}|${compId}`);
          if (eid) {
            matchedCodes.add(code);
            return {
              employee_id: eid,
              period: `${r.date}-01`,
              bruto: r.bruto,
              coste_empresa: r.coste_empresa,
            };
          }
        }
        const matches = byCode.get(code) || [];
        if (matches.length === 1) {
          matchedCodes.add(code);
          return {
            employee_id: matches[0].id,
            period: `${r.date}-01`,
            bruto: r.bruto,
            coste_empresa: r.coste_empresa,
          };
        }
        return null; // 0 o ambiguo
      })
      .filter(Boolean) as Array<{ employee_id: string; period: string; bruto: number; coste_empresa: number }>;

    if (costsToImportCode.length === 0) {
      const sampleMissing = codes.filter((c) => !matchedCodes.has(c)).slice(0, 5);
      const diagnostic = sampleMissing.length
        ? ` Ejemplos: ${sampleMissing.join(" | ")}`
        : " (los códigos llegan vacíos o no coinciden con employee_code en BD)";
      throw new Error(
        `Ningún empleado encontrado con los códigos proporcionados.${diagnostic} \nSugerencia: verifica que la columna 'Código empleado' esté mapeada a employee_id y que 'Empresa' coincida con el catálogo.`
      );
    }

    // Verificar duplicados
    const periods = [...new Set(costsToImportCode.map((c) => c.period))];
    const hasDuplicates = await checkDuplicatePeriods(periods);

    if (hasDuplicates) {
      const confirmed = window.confirm(
        "Ya existen costes para algunos períodos. ¿Desea sobrescribir?"
      );
      if (!confirmed) {
        throw new Error("Importación cancelada por el usuario");
      }

      await supabase
        .from("hr_employee_costs")
        .delete()
        .in("period", periods);
    }

    const { BATCH_SIZE } = IMPORT;
    for (let i = 0; i < costsToImportCode.length; i += BATCH_SIZE) {
      const batch = costsToImportCode.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("hr_employee_costs").insert(batch);
      if (error) throw error;
      onProgress?.(Math.min(i + BATCH_SIZE, costsToImportCode.length), costsToImportCode.length);
    }

    return { imported: costsToImportCode.length, total: validRows.length };
  }

  // Detectar si tenemos NIFs o solo nombres
  const hasNif = validRows.some((r) => r.nif && typeof r.nif === "string" && r.nif.trim() !== "");
  const useNames = !hasNif;

  console.log("🔍 Debug importCosts - Primera fila:", validRows[0]);
  console.log("🔍 hasCode:", hasCode, "hasNif:", hasNif, "useNames:", useNames);

  // Mapa de identificador→empresaId cuando usemos nombres
  const companyByIdentifier = new Map<string, string>();
  if (useNames) {
    validRows.forEach((r) => {
      const compName = (r.company as string | undefined)?.toLowerCase().trim();
      const identifier = (r.name as string) || "";
      if (identifier && compName && companyByName.has(compName)) {
        companyByIdentifier.set(identifier, companyByName.get(compName)!);
      }
    });
  }

  // Obtener identificadores (NIFs o nombres)
  const identifiers = validRows.map((r) => (useNames ? (r.name || "") : (r.nif || "")));
  const employeeMap = await mapEmployeeIdentifier(identifiers, useNames, { companyByIdentifier });

  // Preparar costes
  const costsToImport = validRows
    .filter((r) => {
      const identifier = useNames ? r.name : r.nif!;
      return employeeMap.has(identifier);
    })
    .map((r) => {
      const identifier = useNames ? r.name : r.nif!;
      return {
        employee_id: employeeMap.get(identifier)!,
        period: `${r.date}-01`, // Normalizar a primer día del mes
        bruto: r.bruto,
        coste_empresa: r.coste_empresa,
      };
    });

  if (costsToImport.length === 0) {
    const nonEmptyMissing = identifiers
      .filter((id) => (id ?? "").toString().trim() !== "" && !employeeMap.has(id))
      .slice(0, 5);
    const hadAnyNonEmpty = identifiers.some((id) => (id ?? "").toString().trim() !== "");
    const diagnostic = nonEmptyMissing.length
      ? ` Ejemplos: ${nonEmptyMissing.join(" | ")}`
      : hadAnyNonEmpty
      ? ""
      : " (los identificadores llegan vacíos; revisa el mapeo de columnas)";
    const errorMsg = useNames
      ? `Ningún empleado encontrado con los nombres proporcionados.${diagnostic} \nSugerencia: asigna la columna de nombres correctamente o mapea 'Código empleado' / NIF.`
      : `Ningún empleado encontrado con los NIFs proporcionados${diagnostic}`;
    throw new Error(errorMsg);
  }

  // Verificar duplicados
  const periods = [...new Set(costsToImport.map((c) => c.period))];
  const hasDuplicates = await checkDuplicatePeriods(periods);

  if (hasDuplicates) {
    const confirmed = window.confirm(
      "Ya existen costes para algunos períodos. ¿Desea sobrescribir?"
    );
    if (!confirmed) {
      throw new Error("Importación cancelada por el usuario");
    }

    // Eliminar costes existentes
    await supabase
      .from("hr_employee_costs")
      .delete()
      .in("period", periods);
  }

  // Importar en lotes
  const { BATCH_SIZE } = IMPORT;
  for (let i = 0; i < costsToImport.length; i += BATCH_SIZE) {
    const batch = costsToImport.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("hr_employee_costs").insert(batch);

    if (error) throw error;
    onProgress?.(Math.min(i + BATCH_SIZE, costsToImport.length), costsToImport.length);
  }

  return { imported: costsToImport.length, total: validRows.length };
};
