/**
 * Valida filas de empleados en archivos A3Nom
 */

/**
 * Verifica si una fila es una fila válida de empleado
 * Criterio: primera columna debe ser código de empleado (alfanumérico corto)
 */
export const isValidEmployeeRow = (row: any): boolean => {
  if (!row || !row[0]) return false;

  const firstCol = String(row[0]).trim();

  // Descartar si es muy largo (probablemente un título o empresa)
  if (firstCol.length > 10) return false;

  // Descartar si contiene palabras clave comunes en encabezados
  const excludeKeywords = [
    "empresa",
    "total",
    "subtotal",
    "nómina",
    "periodo",
    "mes",
    "año",
  ];
  const lowerFirst = firstCol.toLowerCase();
  if (excludeKeywords.some((k) => lowerFirst.includes(k))) {
    return false;
  }

  // Debe ser alfanumérico (código de empleado)
  return /^[A-Z0-9]{2,10}$/i.test(firstCol);
};

/**
 * Valida que los campos numéricos tengan valores coherentes
 */
export const validateNumericFields = (data: {
  bruto: number;
  coste_empresa: number;
}): string[] => {
  const errors: string[] = [];

  if (data.bruto < 0) {
    errors.push("Bruto no puede ser negativo");
  }

  if (data.coste_empresa < 0) {
    errors.push("Coste empresa no puede ser negativo");
  }

  if (data.coste_empresa < data.bruto) {
    errors.push("Coste empresa debe ser mayor o igual que bruto");
  }

  return errors;
};
