import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/formatters";
import { supabase } from "@/lib/supabase/client";

/**
 * Exportar compensación completa de un empleado por año fiscal
 */
export async function exportEmployeeCompensation(employeeId: string, year: number) {
  // Fetch employee data
  const { data: employee } = await supabase
    .from("hr_employees")
    .select("*, companies(name)")
    .eq("id", employeeId)
    .single();

  if (!employee) throw new Error("Empleado no encontrado");

  // Fetch costs for the year
  const { data: costs } = await supabase
    .from("hr_employee_costs")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("period", `${year}-01-01`)
    .lte("period", `${year}-12-31`)
    .order("period");

  // Fetch bonus payments for the year
  const { data: bonusPayments } = await supabase
    .from("bonus_payments")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("payment_date", `${year}-01-01`)
    .lte("payment_date", `${year}-12-31`)
    .order("payment_date");

  // Fetch deals with participation
  const { data: dealParticipations } = await supabase
    .from("deal_participants")
    .select("*, deals(*)")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen
  // Calcular salario base anual desde los costes del año
  const baseSalaryAnnual = costs?.reduce((sum, c) => sum + Number(c.bruto || 0), 0) || 0;
  const perfBonus = bonusPayments?.filter((b) => b.bonus_type === "performance").reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const successFees = bonusPayments?.filter((b) => b.bonus_type === "success_fee").reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const extraBonus = bonusPayments?.filter((b) => b.bonus_type === "extraordinary").reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const totalBonus = perfBonus + successFees + extraBonus;
  const totalComp = baseSalaryAnnual + totalBonus;

  const summaryData = [
    ["Compensación Individual - Año " + year],
    [],
    ["Empleado", employee.full_name || ""],
    ["DNI", employee.dni || ""],
    ["Empresa", employee.companies?.name || ""],
    ["Nivel", employee.compensation_level || ""],
    [],
    ["RESUMEN ANUAL"],
    ["Concepto", "Importe"],
    ["Salario Base Anual", baseSalaryAnnual.toFixed(2)],
    ["Bonus Desempeño", perfBonus.toFixed(2)],
    ["Success Fees", successFees.toFixed(2)],
    ["Bonus Extraordinario", extraBonus.toFixed(2)],
    ["TOTAL BONUS", totalBonus.toFixed(2)],
    ["COMPENSACIÓN TOTAL", totalComp.toFixed(2)],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen");

  // Sheet 2: Desglose mensual de costes
  const costsData = [
    ["Desglose Mensual de Costes - " + year],
    [],
    ["Mes", "Salario Bruto", "Coste Empresa", "Notas"],
  ];

  costs?.forEach((cost) => {
    costsData.push([
      format(new Date(cost.period), "MMMM yyyy", { locale: es }),
      Number(cost.bruto || 0).toFixed(2),
      Number(cost.coste_empresa || 0).toFixed(2),
      "",
    ]);
  });

  // Totales
  const totalBruto = costs?.reduce((sum, c) => sum + Number(c.bruto || 0), 0) || 0;
  const totalCoste =
    costs?.reduce((sum, c) => sum + Number(c.coste_empresa || 0), 0) || 0;

  costsData.push([], ["TOTAL", totalBruto.toFixed(2), totalCoste.toFixed(2), ""]);

  const costsSheet = XLSX.utils.aoa_to_sheet(costsData);
  costsSheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, costsSheet, "Costes Mensuales");

  // Sheet 3: Bonus por tipo
  const bonusData = [
    ["Histórico de Bonus - " + year],
    [],
    ["Fecha", "Tipo", "Importe", "Deal/Período", "Estado", "Notas"],
  ];

  bonusPayments?.forEach((bonus) => {
    bonusData.push([
      bonus.payment_date ? format(new Date(bonus.payment_date), "dd/MM/yyyy") : "",
      bonus.bonus_type === "performance"
        ? "Desempeño"
        : bonus.bonus_type === "success_fee"
          ? "Success Fee"
          : "Extraordinario",
      Number(bonus.amount).toFixed(2),
      bonus.deal_id || `FY${bonus.fiscal_year}`,
      "Registrado",
      bonus.notes || "",
    ]);
  });

  const bonusSheet = XLSX.utils.aoa_to_sheet(bonusData);
  bonusSheet["!cols"] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, bonusSheet, "Bonus");

  // Sheet 4: Deals cerrados con participación
  const dealsData = [
    ["Deals con Participación - " + year],
    [],
    ["Deal", "Cliente", "Estado", "Honorarios", "Rol", "% Part.", "Bonus"],
  ];

  dealParticipations
    ?.filter((dp) => dp.deals)
    .forEach((dp) => {
      const deal: any = dp.deals;
      dealsData.push([
        deal?.deal_name || "",
        deal?.client_name || "",
        deal.status === "won" || deal.status === "closed"
          ? "Ganado"
          : deal.status === "lost"
            ? "Perdido"
            : deal.status === "active"
              ? "Activo"
          : "Pipeline",
        Number(deal?.total_fees || 0).toFixed(2),
        dp.role_in_deal || "",
        Number(dp.participation_pct || 0).toFixed(1) + "%",
        Number(dp.bonus_amount || 0).toFixed(2),
      ]);
    });

  const dealsSheet = XLSX.utils.aoa_to_sheet(dealsData);
  dealsSheet["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, dealsSheet, "Deals");

  // Export
  const fileName = `compensacion_${employee.full_name?.replace(/\s/g, "_")}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exportar reporte de un deal específico
 */
export async function exportDealReport(dealId: string) {
  // Fetch deal
  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();

  if (!deal) throw new Error("Deal no encontrado");

  // Fetch participants
  const { data: participants } = await supabase
    .from("deal_participants")
    .select("*, hr_employees(name, current_salary, compensation_level)")
    .eq("deal_id", dealId)
    .order("participation_pct", { ascending: false });

  const wb = XLSX.utils.book_new();

  // Sheet 1: Información del Deal
  const dealInfoData = [
    ["Reporte de Deal"],
    [],
    ["Deal", deal.deal_name || ""],
    ["Cliente", deal.client_name || ""],
    ["Estado", deal.status || ""],
    ["Fecha Cierre", deal.close_date ? format(new Date(deal.close_date), "dd/MM/yyyy") : ""],
    [],
    ["FINANCIERO"],
    ["Honorarios Totales", Number(deal.total_fees || 0).toFixed(2)],
    ["Pool Success Fee", Number(deal.success_fee_pool || 0).toFixed(2)],
    ["% Pool", deal.total_fees ? ((Number(deal.success_fee_pool || 0) / Number(deal.total_fees)) * 100).toFixed(1) + "%" : "0%"],
    [],
    ["Notas", deal.notes || ""],
  ];

  const dealInfoSheet = XLSX.utils.aoa_to_sheet(dealInfoData);
  dealInfoSheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, dealInfoSheet, "Info Deal");

  // Sheet 2: Participantes y distribución
  const participantsData = [
    ["Participantes del Deal"],
    [],
    ["Nombre", "Nivel", "Rol en Deal", "% Part.", "Bonus Calculado", "Salario Mensual"],
  ];

  let totalPct = 0;
  let totalBonus = 0;

  participants?.forEach((p) => {
    const employee: any = p.hr_employees;
    totalPct += Number(p.participation_pct || 0);
    totalBonus += Number(p.bonus_amount || 0);

    participantsData.push([
      employee?.full_name || "",
      employee?.compensation_level || "",
      p.role_in_deal || "",
      Number(p.participation_pct || 0).toFixed(1) + "%",
      Number(p.bonus_amount || 0).toFixed(2),
      "N/A", // Salario no disponible aquí
    ]);
  });

  participantsData.push(
    [],
    ["TOTALES", "", "", totalPct.toFixed(1) + "%", totalBonus.toFixed(2), ""]
  );

  // Validación
  participantsData.push(
    [],
    ["VALIDACIÓN"],
    ["Total % Participación", totalPct.toFixed(1) + "%", totalPct <= 100 ? "✓ OK" : "⚠ Excede 100%"],
    ["Total Bonus vs Pool", totalBonus.toFixed(2), totalBonus <= Number(deal.success_fee_pool || 0) ? "✓ OK" : "⚠ Excede pool"]
  );

  const participantsSheet = XLSX.utils.aoa_to_sheet(participantsData);
  participantsSheet["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, participantsSheet, "Participantes");

  // Sheet 3: Coste del equipo vs Fee
  const costData = [
    ["Análisis Coste del Equipo"],
    [],
    ["Nombre", "Salario Mensual", "Meses Dedicados (est.)", "Coste Equipo"],
  ];

  let totalTeamCost = 0;

  participants?.forEach((p) => {
    const employee: any = p.hr_employees;
    // Sin acceso directo a salario, usamos estimación simple
    const estimatedMonthlySalary = 0; // No disponible en este contexto
    const estimatedMonths = 3;
    const teamCost = estimatedMonthlySalary * estimatedMonths;
    totalTeamCost += teamCost;

    costData.push([
      employee?.full_name || "",
      "N/A",
      estimatedMonths.toString(),
      teamCost > 0 ? teamCost.toFixed(2) : "N/A",
    ]);
  });

  const totalFees = Number(deal.total_fees || 0);
  const totalCost = totalTeamCost + totalBonus;
  const margin = totalFees - totalCost;
  const marginPct = totalFees > 0 ? (margin / totalFees) * 100 : 0;

  costData.push(
    [],
    ["TOTAL COSTE EQUIPO", "", "", totalTeamCost.toFixed(2)],
    [],
    ["MARGEN ANÁLISIS"],
    ["Honorarios Totales", totalFees.toFixed(2)],
    ["Coste Equipo (est.)", totalTeamCost.toFixed(2)],
    ["Bonus Pagado", totalBonus.toFixed(2)],
    ["Coste Total (Equipo + Bonus)", totalCost.toFixed(2)],
    ["Margen Bruto", margin.toFixed(2)],
    ["% Margen", marginPct.toFixed(1) + "%"],
  );

  const costSheet = XLSX.utils.aoa_to_sheet(costData);
  costSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, costSheet, "Coste Equipo");

  // Export
  const fileName = `deal_${deal.deal_name?.replace(/\s/g, "_")}_${format(new Date(), "yyyyMMdd")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exportar resumen consolidado de compensación por año fiscal
 */
export async function exportCompensationSummary(year: number) {
  // Fetch all active employees
  const { data: employees } = await supabase
    .from("hr_employees")
    .select("*, companies(name)")
    .order("name");

  if (!employees) throw new Error("No se encontraron empleados");

  // Fetch all costs for the year
  const { data: allCosts } = await supabase
    .from("hr_employee_costs")
    .select("*")
    .gte("period", `${year}-01-01`)
    .lte("period", `${year}-12-31`);

  // Fetch all bonus payments for the year
  const { data: allBonusPayments } = await supabase
    .from("bonus_payments")
    .select("*")
    .gte("payment_date", `${year}-01-01`)
    .lte("payment_date", `${year}-12-31`);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen por empleado
  const summaryData = [
    ["Resumen de Compensación - Año " + year],
    [],
    [
      "Empleado",
      "Empresa",
      "Nivel",
      "Salario Base Anual",
      "Bonus Desempeño",
      "Success Fees",
      "Bonus Extra",
      "Total Bonus",
      "Compensación Total",
      "% Variable",
    ],
  ];

  let totalBaseSalary = 0;
  let totalPerformanceBonus = 0;
  let totalSuccessFees = 0;
  let totalExtraBonus = 0;
  let totalBonus = 0;
  let totalCompensation = 0;

  employees.forEach((emp) => {
    // Calcular salario base anual desde los costes del año
    const empCosts = allCosts?.filter((c) => c.employee_id === emp.id);
    const baseSalaryAnnual =
      empCosts && empCosts.length > 0
        ? empCosts.reduce((sum, c) => sum + Number(c.bruto || 0), 0)
        : 0;

    // Calcular bonus por tipo
    const empBonus = allBonusPayments?.filter((b) => b.employee_id === emp.id) || [];
    const perfBonus = empBonus
      .filter((b) => b.bonus_type === "performance")
      .reduce((sum, b) => sum + Number(b.amount), 0);
    const successFees = empBonus
      .filter((b) => b.bonus_type === "success_fee")
      .reduce((sum, b) => sum + Number(b.amount), 0);
    const extraBonus = empBonus
      .filter((b) => b.bonus_type === "extraordinary")
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const empTotalBonus = perfBonus + successFees + extraBonus;
    const empTotalCompensation = baseSalaryAnnual + empTotalBonus;
    const variablePct = baseSalaryAnnual > 0 ? (empTotalBonus / baseSalaryAnnual) * 100 : 0;

    summaryData.push([
      emp.full_name || "",
      emp.companies?.name || "",
      emp.compensation_level || "",
      baseSalaryAnnual.toFixed(2),
      perfBonus.toFixed(2),
      successFees.toFixed(2),
      extraBonus.toFixed(2),
      empTotalBonus.toFixed(2),
      empTotalCompensation.toFixed(2),
      variablePct.toFixed(1) + "%",
    ]);

    totalBaseSalary += baseSalaryAnnual;
    totalPerformanceBonus += perfBonus;
    totalSuccessFees += successFees;
    totalExtraBonus += extraBonus;
    totalBonus += empTotalBonus;
    totalCompensation += empTotalCompensation;
  });

  const avgEmployees = employees.length || 1;
  const avgVariablePct = totalBaseSalary > 0 ? (totalBonus / totalBaseSalary) * 100 : 0;

  // Totales y promedios
  summaryData.push(
    [],
    [
      "TOTALES",
      "",
      "",
      totalBaseSalary.toFixed(2),
      totalPerformanceBonus.toFixed(2),
      totalSuccessFees.toFixed(2),
      totalExtraBonus.toFixed(2),
      totalBonus.toFixed(2),
      totalCompensation.toFixed(2),
      avgVariablePct.toFixed(1) + "%",
    ],
    [
      "PROMEDIOS",
      "",
      "",
      (totalBaseSalary / avgEmployees).toFixed(2),
      (totalPerformanceBonus / avgEmployees).toFixed(2),
      (totalSuccessFees / avgEmployees).toFixed(2),
      (totalExtraBonus / avgEmployees).toFixed(2),
      (totalBonus / avgEmployees).toFixed(2),
      (totalCompensation / avgEmployees).toFixed(2),
      "",
    ]
  );

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen");

  // Sheet 2: KPIs globales
  const kpiData = [
    ["KPIs de Compensación - Año " + year],
    [],
    ["Métrica", "Valor"],
    ["Número de Empleados", employees.length.toString()],
    ["Masa Salarial Anual", totalBaseSalary.toFixed(2)],
    ["Total Variable Pagado", totalBonus.toFixed(2)],
    ["% Variable sobre Fijo", avgVariablePct.toFixed(1) + "%"],
    [],
    ["Desglose Variable"],
    ["Bonus Desempeño", totalPerformanceBonus.toFixed(2)],
    ["Success Fees", totalSuccessFees.toFixed(2)],
    ["Bonus Extraordinario", totalExtraBonus.toFixed(2)],
    [],
    ["Compensación Total Anual", totalCompensation.toFixed(2)],
    ["Compensación Media por Empleado", (totalCompensation / avgEmployees).toFixed(2)],
  ];

  const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
  kpiSheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, kpiSheet, "KPIs");

  // Export
  const fileName = `resumen_compensacion_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
