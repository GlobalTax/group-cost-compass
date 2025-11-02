import { useState, useMemo } from "react";
import { Search, ClipboardPaste } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditableCell } from "@/components/ui/editable-cell";
import { Button } from "@/components/ui/button";
import { PastePayrollDialog } from "./PastePayrollDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useCostsByPeriod } from "@/hooks/useEmployeeCosts";
import { useUpsertEmployeeCost } from "@/hooks/useEmployeeCosts";
import type { Database } from "@/integrations/supabase/types";

type CostInsert = Database["public"]["Tables"]["hr_employee_costs"]["Insert"];

interface ManualPayrollTableProps {
  companyId: string;
  year: number;
  month: number;
}

export const ManualPayrollTable = ({ companyId, year, month }: ManualPayrollTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  
  const period = `${year}-${String(month).padStart(2, "0")}-01`;
  
  // Fetch empleados activos
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees({
    companyId: companyId === "all" ? undefined : companyId,
    activeOnly: true,
  });
  
  // Fetch costes del periodo
  const { data: costs = [], isLoading: loadingCosts } = useCostsByPeriod({
    year,
    month,
    companyId: companyId === "all" ? undefined : companyId,
  });
  
  const upsertMutation = useUpsertEmployeeCost();
  
  // Mapa de costes por empleado
  const costsMap = useMemo(() => {
    const map = new Map<string, typeof costs[0]>();
    costs.forEach(cost => {
      map.set(cost.employee_id, cost);
    });
    return map;
  }, [costs]);
  
  // Filtrar empleados por búsqueda
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    const term = searchTerm.toLowerCase();
    return employees.filter(emp => 
      emp.full_name.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);
  
  const handleSaveCell = async (
    employeeId: string,
    field: keyof CostInsert,
    value: number
  ) => {
    const existingCost = costsMap.get(employeeId);
    
    // Para IRPF y SS Trab, guardamos el valor absoluto
    const normalizedValue = (field === "irpf_dinero" || field === "ss_trabajador") 
      ? Math.abs(value) 
      : value;
    
    const payload: CostInsert = {
      employee_id: employeeId,
      period,
      [field]: normalizedValue,
      // Preservar valores existentes
      ...(existingCost && {
        bruto: existingCost.bruto,
        sal_neto: existingCost.sal_neto,
        coste_empresa: existingCost.coste_empresa,
        irpf_dinero: existingCost.irpf_dinero,
        ss_trabajador: existingCost.ss_trabajador,
        ss_empresa: existingCost.ss_empresa,
      }),
      // Sobrescribir con el nuevo valor
      [field]: normalizedValue,
    };
    
    await upsertMutation.mutateAsync(payload);
  };
  
  const isLoading = loadingEmployees || loadingCosts;
  
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y acciones */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar trabajador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPasteDialog(true)}
            disabled={isLoading}
          >
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Pegar desde Excel
          </Button>
          <div className="text-sm text-muted-foreground">
            {filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
      
      {/* Nota sobre 2ª paga */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
        💡 <strong>Importante:</strong> Si hay 2ª paga, introduce los totales del mes. El sistema guarda 1 registro por empleado y mes.
      </div>
      
      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Trabajador</TableHead>
                <TableHead className="text-right">Bruto (€)</TableHead>
                <TableHead className="text-right">Neto (€)</TableHead>
                <TableHead className="text-right">Coste Emp. (€)</TableHead>
                <TableHead className="text-right">IRPF (€)</TableHead>
                <TableHead className="text-right">SS Trab (€)</TableHead>
                <TableHead className="text-right">SS Emp (€)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Cargando empleados...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? "No se encontraron empleados" : "No hay empleados activos"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  const cost = costsMap.get(employee.id);
                  
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.full_name}
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={cost?.bruto ?? null}
                          onSave={(val) => handleSaveCell(employee.id, "bruto", val)}
                          format="currency"
                          min={0}
                          max={100000}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={cost?.sal_neto ?? null}
                          onSave={(val) => handleSaveCell(employee.id, "sal_neto", val)}
                          format="currency"
                          min={0}
                          max={100000}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={cost?.coste_empresa ?? null}
                          onSave={(val) => handleSaveCell(employee.id, "coste_empresa", val)}
                          format="currency"
                          min={0}
                          max={100000}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={cost?.irpf_dinero ? -cost.irpf_dinero : null}
                          onSave={(val) => handleSaveCell(employee.id, "irpf_dinero", val)}
                          format="currency"
                          min={-50000}
                          max={0}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={cost?.ss_trabajador ? -cost.ss_trabajador : null}
                          onSave={(val) => handleSaveCell(employee.id, "ss_trabajador", val)}
                          format="currency"
                          min={-50000}
                          max={0}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={cost?.ss_empresa ?? null}
                          onSave={(val) => handleSaveCell(employee.id, "ss_empresa", val)}
                          format="currency"
                          min={0}
                          max={50000}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Dialog de pegado masivo */}
      <PastePayrollDialog
        open={showPasteDialog}
        onOpenChange={setShowPasteDialog}
        employees={filteredEmployees}
        period={period}
        companyId={companyId}
      />
    </div>
  );
};
