import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { CompanyOrgChart } from "@/components/companies/CompanyOrgChart";
import { CompanyDrawer } from "@/components/companies/CompanyDrawer";
import { useCompanyMetrics } from "@/hooks/useCompanyMetrics";
import { formatCurrency } from "@/lib/formatters";
import { Building2, Users, Euro, TrendingUp } from "lucide-react";

const Companies = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();
  const { data: companies, isLoading } = useCompanyMetrics(currentYear);

  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const totalEmployees = companies?.reduce((sum, c) => sum + c.activeEmployees, 0) || 0;
  const totalBruto = companies?.reduce((sum, c) => sum + c.totalBruto, 0) || 0;
  const totalCoste = companies?.reduce((sum, c) => sum + c.totalCoste, 0) || 0;

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Empresas del Grupo"
        subtitle="Estructura corporativa y métricas consolidadas"
      />

      {/* Consolidated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empresas Activas</p>
                  <p className="text-3xl font-bold">{companies?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empleados Totales</p>
                  <p className="text-3xl font-bold">{totalEmployees}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bruto Consolidado</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBruto)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-50">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coste Consolidado</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCoste)}</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Org Chart */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <CompanyOrgChart
          companies={companies || []}
          onCompanyClick={handleCompanyClick}
        />
      )}

      {/* Company Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </>
        ) : (
          companies?.map((company, index) => (
            <CompanyCard
              key={company.id}
              {...company}
              color={colors[index % colors.length]}
              onClick={() => handleCompanyClick(company.id)}
            />
          ))
        )}
      </div>

      {/* Company Drawer */}
      <CompanyDrawer
        companyId={selectedCompanyId}
        open={!!selectedCompanyId}
        onOpenChange={(open) => !open && setSelectedCompanyId(null)}
      />
    </div>
  );
};

export default Companies;
