import { useMemo } from "react";
import { useCostsByPeriod } from "./useEmployeeCosts";
import { formatPeriod } from "@/lib/formatters";

interface CostsAnalysisFilters {
  companyId?: string;
  year: number;
  month: number;
}

interface EmployeeDetail {
  id: string;
  name: string;
  company: string;
  bruto: number;
  costeEmpresa: number;
  variation: number;
}

interface ChartDataPoint {
  month: string;
  bruto: number;
  coste: number;
  employees: number;
}

interface CostsAnalysisResult {
  totalCost: number;
  activeEmployees: number;
  avgCostPerEmployee: number;
  variationVsPreviousMonth: number;
  chartData: ChartDataPoint[];
  employeeDetails: EmployeeDetail[];
  hasData: boolean;
  isLoading: boolean;
}

export const useCostsAnalysis = (filters: CostsAnalysisFilters): CostsAnalysisResult => {
  const { year, month, companyId } = filters;

  // Datos del mes actual
  const { data: currentMonthData, isLoading: isLoadingCurrent } = useCostsByPeriod({
    year,
    month,
    companyId: companyId !== "all" ? companyId : undefined,
  });

  // Datos del mes anterior
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const { data: previousMonthData } = useCostsByPeriod({
    year: previousYear,
    month: previousMonth,
    companyId: companyId !== "all" ? companyId : undefined,
  });

  // Datos de los últimos 12 meses para el gráfico
  const { data: yearData, isLoading: isLoadingYear } = useCostsByPeriod({
    year,
    companyId: companyId !== "all" ? companyId : undefined,
  });

  const analysis = useMemo(() => {
    if (!currentMonthData) {
      return {
        totalCost: 0,
        activeEmployees: 0,
        avgCostPerEmployee: 0,
        variationVsPreviousMonth: 0,
        chartData: [],
        employeeDetails: [],
        hasData: false,
        isLoading: isLoadingCurrent || isLoadingYear,
      };
    }

    // Calcular KPIs del mes actual
    const totalBruto = currentMonthData.reduce((sum, cost) => sum + (cost.bruto || 0), 0);
    const totalCoste = currentMonthData.reduce((sum, cost) => sum + (cost.coste_empresa || 0), 0);
    const activeEmployees = new Set(currentMonthData.map(c => c.employee_id)).size;
    const avgCostPerEmployee = activeEmployees > 0 ? totalCoste / activeEmployees : 0;

    // Calcular variación vs mes anterior
    const previousTotalCoste = previousMonthData?.reduce((sum, cost) => sum + (cost.coste_empresa || 0), 0) || 0;
    const variationVsPreviousMonth = previousTotalCoste > 0
      ? ((totalCoste - previousTotalCoste) / previousTotalCoste) * 100
      : 0;

    // Preparar datos para el gráfico (últimos 12 meses)
    const chartData: ChartDataPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const targetMonth = month - i;
      const targetYear = targetMonth <= 0 ? year - 1 : year;
      const adjustedMonth = targetMonth <= 0 ? 12 + targetMonth : targetMonth;
      
      const monthData = yearData?.filter(cost => {
        const costDate = new Date(cost.period);
        return costDate.getMonth() + 1 === adjustedMonth && costDate.getFullYear() === targetYear;
      }) || [];

      const monthBruto = monthData.reduce((sum, cost) => sum + (cost.bruto || 0), 0);
      const monthCoste = monthData.reduce((sum, cost) => sum + (cost.coste_empresa || 0), 0);
      const monthEmployees = new Set(monthData.map(c => c.employee_id)).size;

      const date = new Date(targetYear, adjustedMonth - 1, 1);
      const monthLabel = date.toLocaleDateString("es-ES", { month: "short", year: "numeric" });

      chartData.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        bruto: monthBruto,
        coste: monthCoste,
        employees: monthEmployees,
      });
    }

    // Preparar detalle por empleado
    const employeeMap = new Map<string, EmployeeDetail>();
    
    currentMonthData.forEach(cost => {
      if (!cost.hr_employees) return;
      
      const employeeId = cost.employee_id;
      const employeeName = cost.hr_employees.full_name;
      const companyName = cost.hr_employees.companies?.name || "Sin empresa";
      
      // Buscar coste del mes anterior para este empleado
      const previousCost = previousMonthData?.find(c => c.employee_id === employeeId);
      const previousCosteEmpresa = previousCost?.coste_empresa || 0;
      const currentCosteEmpresa = cost.coste_empresa || 0;
      
      const variation = previousCosteEmpresa > 0
        ? ((currentCosteEmpresa - previousCosteEmpresa) / previousCosteEmpresa) * 100
        : 0;

      employeeMap.set(employeeId, {
        id: employeeId,
        name: employeeName,
        company: companyName,
        bruto: cost.bruto || 0,
        costeEmpresa: currentCosteEmpresa,
        variation,
      });
    });

    const employeeDetails = Array.from(employeeMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return {
      totalCost: totalCoste,
      activeEmployees,
      avgCostPerEmployee,
      variationVsPreviousMonth,
      chartData,
      employeeDetails,
      hasData: currentMonthData.length > 0,
      isLoading: isLoadingCurrent || isLoadingYear,
    };
  }, [currentMonthData, previousMonthData, yearData, isLoadingCurrent, isLoadingYear, month, year]);

  return analysis;
};
