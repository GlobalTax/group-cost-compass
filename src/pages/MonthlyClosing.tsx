import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MonthNavigator } from "@/components/monthly/MonthNavigator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const MonthlyClosing = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    format(currentDate, "yyyy-MM")
  );

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Cierre Mensual"
        subtitle="Análisis consolidado del mes seleccionado"
        showCompany={false}
      />

      <MonthNavigator
        currentMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      {/* Placeholder para KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Placeholder para Alertas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Alertas del Mes
        </h3>
        <Skeleton className="h-40" />
      </div>

      {/* Placeholder para Tabs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Detalle del Mes
        </h3>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
};

export default MonthlyClosing;
