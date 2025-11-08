import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { CompanyOrgChart } from "@/components/companies/CompanyOrgChart";
import { useCompanies } from "@/hooks/useCompanies";
import { Building2 } from "lucide-react";

const Companies = () => {
  const { data: companies = [], isLoading } = useCompanies();

  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Empresas del Grupo"
        subtitle="Estructura corporativa y métricas consolidadas"
      />

      {/* Consolidated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empresas del Grupo</p>
                  <p className="text-3xl font-bold">{companies.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <Building2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empresas Activas</p>
                  <p className="text-3xl font-bold">{companies.filter(c => c.is_active).length}</p>
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
        <CompanyOrgChart companies={companies} />
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
          companies.map((company, index) => (
            <CompanyCard
              key={company.id}
              {...company}
              color={colors[index % colors.length]}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Companies;
