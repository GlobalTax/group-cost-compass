import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEmployees } from "@/hooks/useEmployees";
import { useCompensationBands } from "@/hooks/useCompensationBands";
import { useEmployeeCostsSummary } from "@/hooks/useEmployeeCostsSummary";

export function OutOfBandAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: employees } = useEmployees();
  const { data: bands } = useCompensationBands();
  const { data: costsSummary } = useEmployeeCostsSummary();

  const activeEmployees = employees?.filter((emp) => !emp.termination_date) || [];

  const employeesOutOfBand = activeEmployees
    .map((emp) => {
      const band = bands?.find(
        (b) =>
          b.level === emp.compensation_level &&
          b.department === emp.department &&
          b.is_active
      );

      if (!band) return null;

      const employeeCosts = costsSummary?.find((c) => c.employee_id === emp.id);
      const annualSalary = employeeCosts?.bruto_anual || 0;

      if (annualSalary === 0) return null;

      const isBelow = annualSalary < band.min_salary;
      const isAbove = annualSalary > band.max_salary;

      if (!isBelow && !isAbove) return null;

      return {
        employee: emp,
        band,
        annualSalary,
        status: isBelow ? "below" : "above",
        diff: isBelow
          ? band.min_salary - annualSalary
          : annualSalary - band.max_salary,
      };
    })
    .filter(Boolean);

  if (employeesOutOfBand.length === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Empleados fuera de banda salarial</AlertTitle>
      <AlertDescription>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <p className="text-sm">
              {employeesOutOfBand.length} empleado(s) con salarios fuera del rango definido
            </p>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive-foreground">
                {isOpen ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Ver detalle
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-4 space-y-2">
            {employeesOutOfBand.map((item) => {
              if (!item) return null;
              
              return (
                <div
                  key={item.employee.id}
                  className="flex items-center justify-between p-3 bg-background rounded-md border border-border"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {item.employee.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{item.band.department}</span>
                      <span>•</span>
                      <span>{item.band.level}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono text-sm text-foreground">
                      {formatCurrency(item.annualSalary)}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Badge variant={item.status === "below" ? "destructive" : "default"}>
                        {item.status === "below" ? "▼" : "▲"} {formatCurrency(item.diff)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Banda: {formatCurrency(item.band.min_salary)} -{" "}
                        {formatCurrency(item.band.max_salary)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </AlertDescription>
    </Alert>
  );
}
