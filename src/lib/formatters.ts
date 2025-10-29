export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date: string | Date) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES").format(d);
};

export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const calculatePercentageChange = (current: number, previous: number) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const formatPeriod = (period: string | Date) => {
  if (!period) return "—";
  const d = typeof period === "string" ? new Date(period) : period;
  return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "long" }).format(d);
};

export const formatPeriodShort = (period: string | Date) => {
  if (!period) return "—";
  const d = typeof period === "string" ? new Date(period) : period;
  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(d);
};

export const formatMonth = (period: string | Date) => {
  if (!period) return "—";
  const d = typeof period === "string" ? new Date(period) : period;
  return new Intl.DateTimeFormat("es-ES", { month: "short" }).format(d);
};

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
