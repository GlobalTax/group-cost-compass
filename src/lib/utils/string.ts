/**
 * Utilidades para manipulación de strings
 */

/**
 * Normaliza un nombre eliminando acentos, espacios extra y convirtiendo a mayúsculas
 * Útil para comparar nombres de empleados
 */
export const normalizeName = (name: string): string => {
  if (!name) return "";
  
  return name
    .trim()
    .toUpperCase()
    .normalize("NFD") // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Eliminar marcas diacríticas
    .replace(/\s+/g, " "); // Normalizar espacios múltiples
};

/**
 * Compara dos nombres normalizados para detectar coincidencias
 */
export const areNamesEqual = (name1: string, name2: string): boolean => {
  return normalizeName(name1) === normalizeName(name2);
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Trunca un texto a una longitud máxima añadiendo "..."
 */
export const truncate = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

/**
 * Genera iniciales a partir de un nombre completo
 */
export const getInitials = (name: string): string => {
  if (!name) return "";
  
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Convierte un slug a título legible
 * Ejemplo: "navarro-legal-tributario" -> "Navarro Legal Tributario"
 */
export const slugToTitle = (slug: string): string => {
  if (!slug) return "";
  
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Convierte un título a slug
 * Ejemplo: "Navarro Legal y Tributario" -> "navarro-legal-y-tributario"
 */
export const titleToSlug = (title: string): string => {
  if (!title) return "";
  
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

/**
 * Extrae el nombre de empresa de diferentes formatos
 * Normaliza nombres de empresa del catálogo
 */
export const normalizeCompanyName = (companyName: string): string => {
  if (!companyName) return "";
  
  // Eliminar sufijos legales comunes
  const legalSuffixes = [
    ", SL",
    ", S.L.",
    ", SLP",
    ", S.L.P.",
    ", SA",
    ", S.A.",
    " SL",
    " S.L.",
    " SLP",
    " S.L.P.",
    " SA",
    " S.A."
  ];
  
  let normalized = companyName.trim();
  
  for (const suffix of legalSuffixes) {
    if (normalized.toUpperCase().endsWith(suffix.toUpperCase())) {
      normalized = normalized.slice(0, -suffix.length);
      break;
    }
  }
  
  return normalizeName(normalized);
};
