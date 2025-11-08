import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableRow, TableCell } from "@/components/ui/table";
import { AlertCircle, BarChart3, FileSpreadsheet, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DefaultErrorFallbackProps {
  error?: Error | null;
  resetError?: () => void;
  message?: string;
  action?: () => void;
  actionLabel?: string;
}

/**
 * Fallback genérico con diseño limpio del sistema
 */
export function DefaultErrorFallback({ 
  error, 
  resetError,
  message,
  action,
  actionLabel = "Ir al inicio"
}: DefaultErrorFallbackProps) {
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (action) {
      action();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <Card className="p-8 text-center max-w-md border-destructive/50 bg-destructive/5">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Algo salió mal
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {message || error?.message || "Error inesperado. Por favor, intenta nuevamente."}
        </p>
        <div className="flex gap-3 justify-center">
          {resetError && (
            <Button onClick={resetError}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
          <Button variant="outline" onClick={handleAction}>
            <Home className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface TableRowErrorFallbackProps {
  columns?: number;
  message?: string;
}

/**
 * Fallback para filas de tabla
 */
export function TableRowErrorFallback({ 
  columns = 6,
  message = "Error al cargar datos de esta fila"
}: TableRowErrorFallbackProps) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Fallback para gráficos
 */
export function ChartErrorFallback() {
  return (
    <Card className="h-full min-h-[300px] flex items-center justify-center border-muted">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Error al cargar gráfico
        </p>
      </div>
    </Card>
  );
}

interface FormErrorFallbackProps {
  onReset?: () => void;
}

/**
 * Fallback para formularios
 */
export function FormErrorFallback({ onReset }: FormErrorFallbackProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Error al procesar el formulario</span>
        {onReset && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="ml-4"
          >
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Fallback para importaciones (con ID de error único)
 */
export function ImportErrorFallback() {
  const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
  
  return (
    <Card className="p-8 text-center border-destructive/50 bg-destructive/5">
      <FileSpreadsheet className="w-16 h-16 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        Error en Importación
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        No se pudo completar la importación. Por favor, contacta a soporte con el siguiente ID:
      </p>
      <code className="block bg-muted px-4 py-2 rounded text-sm font-mono mb-6">
        {errorId}
      </code>
      <Button onClick={() => window.location.reload()}>
        Recargar Página
      </Button>
    </Card>
  );
}
