import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ValidationError } from "@/lib/parsers/employeeParser";

interface ValidationResultsProps {
  errors: ValidationError[];
  warnings: string[];
  successCount?: number;
}

export const ValidationResults = ({
  errors,
  warnings,
  successCount,
}: ValidationResultsProps) => {
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isSuccess = !hasErrors && successCount !== undefined && successCount > 0;

  return (
    <div className="space-y-3">
      {isSuccess && (
        <Alert className="border-success/20 bg-success/5">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription>
            <strong className="text-success">Validación exitosa:</strong> {successCount} registros listos para importar
          </AlertDescription>
        </Alert>
      )}

      {hasErrors && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <strong className="text-destructive">Errores encontrados ({errors.length}):</strong>
            <ScrollArea className="h-32 mt-2">
              <div className="space-y-1 text-xs">
                {errors.map((error, index) => (
                  <div key={index} className="font-mono">
                    Fila {error.row}, campo "{error.field}": {error.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {hasWarnings && !hasErrors && (
        <Alert className="border-warning/20 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription>
            <strong className="text-warning">Advertencias ({warnings.length}):</strong>
            <ScrollArea className="h-24 mt-2">
              <div className="space-y-1 text-xs">
                {warnings.map((warning, index) => (
                  <div key={index}>{warning}</div>
                ))}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
