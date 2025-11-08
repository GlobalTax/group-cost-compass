/**
 * Sistema unificado de manejo de errores
 * Clasifica, formatea y muestra errores de forma consistente
 */

import { toast } from "@/hooks/use-toast";

// Re-exportar logCriticalError para uso externo
export { logCriticalError } from "./errorLogging";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface AppError {
  message: string;
  severity: ErrorSeverity;
  code?: string;
  details?: unknown;
}

/**
 * Clasifica y formatea errores según tipo y contexto
 * 
 * @param error - Error capturado (Error | string | unknown)
 * @param context - Contexto adicional (nombre función, componente)
 * @returns AppError normalizado con severidad y código
 * 
 * @example
 * try {
 *   await createEmployee(data);
 * } catch (error) {
 *   const appError = handleError(error, "createEmployee");
 *   console.error(appError);
 * }
 */
export function handleError(error: unknown, context?: string): AppError {
  // Error de Supabase (RLS, permisos, FK)
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("rls") || msg.includes("row-level security") || msg.includes("policy")) {
      return {
        message: "Error de permisos. Contacta al administrador del sistema.",
        severity: "critical",
        code: "RLS_ERROR",
        details: error,
      };
    }

    if (msg.includes("foreign key") || msg.includes("violates")) {
      return {
        message: "Error de integridad de datos. Verifica las relaciones.",
        severity: "error",
        code: "FK_VIOLATION",
        details: error,
      };
    }

    if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout")) {
      return {
        message: "Error de conexión. Verifica tu internet e intenta nuevamente.",
        severity: "error",
        code: "NETWORK_ERROR",
        details: error,
      };
    }

    if (msg.includes("duplicate") || msg.includes("unique")) {
      return {
        message: "Ya existe un registro con estos datos.",
        severity: "warning",
        code: "DUPLICATE_ENTRY",
        details: error,
      };
    }

    if (msg.includes("not found") || msg.includes("404")) {
      return {
        message: "Registro no encontrado.",
        severity: "warning",
        code: "NOT_FOUND",
        details: error,
      };
    }

    return {
      message: error.message,
      severity: "error",
      details: error,
    };
  }

  // String directo
  if (typeof error === "string") {
    return {
      message: error,
      severity: "error",
    };
  }

  // Desconocido
  return {
    message: "Error inesperado. Por favor, intenta nuevamente.",
    severity: "error",
    details: error,
  };
}

/**
 * Muestra error formateado al usuario vía toast
 * Logging adicional en modo desarrollo
 * 
 * @param error - Error capturado
 * @param context - Contexto adicional
 * 
 * @example
 * try {
 *   await deleteCompany(id);
 * } catch (error) {
 *   showError(error, "deleteCompany");
 * }
 */
export function showError(error: unknown, context?: string): void {
  const appError = handleError(error, context);

  // Toast según severidad
  switch (appError.severity) {
    case "critical":
      toast({
        title: "Error Crítico",
        description: appError.message,
        variant: "destructive",
        duration: 10000,
      });
      break;
    case "error":
      toast({
        title: "Error",
        description: appError.message,
        variant: "destructive",
      });
      break;
    case "warning":
      toast({
        title: "Advertencia",
        description: appError.message,
      });
      break;
    case "info":
      toast({
        title: "Información",
        description: appError.message,
      });
      break;
  }

  // Log en desarrollo
  if (import.meta.env.DEV) {
    console.error(`[${context || "Error"}]`, appError);
  }
}

/**
 * Valida respuesta de Supabase y lanza error si falla
 * 
 * @param data - Datos de respuesta
 * @param error - Error de Supabase
 * @param context - Contexto de la operación
 * @throws {AppError} Si hay error o data es null
 * 
 * @example
 * const { data, error } = await supabase.from("employees").select();
 * validateSupabaseResponse(data, error, "fetchEmployees");
 */
export function validateSupabaseResponse<T>(
  data: T | null,
  error: any,
  context: string
): asserts data is T {
  if (error) {
    throw handleError(error, context);
  }
  if (!data) {
    throw handleError(new Error("No se recibieron datos"), context);
  }
}
