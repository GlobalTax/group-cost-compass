/**
 * Formatters específicos del dominio de negocio
 * Las funciones genéricas de formato se han movido a src/lib/utils/*
 */

// Re-exportar funciones comunes desde los nuevos módulos
export { formatCurrency, formatPercentage, calculatePercentageChange } from "./utils/currency";
export { formatDate, formatPeriod, formatPeriodShort, formatMonth } from "./utils/date";

export const getCategoryLabel = (category: string, type: 'income' | 'expense') => {
  const incomeLabels: Record<string, string> = {
    billing: "Facturación",
    project: "Proyectos",
    subsidy: "Subvenciones",
    other: "Otros",
  };
  
  const expenseLabels: Record<string, string> = {
    operational: "Operativos",
    investment: "Inversiones",
    other: "Otros",
    personnel: "Personal",
  };
  
  return type === 'income' ? (incomeLabels[category] || category) : (expenseLabels[category] || category);
};

export const getCategoryColor = (category: string, type: 'income' | 'expense') => {
  const incomeColors: Record<string, string> = {
    billing: "hsl(var(--primary))",
    project: "hsl(var(--success))",
    subsidy: "hsl(var(--info))",
    other: "hsl(var(--muted))",
  };
  
  const expenseColors: Record<string, string> = {
    operational: "hsl(var(--destructive))",
    investment: "hsl(var(--warning))",
    personnel: "hsl(var(--primary))",
    other: "hsl(var(--muted))",
  };
  
  return type === 'income' ? (incomeColors[category] || "hsl(var(--muted))") : (expenseColors[category] || "hsl(var(--muted))");
};
