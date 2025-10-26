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
      // 1. Obtener catálogo de empresas
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id, name, nif");

      if (companiesError) throw companiesError;

      if (!companies || companies.length === 0) {
        toast.error("No se pudieron cargar las empresas del catálogo");
        return;
      }

      // Crear mapa NIF → company info
      const companyMap = new Map(
        companies.map(c => [c.nif, { id: c.id, name: c.name }])
      );

      // 2. Validar que todas las empresas del archivo existan en el catálogo
      const missingCompanies = new Set<string>();
      for (const cost of validation.data) {
        if (!companyMap.has(cost.company_nif)) {
          missingCompanies.add(`${cost.company_name} (${cost.company_nif})`);
        }
      }

      if (missingCompanies.size > 0) {
        toast.error(
          `Empresas no encontradas en el catálogo: ${Array.from(missingCompanies).join(", ")}`
        );
        setImporting(false);
        return;
      }

      // 3. Obtener mapping de employee_code a employee_id
      const employeeCodes = validation.data.map(d => d.employee_code);
      const { data: employees, error: employeeError } = await supabase
        .from("hr_employees")
        .select("id, employee_code, full_name, company_id")
        .in("employee_code", employeeCodes);

      if (employeeError) throw employeeError;

      const employeeMap = new Map(
        employees?.map(e => [e.employee_code, { id: e.id, companyId: e.company_id }]) || []
      );

      // 4. Preparar registros de costes con validaciones
      const costsToInsert = validation.data
        .filter(d => {
          const hasEmployee = employeeMap.has(d.employee_code);
          const hasCompany = companyMap.has(d.company_nif);
          
          if (!hasEmployee) {
            toast.warning(
              `Empleado ${d.employee_name} (${d.employee_code}) de ${d.company_name} no encontrado en el sistema`
            );
          }
          
          // Validar que la empresa del archivo coincida con la del empleado en BD
          if (hasEmployee && hasCompany) {
            const employeeInfo = employeeMap.get(d.employee_code)!;
            const fileCompanyId = companyMap.get(d.company_nif)!.id;
            
            if (employeeInfo.companyId !== fileCompanyId) {
              toast.warning(
                `⚠️ ${d.employee_name}: En archivo aparece en ${d.company_name}, pero en BD está en otra empresa. Posible transferencia reciente.`
              );
            }
          }
          
          return hasEmployee && hasCompany;
        })
        .map(d => ({
          employee_id: employeeMap.get(d.employee_code)!.id,
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

      // 5. Verificar si ya existen costes para este período
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

      // 6. Importar en lotes
      const BATCH_SIZE = 50;
      for (let i = 0; i < costsToInsert.length; i += BATCH_SIZE) {
        const batch = costsToInsert.slice(i, i + BATCH_SIZE);
        await bulkCreateCosts.mutateAsync(batch);
        setImportProgress({ current: Math.min(i + BATCH_SIZE, costsToInsert.length), total: costsToInsert.length });
      }

      const companiesCount = validation.summary.companiesDetected;
      toast.success(
        `✅ Importación completada: ${costsToInsert.length} registros de ${companiesCount} empresa${companiesCount > 1 ? 's' : ''}`
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
