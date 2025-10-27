/**
 * Parsea y normaliza números de diferentes formatos
 */

/**
 * Convierte string de número a number, manejando formatos europeos
 * Ejemplos: "1.234,56" → 1234.56, "1,234.56" → 1234.56
 */
export const parseNumber = (value: string | number): number | null => {
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
 * Parsea múltiples campos numéricos de una fila
 */
export const parseNumericFields = (row: any, mapping: Record<string, number>) => {
  const result: Record<string, number | undefined> = {};

  for (const [field, colIndex] of Object.entries(mapping)) {
    const value = parseNumber(row[colIndex]);
    if (value !== null) {
      result[field] = value;
    }
  }

  return result;
};
