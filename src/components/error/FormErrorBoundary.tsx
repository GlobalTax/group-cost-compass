import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { FormErrorFallback } from "./ErrorFallbacks";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

/**
 * Error Boundary específico para formularios y diálogos
 * Fallback con opción de reintentar sin cerrar el formulario
 */
export function FormErrorBoundary({ children, onReset }: Props) {
  return (
    <ErrorBoundary 
      fallback={<FormErrorFallback onReset={onReset} />}
      context="Form"
    >
      {children}
    </ErrorBoundary>
  );
}
