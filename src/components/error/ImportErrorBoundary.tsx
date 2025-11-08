import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { ImportErrorFallback } from "./ErrorFallbacks";

interface Props {
  children: ReactNode;
}

/**
 * Error Boundary específico para flujos de importación (A3Nom, CSV)
 * Fallback con ID de error único para soporte técnico
 */
export function ImportErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary 
      fallback={<ImportErrorFallback />}
      context="Import"
    >
      {children}
    </ErrorBoundary>
  );
}
