import { AlertCircle, CheckCircle2, AlertTriangle, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ValidationError } from "@/lib/parsers/employeeParser";
import type { A3NomParseResult } from "@/lib/parsers/a3nomCostsParser";

interface ValidationResultsProps {
  errors?: ValidationError[];
  warnings?: string[];
  successCount?: number;
  result?: A3NomParseResult;
}

export const ValidationResults = ({
  errors: propErrors,
  warnings: propWarnings,
  successCount,
  result,
}: ValidationResultsProps) => {
  // Soportar ambos formatos: props directos o result completo
  const errors = propErrors || result?.errors || [];
  const warnings = propWarnings || result?.warnings || [];
  const finalSuccessCount = successCount || result?.data.length;
  
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isSuccess = !hasErrors && finalSuccessCount !== undefined && finalSuccessCount > 0;

  return (
    <div className="space-y-3">
      {isSuccess && (
        <Alert className="border-success/20 bg-success/5">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription>
            <strong className="text-success">Validación exitosa:</strong> {finalSuccessCount} registros listos para importar
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen por empresa (si existe) */}
      {result && result.summary.companiesSummary && result.summary.companiesSummary.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4" />
            Empresas Detectadas ({result.summary.companiesDetected})
          </div>
          
          <div className="space-y-2">
            {result.summary.companiesSummary.map((company) => (
              <div 
                key={company.nif} 
                className="flex justify-between items-center p-3 border rounded-lg bg-card"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{company.name}</p>
                  <p className="text-xs text-muted-foreground">NIF: {company.nif}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">
                    {company.employees} empleado{company.employees > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {company.totalBruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen general */}
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Resumen Total:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Empleados</p>
                <p className="text-lg font-bold">{result.summary.totalEmployees}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Bruto</p>
                <p className="text-lg font-bold">
                  {result.summary.totalBruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Coste Empresa</p>
                <p className="text-lg font-bold">
                  {result.summary.totalCoste.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>
          </div>
        </div>
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
