/**
 * Detecta información de empresas en filas del archivo A3Nom
 */

import type { CompanyState } from "./types";

const COMPANY_NIF_REGEX = /\b([A-Z]\d{8}|[XYZ]\d{7}[A-Z]|[0-9]{8}[A-Z])\b/i;

/**
 * Detecta si una fila contiene información de empresa
 * Formato esperado: "EMPRESA: Nombre de la empresa (NIF)"
 */
export const detectCompanyInfo = (row: any): CompanyState | null => {
  const firstCol = String(row[0] || "").trim();

  // Buscar patrón "EMPRESA:"
  if (!firstCol.toUpperCase().includes("EMPRESA:")) {
    return null;
  }

  // Extraer nombre (todo entre "EMPRESA:" y el paréntesis)
  const nameMatch = firstCol.match(/EMPRESA:\s*(.+?)\s*\(/i);
  const name = nameMatch ? nameMatch[1].trim() : "";

  // Extraer NIF (dentro de paréntesis)
  const nifMatch = firstCol.match(/\(([^)]+)\)/);
  const nif = nifMatch ? nifMatch[1].trim() : "";

  if (!name || !nif) {
    return null;
  }

  return { name, nif };
};

/**
 * Valida que un NIF tenga formato correcto
 */
export const isValidNif = (nif: string): boolean => {
  return COMPANY_NIF_REGEX.test(nif);
};
