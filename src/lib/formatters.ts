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
