import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, AlertCircle, CheckCircle2, Info, Download, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { ValidationResults } from "@/components/upload/ValidationResults";
import { ImportProgress } from "@/components/upload/ImportProgress";
import { A3NomCostsUpload } from "@/components/upload/A3NomCostsUpload";
import { IntelligentUpload } from "@/components/upload/IntelligentUpload";
import { CostsPreviewTable } from "@/components/upload/CostsPreviewTable";
import { ColumnMapper } from "@/components/upload/ColumnMapper";
import { MatchingPreview } from "@/components/upload/MatchingPreview";
import { parseEmployeesFile, type ParsedEmployee } from "@/lib/parsers/employeeParser";
import { parseCostsFile, type ParsedCost } from "@/lib/parsers/costsParser";
import { parseUploadCostsFile } from "@/lib/parsers/uploadCostsParser";
import type { UploadValidationResult, UploadCostRow } from "@/lib/validators/uploadSchema";
import { useCompanies } from "@/hooks/useCompanies";
import { useEmployees, useCreateEmployee } from "@/hooks/useEmployees";
import { useBulkCreateEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { downloadCSV, generateEmployeeTemplate } from "@/lib/utils";
import Papa from "papaparse";

const Upload = () => {
  const [employeesFile, setEmployeesFile] = useState<File | null>(null);
  const [costsFile, setCostsFile] = useState<File | null>(null);
  const [employeesValidation, setEmployeesValidation] = useState<any>(null);
  const [costsValidation, setCostsValidation] = useState<any>(null);
  const [costsValidationZod, setCostsValidationZod] = useState<UploadValidationResult<UploadCostRow> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "uploading" | "complete">("idle");
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const { data: companies } = useCompanies();
  const { data: existingEmployees } = useEmployees();
  const createEmployee = useCreateEmployee();
  const bulkCreateCosts = useBulkCreateEmployeeCosts();

  const handleEmployeesFileSelect = async (file: File) => {
    setEmployeesFile(file);
    setIsProcessing(true);
    setImportStatus("processing");

    try {
      const result = await parseEmployeesFile(file);
      setEmployeesValidation(result);
      setIsProcessing(false);
      setImportStatus("idle");
    } catch (error) {
      toast.error("Error al procesar el archivo de empleados");
      setIsProcessing(false);
      setImportStatus("idle");
    }
  };

  const handleCostsFileSelect = async (file: File) => {
    setCostsFile(file);
    setIsProcessing(true);
    setImportStatus("processing");

    try {
      if (!companies) {
        toast.error("Esperando catálogo de empresas...");
        setIsProcessing(false);
        setImportStatus("idle");
        return;
      }

      // Detectar cabeceras primero
      Papa.parse(file, {
        header: true,
        preview: 1,
        complete: (results) => {
          const headers = results.meta.fields || [];
          setCsvHeaders(headers);
        },
      });

      const result = await parseUploadCostsFile(file, companies, columnMapping);
      setCostsValidationZod(result);
      
      if (result.errorCount > 0) {
        toast.error(`${result.errorCount} filas con errores. Revisa el preview.`);
      } else if (result.warningCount > 0) {
        toast.warning(`${result.validCount} filas válidas, ${result.warningCount} con avisos.`);
      } else {
        toast.success(`✅ ${result.validCount} filas válidas.`);
      }
      
      setIsProcessing(false);
      setImportStatus("idle");
    } catch (error) {
      toast.error("Error al procesar el archivo de costes");
      setIsProcessing(false);
      setImportStatus("idle");
    }
  };

  const handleImport = async () => {
    if (!employeesValidation?.data.length && !costsValidationZod?.validCount) {
      toast.error("No hay datos válidos para importar");
      return;
    }

    setIsProcessing(true);
    setImportStatus("uploading");

    try {
      // NOTA: Esta funcionalidad de importación básica está deprecada.
      // Para nuevas importaciones usa A3NomCostsUpload o IntelligentUpload
      toast.error("Esta función de importación básica ha sido deprecada. Usa las pestañas 'A3Nom' o 'Inteligente'.");
      return;

      /* Código deprecado - mantener comentado
      if (employeesValidation?.data.length > 0) {
        await importEmployees({
          employees: employeesValidation.data as ParsedEmployee[],
          companies: companies || [],
          onProgress: (current, total) => setImportProgress({ current, total }),
        });
      }

      if (costsValidationZod?.validCount > 0) {
        const result = await importCosts({
          validation: costsValidationZod,
          companies: companies || [],
          onProgress: (current, total) => setImportProgress({ current, total }),
        });
        toast.success(`✅ ${result.imported} registros importados correctamente`);
      }
      */

      setImportStatus("complete");
      setTimeout(() => {
        setEmployeesFile(null);
        setCostsFile(null);
        setEmployeesValidation(null);
        setCostsValidationZod(null);
        setImportStatus("idle");
        setImportProgress({ current: 0, total: 0 });
      }, 2000);
    } catch (error: any) {
      toast.error(`Error en la importación: ${error.message}`);
      setImportStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const canImport =
    (employeesValidation?.data.length > 0 || costsValidationZod?.validCount > 0) &&
    (employeesValidation?.errors.length === 0 || !employeesValidation) &&
    (costsValidationZod?.errorCount === 0 || !costsValidationZod) &&
    !isProcessing;

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carga de Datos</h1>
        <p className="text-muted-foreground mt-1">
          Importa datos desde A3Nom mediante archivos CSV o Excel
        </p>
      </div>

      {/* Tabs for different import methods */}
      <Tabs defaultValue="intelligent" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="intelligent">
            <Sparkles className="w-4 h-4 mr-2" />
            IA Universal
          </TabsTrigger>
          <TabsTrigger value="csv">CSV Simple</TabsTrigger>
          <TabsTrigger value="a3nom">A3Nom Excel</TabsTrigger>
        </TabsList>

        {/* IA Universal Import Tab */}
        <TabsContent value="intelligent">
          <IntelligentUpload />
        </TabsContent>

        {/* CSV Import Tab */}
        <TabsContent value="csv" className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Formato CSV simple:</strong> Archivos CSV básicos con columnas estándar.
            </AlertDescription>
          </Alert>

          {/* Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employees Upload */}
        <Card className="apollo-card p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Datos de Empleados</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importa información de la plantilla
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const content = generateEmployeeTemplate();
                  downloadCSV(content, 'plantilla_empleados.csv');
                  toast.success('Plantilla descargada correctamente');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar plantilla
              </Button>
            </div>

            <FileDropzone
              onFileSelect={handleEmployeesFileSelect}
              accept=".csv"
            />

            {employeesValidation && (
              <ValidationResults
                errors={employeesValidation.errors}
                warnings={employeesValidation.warnings}
                successCount={employeesValidation.data.length}
              />
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium">Columnas requeridas:</p>
              <ul className="space-y-1 ml-4">
                <li>• nombre (nombre completo)</li>
                <li>• empresa</li>
                <li>• fecha_alta (DD/MM/YYYY)</li>
                <li>• dni (opcional)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Costs Upload */}
        <Card className="apollo-card p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Costes Mensuales</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Importa nóminas y costes empresa
                </p>
              </div>
            </div>

            <FileDropzone
              onFileSelect={handleCostsFileSelect}
              accept=".csv"
            />

            {csvHeaders.length > 0 && (
              <ColumnMapper
                headers={csvHeaders}
                onMappingChange={setColumnMapping}
              />
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium">Columnas requeridas:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>employee_id</strong> (opcional)</li>
                <li>• <strong>nif</strong> (DNI/NIE, formato 12345678A o X1234567A)</li>
                <li>• <strong>name</strong> (nombre completo)</li>
                <li>• <strong>company</strong> (nombre de empresa)</li>
                <li>• <strong>date</strong> (YYYY-MM)</li>
                <li>• <strong>bruto</strong> (bruto mensual)</li>
                <li>• <strong>coste_empresa</strong> (coste empresa)</li>
              </ul>
            </div>
          </div>
        </Card>
          </div>

          {/* Preview de costes con validación Zod */}
          {costsValidationZod && (
            <>
              {costsValidationZod.validCount > 0 && (
                <MatchingPreview
                  rows={costsValidationZod.rows
                    .filter(r => r.data)
                    .map(r => r.data!)}
                  companies={companies || []}
                />
              )}

              <Card className="apollo-card p-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Preview de Datos</h3>
                  <CostsPreviewTable rows={costsValidationZod.rows} pageSize={15} />
                </div>
              </Card>
              
              {costsValidationZod.companies.size > 0 && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Empresas normalizadas:</strong>
                    <ul className="mt-2 text-xs space-y-1">
                      {Array.from(costsValidationZod.companies.entries()).map(([orig, norm]) => (
                        <li key={orig}>
                          "{orig}" → <strong>{norm}</strong>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Process Button */}
          <Card className="apollo-card p-6">
        {isProcessing && importStatus !== "idle" ? (
          <ImportProgress
            current={importProgress.current}
            total={importProgress.total}
            status={importStatus}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">¿Listo para procesar?</h3>
              <p className="text-sm text-muted-foreground">
                {canImport
                  ? "Los datos están validados y listos para importar"
                  : "Carga y valida archivos antes de importar"}
              </p>
            </div>
            <Button
              size="lg"
              disabled={!canImport}
              onClick={handleImport}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Procesar Importación
            </Button>
          </div>
        )}
          </Card>
        </TabsContent>

        {/* A3Nom Import Tab */}
        <TabsContent value="a3nom">
          <A3NomCostsUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
