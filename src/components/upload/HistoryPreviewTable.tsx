import { memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { ParsedHistory } from "@/lib/parsers/employeeHistoryParser";
import { formatCurrency } from "@/lib/formatters";

interface HistoryPreviewTableProps {
  history: ParsedHistory;
}

export const HistoryPreviewTable = memo(({ history }: HistoryPreviewTableProps) => {
  const { employees, errors, stats } = history;
  
  // Agrupar errores por fila
  const errorsByRow = new Map<number, typeof errors>();
  errors.forEach(error => {
    if (!errorsByRow.has(error.row)) {
      errorsByRow.set(error.row, []);
    }
    errorsByRow.get(error.row)!.push(error);
  });
  
  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-bold">{stats.totalRows}</div>
          <div className="text-xs text-muted-foreground">Filas totales</div>
        </div>
        
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{stats.validRows}</div>
          <div className="text-xs text-muted-foreground">Válidas</div>
        </div>
        
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600">{stats.errorRows}</div>
          <div className="text-xs text-muted-foreground">Errores</div>
        </div>
        
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600">{stats.warningRows}</div>
          <div className="text-xs text-muted-foreground">Advertencias</div>
        </div>
        
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{stats.uniqueEmployees}</div>
          <div className="text-xs text-muted-foreground">Empleados únicos</div>
        </div>
        
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">{stats.potentialTransfers}</div>
          <div className="text-xs text-muted-foreground">Traslados detectados</div>
        </div>
      </div>
      
      {/* Alertas */}
      {stats.errorRows > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Se encontraron {stats.errorRows} filas con errores críticos que no se importarán.
          </AlertDescription>
        </Alert>
      )}
      
      {stats.warningRows > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {stats.warningRows} advertencias en los datos (ej: sin datos económicos).
          </AlertDescription>
        </Alert>
      )}
      
      {stats.errorRows === 0 && stats.warningRows === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Todos los datos son válidos y listos para importar.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabla de preview */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fecha Alta</TableHead>
              <TableHead>Fecha Baja</TableHead>
              <TableHead>Tipo Contrato</TableHead>
              <TableHead className="text-right">Bruto Mensual</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.slice(0, 50).map((emp) => {
              const rowErrors = errorsByRow.get(emp.rowNumber) || [];
              const hasError = rowErrors.some(e => e.severity === 'error');
              const hasWarning = rowErrors.some(e => e.severity === 'warning');
              
              return (
                <TableRow 
                  key={`${emp.dni}-${emp.company_id}-${emp.hire_date}`}
                  className={hasError ? 'bg-red-50' : hasWarning ? 'bg-yellow-50' : ''}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {emp.rowNumber}
                  </TableCell>
                  <TableCell className="font-medium">{emp.full_name}</TableCell>
                  <TableCell className="font-mono text-xs">{emp.dni}</TableCell>
                  <TableCell className="text-xs">{emp.company_name}</TableCell>
                  <TableCell className="text-xs">{emp.hire_date}</TableCell>
                  <TableCell className="text-xs">
                    {emp.termination_date || <Badge variant="outline">Activo</Badge>}
                  </TableCell>
                  <TableCell className="text-xs">{emp.contract_type}</TableCell>
                  <TableCell className="text-right text-xs">
                    {emp.monthly_bruto > 0 ? formatCurrency(emp.monthly_bruto) : '—'}
                  </TableCell>
                  <TableCell>
                    {hasError ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </Badge>
                    ) : hasWarning ? (
                      <Badge variant="secondary" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Aviso
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        OK
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {employees.length > 50 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t">
            Mostrando 50 de {employees.length} registros
          </div>
        )}
      </div>
      
      {/* Lista de errores */}
      {errors.length > 0 && (
        <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-2">Detalle de errores y advertencias:</h4>
          {errors.slice(0, 20).map((error, idx) => (
            <div 
              key={idx}
              className={`text-xs p-2 rounded ${
                error.severity === 'error' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              <strong>Fila {error.row}, campo "{error.field}":</strong> {error.message}
            </div>
          ))}
          {errors.length > 20 && (
            <div className="text-xs text-muted-foreground text-center pt-2">
              ... y {errors.length - 20} más
            </div>
          )}
        </div>
      )}
    </div>
  );
});

HistoryPreviewTable.displayName = "HistoryPreviewTable";
