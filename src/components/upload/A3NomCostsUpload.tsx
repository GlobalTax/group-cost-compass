import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDropzone } from "./FileDropzone";
import { ValidationResults } from "./ValidationResults";
import { ImportProgress } from "./ImportProgress";
import { parseA3NomCostsFile, type A3NomParseResult } from "@/lib/parsers/a3nom";
import { useBulkCreateEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useBulkCreateEmployees } from "@/hooks/useBulkCreateEmployees";
import { importA3NomData } from "@/services/import/a3nomImportService";
import { toast } from "sonner";
import { InfoIcon, Upload } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export const A3NomCostsUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [period, setPeriod] = useState<string>("");
  const [validation, setValidation] = useState<A3NomParseResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const bulkCreateCosts = useBulkCreateEmployeeCosts();
  const createEmployees = useBulkCreateEmployees();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setValidation(null);
    
    if (!period) {
      toast.error("Por favor, selecciona el período antes de subir el archivo");
      return;
    }

    setProcessing(true);
    try {
      const result = await parseA3NomCostsFile(selectedFile);
      console.groupCollapsed("[A3Nom][Parse] Resultado del archivo");
      console.log("Período seleccionado:", period);
      console.log("Empleados detectados:", result.data.length);
      console.log("Resumen:", result.summary);
      console.log("Primeras 5 filas:", result.data.slice(0, 5));
      console.log("Errores:", result.errors);
      console.log("Warnings:", result.warnings);
      console.groupEnd();
      setValidation(result);
      
      if (result.errors.length > 0) {
        toast.error(`Se encontraron ${result.errors.length} errores en el archivo`);
      } else {
        toast.success(`Archivo procesado: ${result.data.length} empleados encontrados`);
      }
    } catch (error) {
      toast.error(`Error procesando archivo: ${(error as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!validation || !period) return;

    setImporting(true);
    setImportProgress({ current: 0, total: validation.data.length });

    try {
      const result = await importA3NomData({
        parseResult: validation,
        period,
        onProgress: (current, total) => setImportProgress({ current, total }),
        createEmployeesFn: (employees) => createEmployees.mutateAsync(employees),
        bulkCreateCostsFn: async (costs) => {
          await bulkCreateCosts.mutateAsync(costs);
        },
      });

      // Mostrar warnings si los hay
      if (result.warnings.length > 0) {
        result.warnings.slice(0, 3).forEach(warning => toast.warning(warning));
      }

      // Mensaje de empleados creados si aplica
      if (result.employeesCreated > 0) {
        toast.success(`✅ ${result.employeesCreated} empleado(s) creado(s)`);
      }

      // Mensaje de éxito final
      const companiesCount = validation.summary.companiesDetected;
      toast.success(
        `✅ Importación completada: ${result.costsImported} registros de ${companiesCount} empresa${companiesCount > 1 ? 's' : ''}`
      );

      // Reset
      setFile(null);
      setValidation(null);
      setPeriod("");
    } catch (error) {
      toast.error(`Error en importación: ${(error as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const canImport = validation && validation.data.length > 0 && validation.errors.length === 0 && period && !importing;

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Importación A3Nom Multi-Empresa:</strong> Sube el archivo Excel exportado desde A3Nom con formato de nóminas.
          El sistema detectará automáticamente las empresas por su NIF, consolidará empleados duplicados, y validará que todo exista en el catálogo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Período de Nómina</CardTitle>
            <InfoTooltip content="Mes y año al que corresponden los datos de nómina (ej: Octubre 2024). El sistema normalizará automáticamente al primer día del mes." />
          </div>
          <CardDescription>
            Selecciona el mes y año al que corresponden estos datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="period">Período (AAAA-MM)</Label>
            <Input
              id="period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              max={new Date().toISOString().slice(0, 7)}
              placeholder="2024-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Archivo A3Nom</CardTitle>
            <InfoTooltip content="Acepta Excel (.xlsx, .xls) o texto plano (.txt con tabs). El sistema detectará automáticamente las columnas." />
          </div>
          <CardDescription>
            Sube el archivo Excel exportado desde A3Nom (formato .xls, .xlsx, o .txt con tabs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept=".xls,.xlsx,.txt,.csv"
          />
        </CardContent>
      </Card>

      {validation && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Resultados de Validación A3Nom</CardTitle>
              <InfoTooltip content="Los empleados marcados en rojo ya existen en la base de datos para este período. Serán sobrescritos si confirmas la importación." />
            </div>
          </CardHeader>
          <CardContent>
            <ValidationResults
              result={validation}
            />
          </CardContent>
        </Card>
      )}

      {importing && (
        <Card>
          <CardContent className="pt-6">
            <ImportProgress
              current={importProgress.current}
              total={importProgress.total}
              status="uploading"
            />
          </CardContent>
        </Card>
      )}

      {canImport && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleImport} size="lg" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Importar {validation.data.length} Registros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
