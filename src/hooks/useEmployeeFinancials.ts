import { useMemo } from "react";

interface EmployeeCost {
  period: string;
  bruto: number | null;
  coste_empresa: number | null;
  sal_neto?: number | null;
}

export const useEmployeeFinancials = (costs: EmployeeCost[] | undefined) => {
  return useMemo(() => {
    if (!costs || costs.length === 0) {
      return {
        annualBaseSalary: 0,
        annualTotalCost: 0,
        monthlyCost: 0,
        lastGross: 0,
        lastNet: 0,
      };
    }

    // Sort costs by period descending to get the latest
    const sortedCosts = [...costs].sort((a, b) => b.period.localeCompare(a.period));
    const latestCost = sortedCosts[0];

    // Calculate annual sums for current year
    const currentYear = new Date().getFullYear();
    const currentYearCosts = costs.filter(c => 
      new Date(c.period).getFullYear() === currentYear
    );

    const annualBaseSalary = currentYearCosts.reduce((sum, c) => sum + (c.bruto || 0), 0);
    const annualTotalCost = currentYearCosts.reduce((sum, c) => sum + (c.coste_empresa || 0), 0);

    return {
      annualBaseSalary,
      annualTotalCost,
      monthlyCost: latestCost.coste_empresa || 0,
      lastGross: latestCost.bruto || 0,
      lastNet: latestCost.sal_neto || 0,
    };
  }, [costs]);
};
