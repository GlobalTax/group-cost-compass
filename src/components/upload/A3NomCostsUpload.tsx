import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDropzone } from "./FileDropzone";
import { ValidationResults } from "./ValidationResults";
import { ImportProgress } from "./ImportProgress";
import { parseA3NomCostsFile, type A3NomParseResult } from "@/lib/parsers/a3nomCostsParser";
import { useBulkCreateEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InfoIcon, Upload } from "lucide-react";

export const A3NomCostsUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [period, setPeriod] = useState<string>("");
  const [validation, setValidation] = useState<A3NomParseResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const bulkCreateCosts = useBulkCreateEmployeeCosts();

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
      // 1. Obtener mapping de employee_code a employee_id
      const employeeCodes = validation.data.map(d => d.employee_code);
      const { data: employees, error: employeeError } = await supabase
        .from("hr_employees")
        .select("id, employee_code, full_name")
        .in("employee_code", employeeCodes);

      if (employeeError) throw employeeError;

      const employeeMap = new Map(
        employees?.map(e => [e.employee_code, e.id]) || []
      );

      // 2. Preparar registros de costes
      const costsToInsert = validation.data
        .filter(d => {
          const hasEmployee = employeeMap.has(d.employee_code);
          if (!hasEmployee) {
            toast.warning(`Empleado ${d.employee_name} (${d.employee_code}) no encontrado en el sistema`);
          }
          return hasEmployee;
        })
        .map(d => ({
          employee_id: employeeMap.get(d.employee_code)!,
          period: `${period}-01`,
          bruto: d.bruto,
          coste_empresa: d.coste_empresa,
          sal_neto: d.sal_neto,
          total_tc1: d.total_tc1,
          irpf_dinero: d.irpf_dinero,
          irpf_especie: d.irpf_especie,
          ss_trabajador: d.ss_trabajador,
          ss_empresa: d.ss_empresa,
          anticipos: d.anticipos,
          embargos: d.embargos,
          dto_preaviso: d.dto_preaviso,
          dtos_varios: d.dtos_varios,
          prestamos: d.prestamos,
          dto_especial: d.dto_especial,
          indemnizacion: d.indemnizacion,
          enf_acc: d.enf_acc,
          bonificacion: d.bonificacion,
          porcentaje_imputacion: d.porcentaje_imputacion,
        }));

      if (costsToInsert.length === 0) {
        throw new Error("No hay datos válidos para importar");
      }

      // 3. Verificar si ya existen costes para este período
      const { data: existing } = await supabase
        .from("hr_employee_costs")
        .select("id")
        .eq("period", `${period}-01`)
        .in("employee_id", costsToInsert.map(c => c.employee_id))
        .limit(1);

      if (existing && existing.length > 0) {
        const confirmOverwrite = window.confirm(
          `Ya existen costes para el período ${period}. ¿Deseas sobrescribirlos?`
        );
        
        if (!confirmOverwrite) {
          setImporting(false);
          return;
        }

        // Eliminar costes existentes
        await supabase
          .from("hr_employee_costs")
          .delete()
          .eq("period", `${period}-01`)
          .in("employee_id", costsToInsert.map(c => c.employee_id));
      }

      // 4. Importar en lotes
      const BATCH_SIZE = 50;
      for (let i = 0; i < costsToInsert.length; i += BATCH_SIZE) {
        const batch = costsToInsert.slice(i, i + BATCH_SIZE);
        await bulkCreateCosts.mutateAsync(batch);
        setImportProgress({ current: Math.min(i + BATCH_SIZE, costsToInsert.length), total: costsToInsert.length });
      }

      toast.success(`✅ Importación completada: ${costsToInsert.length} registros`);
      
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
          <strong>Importación A3Nom:</strong> Sube el archivo Excel exportado desde A3Nom con formato de nóminas.
          El sistema detectará automáticamente empleados duplicados y consolidará sus líneas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Período de Nómina</CardTitle>
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
          <CardTitle>Archivo A3Nom</CardTitle>
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
            <CardTitle>Resultados de Validación A3Nom</CardTitle>
          </CardHeader>
          <CardContent>
            <ValidationResults
              errors={validation.errors}
              warnings={validation.warnings}
              successCount={validation.data.length}
            />

            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Resumen:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Empleados</p>
                  <p className="text-lg font-bold">{validation.summary.totalEmployees}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Bruto</p>
                  <p className="text-lg font-bold">{validation.summary.totalBruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Coste Empresa</p>
                  <p className="text-lg font-bold">{validation.summary.totalCoste.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                </div>
              </div>
            </div>
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
