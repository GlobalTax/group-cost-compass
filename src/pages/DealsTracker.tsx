import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import { DealsTable } from "@/components/compensation/DealsTable";
import { CreateDealDialog } from "@/components/compensation/CreateDealDialog";
import { useDeals } from "@/hooks/useDeals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DealsTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  const { data: deals } = useDeals({
    status: statusFilter,
    fiscalYear: yearFilter,
  });

  // Calcular KPIs
  const totalFees = deals?.reduce((sum, deal) => sum + Number(deal.total_fees), 0) || 0;
  const successFeePool =
    deals?.reduce((sum, deal) => sum + Number(deal.success_fee_pool), 0) || 0;
  const closedDeals = deals?.filter((d) => d.status === "closed").length || 0;
  const activeDeals = deals?.filter((d) => d.status === "active").length || 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        title="Operaciones M&A"
        subtitle="Gestiona las operaciones, success fees y distribución de bonus"
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
          <div className="rounded-full bg-primary/10 p-3">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Honorarios Totales</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalFees)}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
          <div className="rounded-full bg-success/10 p-3">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Success Fee Pool</p>
            <p className="text-2xl font-semibold">{formatCurrency(successFeePool)}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
          <div className="rounded-full bg-warning/10 p-3">
            <Briefcase className="h-5 w-5 text-warning" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Deals Cerrados</p>
            <p className="text-2xl font-semibold">{closedDeals}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
          <div className="rounded-full bg-accent/10 p-3">
            <Briefcase className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Deals Activos</p>
            <p className="text-2xl font-semibold">{activeDeals}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pipeline">Pipeline</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={yearFilter.toString()}
          onValueChange={(val) => setYearFilter(Number(val))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Operación
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <DealsTable filters={{ status: statusFilter === "all" ? undefined : statusFilter, fiscalYear: yearFilter }} />

      <CreateDealDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
