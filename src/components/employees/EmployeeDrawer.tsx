import { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Building2, Briefcase, FileText } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useTransfers } from "@/hooks/useTransfers";
import { useEmployeeFinancials } from "@/hooks/useEmployeeFinancials";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { KPICard } from "@/components/dashboard/KPICard";
import { GeneralInfoTab } from "./tabs/GeneralInfoTab";
import { CostsTab } from "./tabs/CostsTab";
import { TransfersTab } from "./tabs/TransfersTab";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const getEmploymentStatusBadge = (status: string | null | undefined) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'active': { label: '✅ Activo', variant: 'default' },
    'leave_of_absence': { label: '🏖️ Excedencia', variant: 'secondary' },
    'maternity_leave': { label: '👶 Maternal', variant: 'secondary' },
    'paternity_leave': { label: '👨‍👦 Paternal', variant: 'secondary' },
    'medical_leave': { label: '🏥 Baja Médica', variant: 'secondary' },
    'sabbatical': { label: '🌍 Sabático', variant: 'secondary' },
    'unpaid_leave': { label: '⏸️ Sin sueldo', variant: 'outline' },
    'suspended': { label: '⚠️ Suspendido', variant: 'destructive' },
    'terminated': { label: '❌ Finalizado', variant: 'destructive' },
  };
  
  return statusMap[status || 'active'] || statusMap['active'];
};

interface EmployeeDrawerProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeDrawer = ({ employeeId, open, onOpenChange }: EmployeeDrawerProps) => {
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(employeeId || "");
  const { data: costs, isLoading: isLoadingCosts } = useEmployeeCosts(employeeId || undefined);
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers(employeeId || undefined);
  
  const financials = useEmployeeFinancials(costs);
  
  // Get latest cost for editing
  const latestCost = costs && costs.length > 0 
    ? [...costs].sort((a, b) => b.period.localeCompare(a.period))[0]
    : null;

  // Reset scroll when opening
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!employeeId) return null;

  const isActive = employee && !employee.termination_date;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-w-4xl mx-auto">
        <DrawerHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isLoadingEmployee ? (
                <Skeleton className="h-8 w-64" />
              ) : employee ? (
                <div className="flex items-start gap-4">
                  <AvatarInitials name={employee.full_name} className="h-16 w-16" />
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <DrawerTitle className="text-2xl font-bold">
                          {employee.full_name}
                        </DrawerTitle>
                        <Badge variant={getEmploymentStatusBadge(employee.employment_status).variant}>
                          {getEmploymentStatusBadge(employee.employment_status).label}
                        </Badge>
                        {employee.transfer_group && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Traslado
                          </Badge>
                        )}
                      </div>
                      {employee.leave_start_date && (
                        <p className="text-xs text-muted-foreground">
                          Desde: {format(new Date(employee.leave_start_date), 'dd/MM/yyyy', { locale: es })}
                          {employee.leave_end_date && ` → ${format(new Date(employee.leave_end_date), 'dd/MM/yyyy', { locale: es })}`}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Código:</span>
                        <span className="font-medium">{employee.employee_code || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{employee.companies?.name || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{employee.department || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{employee.contract_type || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-6">
          {isLoadingEmployee ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : employee ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                <KPICard
                  title="Salario Base Anual"
                  value={financials.annualBaseSalary}
                  format="currency"
                  className="p-4"
                />
                <KPICard
                  title="Coste Mensual"
                  value={financials.monthlyCost}
                  format="currency"
                  className="p-4"
                />
                <KPICard
                  title="Último Bruto"
                  value={financials.lastGross}
                  format="currency"
                  className="p-4"
                />
                <KPICard
                  title="Último Neto"
                  value={financials.lastNet}
                  format="currency"
                  className="p-4"
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="costs">Nóminas</TabsTrigger>
                  <TabsTrigger value="transfers">Traslados</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <GeneralInfoTab employee={employee} financials={financials} latestCost={latestCost} />
                </TabsContent>

                <TabsContent value="costs" className="space-y-4">
                  <CostsTab costs={costs || []} employeeId={employeeId} isLoading={isLoadingCosts} />
                </TabsContent>

                <TabsContent value="transfers" className="space-y-4">
                  <TransfersTab transfers={transfers || []} isLoading={isLoadingTransfers} />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <p className="text-center text-foreground py-8">Empleado no encontrado</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
