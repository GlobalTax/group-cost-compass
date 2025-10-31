/**
 * Servicio de detección de transferencias
 * Identifica cambios de empresa en empleados para sugerir transferencias
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type EmployeeCost = Database['public']['Tables']['hr_employee_costs']['Row'];

export interface PotentialTransfer {
  employee_id: string;
  employee_name: string;
  from_company_id: string;
  from_company_name: string;
  to_company_id: string;
  to_company_name: string;
  detected_date: string;
  confidence: "high" | "medium" | "low";
}

interface CompanyCostSummary {
  company_id: string;
  periods: string[];
  last_period: string;
  total_costs: number;
}

/**
 * Detecta transferencias potenciales basándose en cambios de empresa en costes
 * 
 * Lógica: Si un empleado tiene costes en empresa A en período X
 * y luego en empresa B en período X+1, sugiere transferencia
 */
export async function detectPotentialTransfers(
  orgId: string,
  options?: {
    lookbackMonths?: number;
    minConfidence?: "high" | "medium" | "low";
  }
): Promise<PotentialTransfer[]> {
  const lookbackMonths = options?.lookbackMonths || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - lookbackMonths);
  const startPeriod = startDate.toISOString().substring(0, 7) + "-01";

  // 1. Obtener costes con empleados y empresas
  const { data: costsRaw, error } = await supabase
    .from("hr_employee_costs")
    .select(`
      id,
      employee_id,
      period,
      bruto,
      coste_empresa,
      hr_employees!inner (
        id,
        full_name,
        company_id,
        org_id,
        companies (
          id,
          name
        )
      )
    `)
    .eq("hr_employees.org_id", orgId)
    .gte("period", startPeriod)
    .order("period", { ascending: true });

  if (error || !costsRaw) {
    console.error("[TransferDetection] Error fetching costs:", error);
    return [];
  }

  // Simplificar tipos para evitar recursión
  const costs: any[] = costsRaw as any[];

  // 2. Agrupar costes por empleado y analizar cambios de empresa
  const employeeHistory = new Map<string, CompanyCostSummary[]>();

  for (const cost of costs) {
    const employeeId = cost.employee_id;
    const companyId = cost.hr_employees?.company_id;
    const period = cost.period;

    if (!employeeId || !companyId) continue;

    if (!employeeHistory.has(employeeId)) {
      employeeHistory.set(employeeId, []);
    }

    const history = employeeHistory.get(employeeId)!;
    let companySummary = history.find(h => h.company_id === companyId);

    if (!companySummary) {
      companySummary = {
        company_id: companyId,
        periods: [],
        last_period: period,
        total_costs: 0,
      };
      history.push(companySummary);
    }

    companySummary.periods.push(period);
    companySummary.last_period = period;
    companySummary.total_costs += cost.coste_empresa || 0;
  }

  // 3. Identificar cambios de empresa (transferencias potenciales)
  const potentialTransfers: PotentialTransfer[] = [];

  for (const [employeeId, history] of employeeHistory.entries()) {
    // Si solo hay una empresa, no hay transferencia
    if (history.length < 2) continue;

    // Ordenar por último período
    history.sort((a, b) => b.last_period.localeCompare(a.last_period));

    // Obtener info del empleado
    const employeeCost = costs.find(c => c.employee_id === employeeId);
    const employeeName = employeeCost?.hr_employees?.full_name || "Desconocido";

    // Detectar cambios consecutivos
    for (let i = 0; i < history.length - 1; i++) {
      const toCompany = history[i];
      const fromCompany = history[i + 1];

      // Obtener nombres de empresas
      const fromCompanyData = costs.find(
        c => c.employee_id === employeeId && c.hr_employees?.company_id === fromCompany.company_id
      );
      const toCompanyData = costs.find(
        c => c.employee_id === employeeId && c.hr_employees?.company_id === toCompany.company_id
      );

      const fromCompanyName = fromCompanyData?.hr_employees?.companies?.name || "Desconocida";
      const toCompanyName = toCompanyData?.hr_employees?.companies?.name || "Desconocida";

      // Calcular confianza basada en:
      // - Número de períodos en cada empresa
      // - Costes totales
      let confidence: "high" | "medium" | "low" = "medium";

      if (toCompany.periods.length >= 3 && fromCompany.periods.length >= 3) {
        confidence = "high";
      } else if (toCompany.periods.length === 1 || fromCompany.periods.length === 1) {
        confidence = "low";
      }

      potentialTransfers.push({
        employee_id: employeeId,
        employee_name: employeeName,
        from_company_id: fromCompany.company_id,
        from_company_name: fromCompanyName,
        to_company_id: toCompany.company_id,
        to_company_name: toCompanyName,
        detected_date: toCompany.last_period,
        confidence,
      });
    }
  }

  // 4. Filtrar por confianza si se especifica
  if (options?.minConfidence) {
    const confidenceLevels = { low: 0, medium: 1, high: 2 };
    const minLevel = confidenceLevels[options.minConfidence];

    return potentialTransfers.filter(
      t => confidenceLevels[t.confidence] >= minLevel
    );
  }

  return potentialTransfers;
}

/**
 * Verifica si una transferencia ya fue registrada
 * 
 * @returns true si ya existe, false en caso contrario
 */
export async function isTransferAlreadyRecorded(
  employeeId: string,
  fromCompanyId: string,
  toCompanyId: string,
  transferDate: string
): Promise<boolean> {
  try {
    // @ts-ignore - Evitar inferencia recursiva de tipos de Supabase
    const { data, error } = await supabase
      .from("hr_transfers")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("from_company_id", fromCompanyId)
      .eq("to_company_id", toCompanyId)
      .gte("transfer_date", transferDate)
      .limit(1);

    if (error) {
      console.error("[TransferDetection] Error checking transfer:", error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("[TransferDetection] Exception checking transfer:", error);
    return false;
  }
}
