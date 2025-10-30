/**
 * Valida filas de empleados en archivos A3Nom
 */

/**
 * Verifica si una fila es una fila válida de empleado
 * Criterio actualizado: segunda columna debe tener nombre, tercera NIF
 */
export const isValidEmployeeRow = (row: any): boolean => {
  if (!row || row.length < 4) return false;

  // La columna 1 debe tener un nombre (texto con más de 5 caracteres)
  const employeeName = String(row[1] || "").trim();
  if (employeeName.length < 5) return false;

  // La columna 2 debe parecer un NIF (formato básico)
  const employeeNif = String(row[2] || "").trim();
  const nifPattern = /^[0-9XYZ][0-9]{7}[A-Z]$/i;
  if (!nifPattern.test(employeeNif)) return false;

  // La columna 3 debe tener TIPO PAGA
  const tipoPaga = String(row[3] || "").trim();
  if (!tipoPaga || tipoPaga.length === 0) return false;

  // Descartar si la columna 1 contiene palabras clave de encabezado
  const excludeKeywords = [
    "trabajador",
    "total",
    "subtotal",
    "nómina",
    "periodo",
    "empresa",
  ];
  const lowerName = employeeName.toLowerCase();
  if (excludeKeywords.some((k) => lowerName.includes(k))) {
    return false;
  }

  return true;
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
