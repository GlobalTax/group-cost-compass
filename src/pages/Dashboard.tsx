import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { DashboardCompanyChart } from "@/components/dashboard/DashboardCompanyChart";
import { DashboardHeatmap } from "@/components/dashboard/DashboardHeatmap";
import { DashboardCompaniesTable } from "@/components/dashboard/DashboardCompaniesTable";
import { useDashboardGlobal } from "@/hooks/useDashboardGlobal";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ChartErrorFallback } from "@/components/error/ErrorFallbacks";
import { TableErrorBoundary } from "@/components/error/TableErrorBoundary";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [companyId, setCompanyId] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setMonth("all"); // Reset month when year changes
  };

  const { data, isLoading, error } = useDashboardGlobal({
    year,
    companyId: companyId === "all" ? undefined : companyId,
    month: month === "all" ? undefined : month,
  });

  const handleCompanyClick = (id: string) => {
    navigate(`/companies/${id}`);
  };

  if (error) {
    return (
      <div className="p-8">
        <PageHeader
          title="Dashboard Global"
          subtitle="Control centralizado de costes, plantilla y subidas salariales del grupo"
        />
        <div className="mt-8 p-6 border border-destructive/50 rounded-lg bg-destructive/5">
          <p className="text-sm text-destructive">
            Error al cargar los datos. Por favor, verifica tus permisos o contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          title="Dashboard Global"
          subtitle="Control centralizado de costes, plantilla y subidas salariales del grupo"
        />
        <DashboardFilters
          year={year}
          companyId={companyId}
          month={month}
          onYearChange={handleYearChange}
          onCompanyChange={setCompanyId}
          onMonthChange={setMonth}
        />
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <ErrorBoundary context="DashboardKPIs">
          <DashboardKPIs
            costeTotal={data?.kpis.costeTotal || 0}
            activeEmployees={data?.kpis.activeEmployees || 0}
            avgCostPerEmployee={data?.kpis.avgCostPerEmployee || 0}
            salaryIncreasePercent={data?.kpis.salaryIncreasePercent || 0}
          />
        </ErrorBoundary>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[500px]" />
            <Skeleton className="h-[500px]" />
          </>
        ) : (
          <>
            <ErrorBoundary fallback={<ChartErrorFallback />} context="CompanyChart">
              <DashboardCompanyChart
                data={data?.companiesData || []}
                onCompanyClick={handleCompanyClick}
              />
            </ErrorBoundary>
            {month === "all" && (
              <ErrorBoundary fallback={<ChartErrorFallback />} context="Heatmap">
                <DashboardHeatmap data={data?.heatmapData || []} />
              </ErrorBoundary>
            )}
          </>
        )}
      </div>

      {/* Companies Table */}
      {isLoading ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <TableErrorBoundary columns={5}>
          <DashboardCompaniesTable data={data?.companiesData || []} />
        </TableErrorBoundary>
      )}
    </div>
  );
};

export default Dashboard;
