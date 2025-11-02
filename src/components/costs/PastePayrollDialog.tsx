import { useState } from "react";
import { Check, AlertCircle, ClipboardPaste, UserPlus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasteArea } from "@/components/upload/PasteArea";
import { useBulkUpsertEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useCompanies } from "@/hooks/useCompanies";
import { parseNumber } from "@/lib/parsers/a3nom/numberParser";
import { createEmployee } from "@/lib/supabase/repositories/employees.repo";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["hr_employees"]["Row"];
type CostInsert = Database["public"]["Tables"]["hr_employee_costs"]["Insert"];

interface ParsedPayroll {
  rawName: string;
  employee: Employee | null;
  bruto: number;
  neto: number;
  coste_empresa: number;
  irpf_dinero: number;
  ss_trabajador: number;
  ss_empresa: number;
  hasMatch: boolean;
  isNewEmployee?: boolean;
  newEmployeeData?: {
    full_name: string;
    company_id?: string;
    hire_date: string;
  };
}

interface PastePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  period: string;
  companyId: string;
}

/**
 * Normaliza un nombre de empleado para matching
 * - Quita markdown (** y *)
 * - Quita notas entre paréntesis como "(2 págas)"
 * - Normaliza espacios y lowercase
 */
const normalizeEmployeeName = (name: string): string => {
  return name
    .replace(/\*\*/g, "") // Quitar bold markdown
    .replace(/\*/g, "") // Quitar italic markdown
    .replace(/\(.*?\)/g, "") // Quitar (2 págas) y similares
    .trim()
    .toLowerCase();
};

/**
 * Busca un empleado por nombre fuzzy con soporte para formato "Apellidos, Nombre"
 */
const findEmployeeByName = (
  pastedName: string,
  employees: Employee[]
): Employee | null => {
  let normalized = normalizeEmployeeName(pastedName);
  
  // Si tiene formato "Apellidos, Nombre" → convertir a "Nombre Apellidos"
  if (normalized.includes(",")) {
    const [apellidos, nombre] = normalized.split(",").map(s => s.trim());
    normalized = `${nombre} ${apellidos}`;
  }
  
  // 1. Buscar coincidencia exacta primero
  let match = employees.find(emp => 
    emp.full_name.toLowerCase() === normalized
  );
  
  if (match) return match;
  
  // 2. Buscar por palabras clave (todas las palabras deben estar presentes)
  const words = normalized.split(/\s+/).filter(w => w.length > 2); // Ignorar palabras cortas
  match = employees.find(emp => {
    const empLower = emp.full_name.toLowerCase();
    return words.every(word => empLower.includes(word));
  });
  
  if (match) return match;
  
  // 3. Buscar por al menos 2 palabras coincidentes (apellidos compuestos)
  match = employees.find(emp => {
    const empLower = emp.full_name.toLowerCase();
    const matchCount = words.filter(word => empLower.includes(word)).length;
    return matchCount >= 2 && matchCount >= words.length - 1;
  });
  
  return match || null;
};

/**
 * Mapea columnas flexibles a campos esperados
 */
const getColumnValue = (row: Record<string, any>, possibleNames: string[]): any => {
  for (const name of possibleNames) {
    // Buscar exacto
    if (row[name] !== undefined && row[name] !== "") return row[name];
    
    // Buscar case-insensitive y sin espacios extra
    const normalizedName = name.toLowerCase().trim();
    for (const key of Object.keys(row)) {
      if (key.toLowerCase().trim() === normalizedName && row[key] !== "") {
        return row[key];
      }
    }
  }
  return "";
};

export const PastePayrollDialog = ({
  open,
  onOpenChange,
  employees,
  period,
  companyId,
}: PastePayrollDialogProps) => {
  const [step, setStep] = useState<"paste" | "preview">("paste");
  const [parsedData, setParsedData] = useState<ParsedPayroll[]>([]);
  const bulkUpsert = useBulkUpsertEmployeeCosts();
  const { data: companies = [] } = useCompanies();

  // Helper para obtener org_id de empresa
  const getCompanyOrgId = (companyId: string): string | undefined => {
    return companies.find(c => c.id === companyId)?.org_id;
  };

  const handleParsedData = (rows: Array<Record<string, any>>) => {
    console.log("📊 Filas parseadas:", rows.length);
    console.log("📋 Primera fila:", rows[0]);
    console.log("🔑 Columnas detectadas:", rows[0] ? Object.keys(rows[0]) : []);
    
    const mapped: ParsedPayroll[] = rows.map((row) => {
      const rawName = getColumnValue(row, ["Trabajador", "trabajador", "Nombre", "nombre"]);
      const employee = findEmployeeByName(rawName, employees);

      const bruto = parseNumber(getColumnValue(row, ["Bruto (€)", "Bruto", "bruto"])) ?? 0;
      const neto = parseNumber(getColumnValue(row, ["Neto (€)", "Neto", "neto"])) ?? 0;
      const coste_empresa = parseNumber(getColumnValue(row, ["Coste Emp. (€)", "Coste Emp.", "coste_empresa"])) ?? 0;
      const irpf = parseNumber(getColumnValue(row, ["IRPF (€)", "IRPF", "irpf"])) ?? 0;
      const ss_trab = parseNumber(getColumnValue(row, ["SS Trab (€)", "SS Trab", "ss_trabajador"])) ?? 0;
      const ss_emp = parseNumber(getColumnValue(row, ["SS Emp (€)", "SS Emp.", "ss_empresa"])) ?? 0;

      return {
        rawName,
        employee,
        bruto,
        neto,
        coste_empresa,
        irpf_dinero: Math.abs(irpf), // Convertir a absoluto
        ss_trabajador: Math.abs(ss_trab), // Convertir a absoluto
        ss_empresa: Math.abs(ss_emp),
        hasMatch: !!employee,
      };
    });

    // Filtrar filas con nombre vacío y duplicados
    const uniqueMap = new Map<string, ParsedPayroll>();
    
    mapped.forEach((row) => {
      if (!row.rawName || row.rawName.trim() === "") return; // Skip vacíos
      
      const key = `${row.employee?.id || row.rawName.toLowerCase()}`;
      
      // Si ya existe, mantener la que tenga valores > 0
      if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key)!;
        if (row.bruto > 0 && existing.bruto === 0) {
          uniqueMap.set(key, row); // Reemplazar con valores reales
        }
      } else {
        uniqueMap.set(key, row);
      }
    });

    const deduplicated = Array.from(uniqueMap.values());
    
    console.log("✅ Filas únicas:", deduplicated.length);
    
    setParsedData(deduplicated);
    setStep("preview");
  };

  const handleSaveAll = async () => {
    try {
      // 1️⃣ Identificar empleados nuevos a crear
      const rowsToCreate = parsedData.filter(p => p.isNewEmployee && p.newEmployeeData);
      
      // Validación: todos los nuevos deben tener company_id válido
      const missingCompany = rowsToCreate.filter(r => !r.newEmployeeData?.company_id);
      if (missingCompany.length > 0) {
        toast.error("Selecciona una empresa para los nuevos empleados");
        return;
      }
      
      // 2️⃣ Crear empleados nuevos en batch
      const newEmployees: Employee[] = [];
      if (rowsToCreate.length > 0) {
        console.log(`📝 Creando ${rowsToCreate.length} empleados nuevos...`);
        
        for (const row of rowsToCreate) {
          const orgId = getCompanyOrgId(row.newEmployeeData!.company_id!);
          if (!orgId) {
            throw new Error(`No se pudo determinar la organización de la empresa seleccionada`);
          }
          
          // 🔍 DEBUGGING: Log detallado antes de crear empleado
          console.log("🔍 ========== DEBUGGING CREAR EMPLEADO ==========");
          console.log("🔍 Datos del empleado a crear:", {
            full_name: row.newEmployeeData!.full_name,
            company_id: row.newEmployeeData!.company_id,
            hire_date: row.newEmployeeData!.hire_date,
            org_id: orgId,
          });
          console.log("🔍 Cliente Supabase importado desde:", "@/lib/supabase/repositories/employees.repo");
          console.log("🔍 Period:", period);
          console.log("🔍 Row completo:", row);
          
          const newEmp = await createEmployee({
            full_name: row.newEmployeeData!.full_name,
            company_id: row.newEmployeeData!.company_id!,
            hire_date: row.newEmployeeData!.hire_date,
            org_id: orgId,
            notes: `Creado automáticamente desde importación de nóminas ${period}`,
          });
          newEmployees.push(newEmp);
          
          // Actualizar parsedData con el empleado recién creado
          const idx = parsedData.findIndex(r => r === row);
          if (idx !== -1) {
            parsedData[idx].employee = newEmp;
          }
        }
        
        console.log(`✅ ${newEmployees.length} empleados creados correctamente`);
      }
      
      // 3️⃣ Preparar costes (ahora todos tienen employee_id)
      const validRows = parsedData.filter(p => p.hasMatch && p.employee);
      
      const costs: CostInsert[] = validRows.map(p => ({
        employee_id: p.employee!.id,
        period,
        bruto: p.bruto,
        sal_neto: p.neto,
        coste_empresa: p.coste_empresa,
        irpf_dinero: p.irpf_dinero,
        ss_trabajador: p.ss_trabajador,
        ss_empresa: p.ss_empresa,
      }));
      
      // 4️⃣ Guardar costes en bulk
      await bulkUpsert.mutateAsync(costs);
      
      // 5️⃣ Resetear y cerrar
      onOpenChange(false);
      setStep("paste");
      setParsedData([]);
      
      // Toast personalizado si se crearon empleados
      if (newEmployees.length > 0) {
        toast.success(
          `✅ ${newEmployees.length} empleado${newEmployees.length > 1 ? 's' : ''} nuevo${newEmployees.length > 1 ? 's' : ''} creado${newEmployees.length > 1 ? 's' : ''} + ${costs.length} nómina${costs.length > 1 ? 's' : ''} guardada${costs.length > 1 ? 's' : ''}`
        );
      }
    } catch (error: any) {
      // 🔍 DEBUGGING: Capturar error completo con todos los detalles
      console.error("❌ ========== ERROR COMPLETO ==========");
      console.error("❌ Error objeto completo:", error);
      console.error("❌ Error.message:", error?.message);
      console.error("❌ Error.stack:", error?.stack);
      console.error("❌ Error.code:", error?.code);
      console.error("❌ Error.details:", error?.details);
      console.error("❌ Error.hint:", error?.hint);
      console.error("❌ Supabase error:", error?.error);
      console.error("❌ Error serializado:", JSON.stringify(error, null, 2));
      console.error("❌ Type of error:", typeof error);
      console.error("❌ Error constructor:", error?.constructor?.name);
      
      const message = error?.message || error?.error?.message || "";
      toast.error(`Error al guardar: ${message || 'revisa la consola con F12'}`);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("paste");
    setParsedData([]);
  };

  const handleManualEmployeeSelect = (index: number, employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId) || null;
    setParsedData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        employee,
        hasMatch: !!employee,
      };
      return updated;
    });
  };

  const handleMarkAsNewEmployee = (index: number) => {
    const row = parsedData[index];
    
    // Convertir "Apellidos, Nombre" a "Nombre Apellidos"
    let fullName = row.rawName.replace(/\*\*/g, "").replace(/\(.*?\)/g, "").trim();
    if (fullName.includes(",")) {
      const [apellidos, nombre] = fullName.split(",").map(s => s.trim());
      fullName = `${nombre} ${apellidos}`;
    }
    
    setParsedData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isNewEmployee: true,
        hasMatch: companyId !== 'all', // Solo marcar como resuelto si hay empresa
        newEmployeeData: {
          full_name: fullName,
          company_id: companyId !== 'all' ? companyId : undefined,
          hire_date: period,
        },
      };
      return updated;
    });
  };

  const handleCancelNewEmployee = (index: number) => {
    setParsedData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isNewEmployee: false,
        hasMatch: false,
        newEmployeeData: undefined,
      };
      return updated;
    });
  };

  const handleCompanySelect = (index: number, selectedCompanyId: string) => {
    setParsedData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        hasMatch: true, // Ahora sí está resuelto
        newEmployeeData: {
          ...updated[index].newEmployeeData!,
          company_id: selectedCompanyId,
        },
      };
      return updated;
    });
  };

  const matchedCount = parsedData.filter((p) => p.hasMatch).length;
  const unassignedCount = parsedData.filter((p) => !p.hasMatch).length;
  const missingCompanyCount = parsedData.filter(
    p => p.isNewEmployee && !p.newEmployeeData?.company_id
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5" />
            Pegar nóminas desde Excel
          </DialogTitle>
          <DialogDescription>
            {step === "paste"
              ? "Copia y pega la tabla completa desde Excel o Google Sheets (incluye encabezados)"
              : `${matchedCount} de ${parsedData.length} nóminas coinciden con empleados activos`}
          </DialogDescription>
          {companyId === 'all' && step === "preview" && (
            <Alert className="mt-2">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Estás en <strong>Todas las empresas</strong>. Para crear empleados nuevos debes asignar la empresa en cada fila.
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === "paste" ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                💡 <strong>Columnas esperadas:</strong> Trabajador, Bruto (€), Neto (€), Coste Emp. (€), IRPF (€), SS Trab (€), SS Emp (€)
              </div>
              <PasteArea onParsedData={handleParsedData} />
            </div>
          ) : (
            <PreviewTable 
              data={parsedData} 
              employees={employees}
              companies={companies}
              companyId={companyId}
              onEmployeeSelect={handleManualEmployeeSelect}
              onMarkAsNew={handleMarkAsNewEmployee}
              onCancelNew={handleCancelNewEmployee}
              onCompanySelect={handleCompanySelect}
            />
          )}
        </div>

        <DialogFooter>
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("paste")}>
                Volver
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={unassignedCount > 0 || missingCompanyCount > 0 || bulkUpsert.isPending}
              >
                {bulkUpsert.isPending 
                  ? "Guardando..." 
                  : missingCompanyCount > 0
                  ? `Selecciona empresa en ${missingCompanyCount} fila${missingCompanyCount > 1 ? 's' : ''}`
                  : unassignedCount > 0
                  ? `Asigna ${unassignedCount} empleado${unassignedCount > 1 ? 's' : ''} faltante${unassignedCount > 1 ? 's' : ''}`
                  : `Guardar ${matchedCount} nómina${matchedCount !== 1 ? "s" : ""}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Tabla de preview con indicadores de match y selector manual
 */
const PreviewTable = ({ 
  data, 
  employees,
  companies,
  companyId,
  onEmployeeSelect,
  onMarkAsNew,
  onCancelNew,
  onCompanySelect
}: { 
  data: ParsedPayroll[];
  employees: Employee[];
  companies: any[];
  companyId: string;
  onEmployeeSelect: (index: number, employeeId: string) => void;
  onMarkAsNew: (index: number) => void;
  onCancelNew: (index: number) => void;
  onCompanySelect: (index: number, companyId: string) => void;
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Trabajador</TableHead>
            <TableHead>Empleado encontrado</TableHead>
            <TableHead className="text-right">Bruto</TableHead>
            <TableHead className="text-right">Neto</TableHead>
            <TableHead className="text-right">Coste Emp.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={idx}
              className={!row.hasMatch ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}
            >
              <TableCell>
                {row.hasMatch ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </TableCell>
              <TableCell className="font-medium">{row.rawName}</TableCell>
              <TableCell>
                {row.isNewEmployee ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <UserPlus className="h-4 w-4" />
                      <span className="font-medium">Se creará: {row.newEmployeeData?.full_name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancelNew(idx)}
                        className="h-6 px-2 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                    
                    {companyId === 'all' && !row.newEmployeeData?.company_id && (
                      <Select
                        value={row.newEmployeeData?.company_id || ""}
                        onValueChange={(selectedCompanyId) => onCompanySelect(idx, selectedCompanyId)}
                      >
                        <SelectTrigger className="w-[250px] h-8 text-xs">
                          <SelectValue placeholder="⚠️ Selecciona empresa..." />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map(comp => (
                            <SelectItem key={comp.id} value={comp.id} className="text-xs">
                              {comp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {companyId === 'all' && row.newEmployeeData?.company_id && (
                      <div className="text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3 inline mr-1" />
                        {companies.find(c => c.id === row.newEmployeeData?.company_id)?.name}
                      </div>
                    )}
                  </div>
                ) : row.hasMatch ? (
                  <span className="text-sm">
                    {row.employee!.full_name}
                    <span className="text-muted-foreground ml-2">
                      ({row.employee!.employee_code || row.employee!.company_id})
                    </span>
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={row.employee?.id || ""}
                      onValueChange={(employeeId) => onEmployeeSelect(idx, employeeId)}
                    >
                      <SelectTrigger className="w-[250px] h-8 text-xs">
                        <SelectValue placeholder="Seleccionar empleado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id} className="text-xs">
                            {emp.full_name} {emp.employee_code && `(${emp.employee_code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkAsNew(idx)}
                      className="h-8 px-3 text-xs whitespace-nowrap"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Crear nuevo
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {row.bruto.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell className="text-right">
                {row.neto.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell className="text-right">
                {row.coste_empresa.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};