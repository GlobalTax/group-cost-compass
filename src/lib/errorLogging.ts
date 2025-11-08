import { type ErrorInfo } from "react";
import { type AppError } from "./errorHandler";
import { supabase } from "@/integrations/supabase/client";

interface ErrorLog {
  timestamp: string;
  error: AppError;
  componentStack?: string;
  userAgent: string;
  route: string;
  userId?: string;
}

/**
 * Obtiene el ID del usuario actual si está autenticado
 */
async function getCurrentUserId(): Promise<string | undefined> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  } catch {
    return undefined;
  }
}

/**
 * Registra errores en Supabase (audit_logs) y consola
 * En producción, también puede enviar a servicios externos (Sentry, LogRocket)
 * 
 * @param error - Error clasificado por handleError()
 * @param errorInfo - Información de React sobre el error (stack trace)
 * @param context - Contexto donde ocurrió el error (Dashboard, Table, etc.)
 * 
 * @example
 * logErrorToService(appError, errorInfo, "Dashboard");
 */
export async function logErrorToService(
  error: AppError,
  errorInfo: ErrorInfo,
  context: string
): Promise<void> {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    error,
    componentStack: errorInfo.componentStack,
    userAgent: navigator.userAgent,
    route: window.location.pathname,
    userId: await getCurrentUserId(),
  };

  // Log en consola (siempre)
  if (import.meta.env.DEV) {
    console.error(`[${context}] Error capturado por ErrorBoundary:`, log);
  }

  // Enviar a Supabase audit_logs
  try {
    await supabase.from("audit_logs").insert({
      action: "ERROR",
      table_name: "app",
      record_id: context,
      new_data: {
        message: error.message,
        severity: error.severity,
        code: error.code,
        componentStack: errorInfo.componentStack?.split("\n").slice(0, 5).join("\n"), // Limitar stack trace
        route: log.route,
        userAgent: log.userAgent,
      },
    });
  } catch (loggingError) {
    // Si falla el logging, no queremos crashear el fallback
    console.error("[errorLogging] Error al guardar en audit_logs:", loggingError);
  }

  // En producción: enviar a Sentry, LogRocket, etc.
  if (import.meta.env.PROD) {
    // Ejemplo integración Sentry (descomentar si se añade Sentry):
    // if (window.Sentry) {
    //   window.Sentry.captureException(error.details || new Error(error.message), {
    //     contexts: {
    //       react: { componentStack: errorInfo.componentStack },
    //       custom: { severity: error.severity, code: error.code },
    //     },
    //   });
    // }
  }
}

/**
 * Registra error crítico sin ErrorBoundary (para casos excepcionales)
 * Útil en event handlers o efectos donde ErrorBoundary no puede capturar
 * 
 * @param error - Error a registrar
 * @param context - Contexto donde ocurrió
 * 
 * @example
 * try {
 *   await deleteEmployee(id);
 * } catch (error) {
 *   logCriticalError(error, "deleteEmployee");
 *   showError(error, "deleteEmployee");
 * }
 */
export async function logCriticalError(error: unknown, context: string): Promise<void> {
  const log = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    route: window.location.pathname,
    userId: await getCurrentUserId(),
  };

  console.error(`[${context}] Error crítico:`, log);

  try {
    await supabase.from("audit_logs").insert({
      action: "CRITICAL_ERROR",
      table_name: "app",
      record_id: context,
      new_data: log,
    });
  } catch (loggingError) {
    console.error("[errorLogging] Error al guardar error crítico:", loggingError);
  }
}
