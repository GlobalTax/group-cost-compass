import { useMemo } from "react";

interface EmployeeCost {
  period: string;
  bruto: number;
  coste_empresa: number;
}

export const useEmployeeFinancials = (costs: EmployeeCost[] | undefined) => {
  return useMemo(() => {
    if (!costs || costs.length === 0) {
      return {
        annualBaseSalary: 0,
        monthlyCost: 0,
        lastGross: 0,
        lastNet: 0,
      };
    }

    // Sort costs by period descending to get the latest
    const sortedCosts = [...costs].sort((a, b) => b.period.localeCompare(a.period));
    const latestCost = sortedCosts[0];

    return {
      annualBaseSalary: latestCost.bruto * 12,
      monthlyCost: latestCost.coste_empresa,
      lastGross: latestCost.bruto,
      lastNet: 0, // We don't have net salary data in the current schema
    };
  }, [costs]);
};
