import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { HistoryPreviewTable } from "@/components/upload/HistoryPreviewTable";
import { ImportProgress } from "@/components/upload/ImportProgress";
import { parseEmployeeHistory, type ParsedHistory } from "@/lib/parsers/employeeHistoryParser";
import { bulkImportEmployeeHistory, type ImportOptions } from "@/services/bulkImportService";
import { Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminImportHistory() {
  const navigate = useNavigate();
  const [parsedHistory, setParsedHistory] = useState<ParsedHistory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  
  const [options, setOptions] = useState<ImportOptions>({
    clearExisting: false,
    generateCosts: true,
    detectTransfers: true,
    onlyActiveEmployees: false,
  });

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setParsedHistory(null);

    try {
      const history = await parseEmployeeHistory(file);
      setParsedHistory(history);
      
      if (history.stats.errorRows > 0) {
        toast.warning(`Se encontraron ${history.stats.errorRows} errores en el archivo`);
      } else {
        toast.success(`${history.stats.validRows} registros listos para importar`);
      }
    } catch (error) {
      toast.error(`Error al procesar archivo: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedHistory) return;

    if (options.clearExisting) {
      const confirmed = confirm(
        '⚠️ ADVERTENCIA: Se eliminarán TODOS los empleados, costes y traslados existentes.\n\n' +
        'Esta acción no se puede deshacer.\n\n' +
        '¿Estás seguro de que deseas continuar?'
      );
      
      if (!confirmed) return;
    }

    setIsProcessing(true);
    setImportProgress({ current: 0, total: parsedHistory.employees.length });

    try {
      const result = await bulkImportEmployeeHistory(
        parsedHistory.employees,
        parsedHistory.groups,
        options
      );

      if (result.errors.length > 0) {
        toast.error(`Importación completada con errores: ${result.errors.join(', ')}`);
      } else {
        toast.success(
          `✅ Importación exitosa:\n` +
          `• ${result.employeesCreated} empleados creados\n` +
          `• ${result.costsCreated} costes generados\n` +
          `• ${result.transfersDetected} traslados detectados`
        );
        
        setTimeout(() => navigate('/employees'), 2000);
      }
    } catch (error) {
      toast.error(`Error en importación: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const canImport = parsedHistory && parsedHistory.stats.validRows > 0 && !isProcessing;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Importar Histórico de Empleados"
        subtitle="Carga masiva de contratos históricos desde Excel con detección automática de traslados"
      />

      {/* Instrucciones */}
      <Alert>
        <Download className="h-4 w-4" />
        <AlertDescription>
          <strong>Formato esperado:</strong> Excel/CSV con columnas: Nombre, Empresa, DNI/NIE, 
          Fecha Alta, Fecha Baja, Antigüedad, Ingresos Anuales (€), Tipo Contrato
        </AlertDescription>
      </Alert>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>1. Cargar archivo histórico</CardTitle>
          <CardDescription>
            Sube tu archivo Excel con el histórico completo de empleados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept=".xlsx,.xls,.csv"
            maxSize={10}
          />
        </CardContent>
      </Card>

      {/* Preview */}
      {parsedHistory && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>2. Revisar datos parseados</CardTitle>
              <CardDescription>
                Verifica que los datos se hayan interpretado correctamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoryPreviewTable history={parsedHistory} />
            </CardContent>
          </Card>

          {/* Opciones */}
          <Card>
            <CardHeader>
              <CardTitle>3. Opciones de importación</CardTitle>
              <CardDescription>
                Configura cómo se debe procesar la importación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clearExisting"
                  checked={options.clearExisting}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, clearExisting: checked as boolean })
                  }
                />
                <label
                  htmlFor="clearExisting"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Limpiar datos existentes antes de importar (⚠️ elimina todo)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateCosts"
                  checked={options.generateCosts}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, generateCosts: checked as boolean })
                  }
                />
                <label
                  htmlFor="generateCosts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Generar costes mensuales automáticamente
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="detectTransfers"
                  checked={options.detectTransfers}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, detectTransfers: checked as boolean })
                  }
                />
                <label
                  htmlFor="detectTransfers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Detectar traslados interempresa automáticamente
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onlyActive"
                  checked={options.onlyActiveEmployees}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, onlyActiveEmployees: checked as boolean })
                  }
                />
                <label
                  htmlFor="onlyActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Solo importar empleados activos (sin fecha de baja)
                </label>
              </div>

              {options.clearExisting && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>¡PRECAUCIÓN!</strong> Se eliminarán todos los empleados, costes y 
                    traslados existentes en la base de datos. Esta acción no se puede deshacer.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Botón de importación */}
          <Card>
            <CardHeader>
              <CardTitle>4. Ejecutar importación</CardTitle>
              <CardDescription>
                Confirma para iniciar la carga masiva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProcessing && importProgress.total > 0 ? (
                <ImportProgress
                  current={importProgress.current}
                  total={importProgress.total}
                  status="uploading"
                />
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={!canImport}
                    size="lg"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar {parsedHistory.stats.validRows} contratos
                  </Button>

                  {parsedHistory.stats.errorRows === 0 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Todo listo
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
