import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { ValidationResults } from "@/components/upload/ValidationResults";
import { ImportProgress } from "@/components/upload/ImportProgress";
import { parseEmployeesFile, type ParsedEmployee } from "@/lib/parsers/employeeParser";
import { parseCostsFile, type ParsedCost } from "@/lib/parsers/costsParser";
import { useCompanies } from "@/hooks/useCompanies";
import { useEmployees, useCreateEmployee } from "@/hooks/useEmployees";
import { useBulkCreateEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { toast } from "sonner";

const Upload = () => {
  const [employeesFile, setEmployeesFile] = useState<File | null>(null);
  const [costsFile, setCostsFile] = useState<File | null>(null);
  const [employeesValidation, setEmployeesValidation] = useState<any>(null);
  const [costsValidation, setCostsValidation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "uploading" | "complete">("idle");
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

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
      const result = await parseCostsFile(file);
      setCostsValidation(result);
      setIsProcessing(false);
      setImportStatus("idle");
    } catch (error) {
      toast.error("Error al procesar el archivo de costes");
      setIsProcessing(false);
      setImportStatus("idle");
    }
  };

  const handleImport = async () => {
    if (!employeesValidation?.data.length && !costsValidation?.data.length) {
      toast.error("No hay datos válidos para importar");
      return;
    }

    setIsProcessing(true);
    setImportStatus("uploading");

    try {
      // Import employees first
      if (employeesValidation?.data.length > 0) {
        setImportProgress({ current: 0, total: employeesValidation.data.length });
        
        for (const emp of employeesValidation.data as ParsedEmployee[]) {
          // Find company by name
          const company = companies?.find((c) => c.name === emp.company_name);
          
          if (company) {
            await createEmployee.mutateAsync({
              full_name: emp.full_name,
              dni: emp.dni || null,
              company_id: company.id,
              hire_date: emp.hire_date,
              termination_date: emp.termination_date || null,
              seniority_date: emp.seniority_date || null,
              transfer_group: emp.transfer_group || false,
              notes: emp.notes || null,
            });
            
            setImportProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          }
        }
      }

      // Import costs
      if (costsValidation?.data.length > 0) {
        setImportProgress({ current: 0, total: costsValidation.data.length });
        
        // Map DNI to employee_id
        const costsToImport = (costsValidation.data as ParsedCost[])
          .map((cost) => {
            const employee = existingEmployees?.find((e) => e.dni === cost.dni);
            if (!employee) return null;
            
            return {
              employee_id: employee.id,
              period: cost.period,
              bruto: cost.bruto,
              coste_empresa: cost.coste_empresa,
            };
          })
          .filter((c) => c !== null);

        if (costsToImport.length > 0) {
          await bulkCreateCosts.mutateAsync(costsToImport as any);
        }
      }

      setImportStatus("complete");
      toast.success("Importación completada exitosamente");
      
      // Reset after 2 seconds
      setTimeout(() => {
        setEmployeesFile(null);
        setCostsFile(null);
        setEmployeesValidation(null);
        setCostsValidation(null);
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
    (employeesValidation?.data.length > 0 || costsValidation?.data.length > 0) &&
    (employeesValidation?.errors.length === 0 || !employeesValidation) &&
    (costsValidation?.errors.length === 0 || !costsValidation) &&
    !isProcessing;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carga de Datos</h1>
          <p className="text-muted-foreground mt-1">
            Importa datos desde A3Nom mediante archivos CSV o Excel
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Formato requerido:</strong> Los archivos deben seguir el formato estándar de exportación de A3Nom.
            Descarga las plantillas de ejemplo si es tu primera importación.
          </AlertDescription>
        </Alert>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employees Upload */}
          <Card className="glass-card p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Datos de Empleados</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importa información de la plantilla
                  </p>
                </div>
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
                  <li>• fecha_baja (opcional, DD/MM/YYYY)</li>
                  <li>• fecha_antiguedad (opcional, DD/MM/YYYY)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Costs Upload */}
          <Card className="glass-card p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-success" />
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

              {costsValidation && (
                <ValidationResults
                  errors={costsValidation.errors}
                  warnings={costsValidation.warnings}
                  successCount={costsValidation.data.length}
                />
              )}

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium">Columnas requeridas:</p>
                <ul className="space-y-1 ml-4">
                  <li>• dni (DNI/NIE del empleado)</li>
                  <li>• periodo (YYYY-MM)</li>
                  <li>• bruto (bruto mensual)</li>
                  <li>• coste_empresa (coste empresa)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Process Button */}
        <Card className="glass-elevated p-6">
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
                className="gradient-primary"
                disabled={!canImport}
                onClick={handleImport}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Procesar Importación
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Imports */}
        <Card className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Importaciones Recientes</h3>
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay importaciones previas</p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Upload;
