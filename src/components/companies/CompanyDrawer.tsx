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
import { useCompanyMetrics } from "@/hooks/useCompanyMetrics";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Users, Euro, TrendingUp, ArrowRightLeft, Building2 } from "lucide-react";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { TransfersTimeline } from "@/components/transfers/TransfersTimeline";

interface CompanyDrawerProps {
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompanyDrawer = ({ companyId, open, onOpenChange }: CompanyDrawerProps) => {
  const { data: company, isLoading } = useCompanyMetrics(companyId);

  return (
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
                    <div className="p-2 rounded-lg bg-primary-light">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Empleados</p>
                      <p className="text-2xl font-bold">{company?.activeEmployees}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success-light">
                      <TrendingUp className="w-5 h-5 text-success" />
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
                    <div className="p-2 rounded-lg bg-purple-light">
                      <Euro className="w-5 h-5 text-purple" />
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
                    <div className="p-2 rounded-lg bg-warning-light">
                      <Euro className="w-5 h-5 text-warning-foreground" />
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
                  />
                </TabsContent>

                <TabsContent value="transfers" className="space-y-4">
                  {company?.transfers && company.transfers.length > 0 ? (
                    <TransfersTimeline
                      transfers={company.transfers}
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
  );
};
