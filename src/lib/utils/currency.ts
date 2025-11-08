/**
 * Utilidades para formateo de moneda y números
 */

/**
 * Formatea un valor numérico como moneda en euros
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea un valor numérico como moneda con decimales
 */
export const formatCurrencyWithDecimals = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatea un porcentaje con el número de decimales especificado
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calcula el cambio porcentual entre dos valores
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Parsea un número en formato español (1.234,56) a número
 */
export const parseSpanishNumber = (value: string | number): number | null => {
  if (typeof value === "number") return value;
  if (!value) return null;

  // Limpiar espacios y símbolos de moneda
  let cleaned = String(value).trim().replace(/[€$\s]/g, "");

  // Detectar formato europeo (punto como separador de miles, coma como decimal)
  const hasEuropeanFormat = /\d{1,3}(\.\d{3})*(,\d+)?$/.test(cleaned);

  if (hasEuropeanFormat) {
    // Formato europeo: quitar puntos y reemplazar coma por punto
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // Formato anglosajón: quitar comas
    cleaned = cleaned.replace(/,/g, "");
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Formatea un número con separadores de miles en formato español
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
