import { useParams, useNavigate } from "react-router-dom";
import { useCompanyDetail } from "@/hooks/useCompanyDetail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Users, TrendingUp, Euro, ArrowRightLeft } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { TransfersTimeline } from "@/components/transfers/TransfersTimeline";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading, isError } = useCompanyDetail(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Empresa no encontrada</p>
            <Button onClick={() => navigate("/companies")} className="mt-4">
              Volver a empresas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/companies")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Empresas
        </Button>

        {/* Company Header */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-white" />
            </div>

            {/* Company Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <Badge variant="outline" className="bg-success-light text-success border-success/20">
                  Activa
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">NIF:</span>
                <span className="font-medium">{company.nif || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary-light">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empleados Activos</p>
                <p className="text-3xl font-bold">{company.activeEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success-light">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">% Subida Salarial</p>
                <p className="text-3xl font-bold text-success">
                  {formatPercentage(company.salaryIncreasePercent || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-light">
                <Euro className="w-6 h-6 text-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bruto Anual</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(company.totalBruto || 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning-light">
                <Euro className="w-6 h-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coste Anual</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(company.totalCoste || 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">
              <Users className="w-4 h-4 mr-2" />
              Empleados
            </TabsTrigger>
            <TabsTrigger value="transfers">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Traslados
              {company.transfers && company.transfers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {company.transfers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeTable
              filters={{ companyId: id || undefined }}
            />
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4">
            {company.transfers && company.transfers.length > 0 ? (
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
    </div>
  );
}
