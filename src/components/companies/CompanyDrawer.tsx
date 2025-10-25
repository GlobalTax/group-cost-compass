import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Users, Euro, TrendingUp, ArrowRightLeft, Building2 } from "lucide-react";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { TransfersTimeline } from "@/components/transfers/TransfersTimeline";
import { useState } from "react";
import { EmployeeDrawer } from "@/components/employees/EmployeeDrawer";

interface CompanyDrawerProps {
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompanyDrawer = ({ companyId, open, onOpenChange }: CompanyDrawerProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: company, isLoading } = useQuery({
    queryKey: ["company-detail", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return null;

      // Get company info
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      // Get active employees
      const { data: employees, count: activeEmployees } = await supabase
        .from("hr_employees")
        .select("*", { count: "exact" })
        .eq("company_id", companyId)
        .is("termination_date", null);

      // Get costs for current year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const { data: costs } = await supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          coste_empresa,
          hr_employees!inner (
            company_id
          )
        `)
        .eq("hr_employees.company_id", companyId)
        .gte("period", startDate)
        .lte("period", endDate);

      const totalBruto = costs?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
      const totalCoste = costs?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;

      // Previous year for comparison
      const prevYear = currentYear - 1;
      const prevStartDate = `${prevYear}-01-01`;
      const prevEndDate = `${prevYear}-12-31`;

      const { data: prevCosts } = await supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          hr_employees!inner (
            company_id
          )
        `)
        .eq("hr_employees.company_id", companyId)
        .gte("period", prevStartDate)
        .lte("period", prevEndDate);

      const prevBruto = prevCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
      const salaryIncreasePercent = prevBruto > 0
        ? ((totalBruto - prevBruto) / prevBruto) * 100
        : 0;

      // Get transfers
      const { data: transfers } = await supabase
        .from("hr_transfers")
        .select(`
          *,
          hr_employees!inner (
            id,
            full_name
          ),
          from_company:companies!hr_transfers_from_company_fkey (
            id,
            name
          ),
          to_company:companies!hr_transfers_to_company_fkey (
            id,
            name
          )
        `)
        .or(`from_company.eq.${companyId},to_company.eq.${companyId}`)
        .order("transfer_date", { ascending: false });

      return {
        ...companyData,
        activeEmployees: activeEmployees || 0,
        totalBruto,
        totalCoste,
        salaryIncreasePercent,
        employees: employees || [],
        transfers: transfers || [],
      };
    },
  });

  const handleEmployeeClick = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                company?.name
              )}
            </SheetTitle>
            <SheetDescription>
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `NIF: ${company?.nif || "—"}`
              )}
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Empleados</p>
                      <p className="text-2xl font-bold">{company?.activeEmployees}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">% Subida</p>
                      <p className="text-2xl font-bold text-success">
                        {formatPercentage(company?.salaryIncreasePercent || 0)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Euro className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bruto Anual</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(company?.totalBruto || 0)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50">
                      <Euro className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Coste Anual</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(company?.totalCoste || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="employees" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="employees">
                    <Users className="w-4 h-4 mr-2" />
                    Empleados
                  </TabsTrigger>
                  <TabsTrigger value="transfers">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Traslados
                    {company?.transfers && company.transfers.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {company.transfers.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="space-y-4">
                  <EmployeeTable
                    filters={{ companyId: companyId || undefined }}
                    onEmployeeClick={handleEmployeeClick}
                  />
                </TabsContent>

                <TabsContent value="transfers" className="space-y-4">
                  {company?.transfers && company.transfers.length > 0 ? (
                    <TransfersTimeline
                      transfers={company.transfers}
                      onEmployeeClick={handleEmployeeClick}
                    />
                  ) : (
                    <Card className="p-8 text-center border-dashed">
                      <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay traslados registrados para esta empresa
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Employee Drawer */}
      <EmployeeDrawer
        employeeId={selectedEmployeeId}
        open={!!selectedEmployeeId}
        onOpenChange={(open) => !open && setSelectedEmployeeId(null)}
      />
    </>
  );
};
