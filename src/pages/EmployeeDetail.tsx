import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useTransfers } from "@/hooks/useTransfers";
import { useEmployeeFinancials } from "@/hooks/useEmployeeFinancials";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Briefcase, FileText } from "lucide-react";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { KPICard } from "@/components/dashboard/KPICard";
import { GeneralInfoTab } from "@/components/employees/tabs/GeneralInfoTab";
import { CostsTab } from "@/components/employees/tabs/CostsTab";
import { TransfersTab } from "@/components/employees/tabs/TransfersTab";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id || "");
  const { data: costs, isLoading: isLoadingCosts } = useEmployeeCosts(id);
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers(id);
  
  const financials = useEmployeeFinancials(costs);

  if (isLoadingEmployee) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Empleado no encontrado</p>
            <Button onClick={() => navigate("/employees")} className="mt-4">
              Volver a empleados
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = !employee.termination_date;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/employees")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Empleados
        </Button>

        {/* Employee Header */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <AvatarInitials name={employee.full_name} />

            {/* Employee Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{employee.full_name}</h1>
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-success" : ""}>
                  {isActive ? "Activo" : "Inactivo"}
                </Badge>
                {employee.transfer_group && (
                  <Badge variant="outline" className="border-primary text-primary">
                    Traslado
                  </Badge>
                )}
              </div>

              {/* Organizational Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Salario Base Anual"
            value={financials.annualBaseSalary}
            format="currency"
          />
          <KPICard
            title="Coste Mensual"
            value={financials.monthlyCost}
            format="currency"
          />
          <KPICard
            title="Último Bruto"
            value={financials.lastGross}
            format="currency"
          />
          <KPICard
            title="Último Neto"
            value={financials.lastNet}
            format="currency"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="costs">Histórico de Nóminas</TabsTrigger>
            <TabsTrigger value="transfers">Movimientos Laborales</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <GeneralInfoTab employee={employee} financials={financials} />
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <CostsTab costs={costs || []} isLoading={isLoadingCosts} />
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4">
            <TransfersTab transfers={transfers || []} isLoading={isLoadingTransfers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
