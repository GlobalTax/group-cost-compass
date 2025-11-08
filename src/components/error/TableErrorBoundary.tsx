import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { TableRowErrorFallback } from "./ErrorFallbacks";

interface Props {
  children: ReactNode;
  columns?: number;
}

/**
 * Error Boundary específico para tablas
 * Muestra una fila con mensaje de error en lugar de crashear toda la tabla
 */
export function TableErrorBoundary({ children, columns = 6 }: Props) {
  return (
    <ErrorBoundary 
      fallback={<TableRowErrorFallback columns={columns} />}
      context="Table"
    >
      {children}
    </ErrorBoundary>
  );
}
