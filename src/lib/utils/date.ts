/**
 * Utilidades para formateo y manipulación de fechas
 */

/**
 * Formatea una fecha en formato español (dd/mm/yyyy)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES").format(d);
};

/**
 * Formatea un período (mes/año) en formato largo español
 * Ejemplo: "enero 2025"
 */
export const formatPeriod = (period: string | Date | null | undefined): string => {
  if (!period) return "—";
  const d = typeof period === "string" ? new Date(period) : period;
  return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "long" }).format(d);
};

/**
 * Formatea un período (mes/año) en formato corto español
 * Ejemplo: "ene 2025"
 */
export const formatPeriodShort = (period: string | Date | null | undefined): string => {
  if (!period) return "—";
  const d = typeof period === "string" ? new Date(period) : period;
  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(d);
};

/**
 * Formatea solo el mes en formato corto español
 * Ejemplo: "ene"
 */
export const formatMonth = (period: string | Date | null | undefined): string => {
  if (!period) return "—";
  const d = typeof period === "string" ? new Date(period) : period;
  return new Intl.DateTimeFormat("es-ES", { month: "short" }).format(d);
};

/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

/**
 * Parsea una fecha desde formato español (dd/mm/yyyy) a Date
 */
export const parseDateSpanish = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
};

/**
 * Obtiene el primer día del mes para un período dado
 */
export const getFirstDayOfMonth = (period: string | Date): Date => {
  const d = typeof period === "string" ? new Date(period) : period;
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Obtiene el último día del mes para un período dado
 */
export const getLastDayOfMonth = (period: string | Date): Date => {
  const d = typeof period === "string" ? new Date(period) : period;
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
