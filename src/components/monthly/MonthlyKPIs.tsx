import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  TrendingUp,
  PieChart,
  Users,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyKPIsData {
  costeTotal: number;
  ingresoTotal: number;
  margen: number;
  plantilla: number;
  incorporaciones: number;
  costeDelta: number;
  costeDeltaPercent: number;
  ingresoDelta: number;
  ingresoDeltaPercent: number;
  margenDelta: number;
  margenDeltaPercent: number;
  plantillaDelta: number;
  plantillaDeltaPercent: number;
  incorporacionesDelta: number;
  incorporacionesDeltaPercent: number;
}

interface MonthlyKPIsProps {
  data: MonthlyKPIsData | undefined;
  isLoading: boolean;
}

interface KPIConfig {
  title: string;
  value: number;
  delta: number;
  deltaPercent: number;
  format: "currency" | "number";
  icon: React.ElementType;
  invertColor?: boolean;
}

const KPICardWithDelta = ({
  title,
  value,
  delta,
  deltaPercent,
  format,
  icon: Icon,
  invertColor = false,
}: KPIConfig) => {
  // Formatear valor
  const formattedValue =
    format === "currency"
      ? new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      : value.toString();

  // Determinar dirección del delta
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = delta === 0;

  // Lógica de color (invertir para costes)
  let deltaColor = "text-muted-foreground";
  if (!isNeutral) {
    if (invertColor) {
      deltaColor = isPositive ? "text-red-600" : "text-green-600";
    } else {
      deltaColor = isPositive ? "text-green-600" : "text-red-600";
    }
  }

  // Icono de flecha
  const DeltaIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <Card className="p-6 border-border">
      <div className="space-y-3">
        {/* Header con icono */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Valor principal */}
        <p className="text-3xl font-bold tracking-tight">{formattedValue}</p>

        {/* Delta vs mes anterior */}
        <div className={cn("flex items-center gap-1 text-sm", deltaColor)}>
          <DeltaIcon className="h-4 w-4" />
          <span className="font-medium">
            {deltaPercent > 0 ? "+" : ""}
            {deltaPercent.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs mes ant.</span>
        </div>
      </div>
    </Card>
  );
};

export const MonthlyKPIs = ({ data, isLoading }: MonthlyKPIsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No hay datos disponibles para este mes
      </div>
    );
  }

  const kpis: KPIConfig[] = [
    {
      title: "Coste Total",
      value: data.costeTotal,
      delta: data.costeDelta,
      deltaPercent: data.costeDeltaPercent,
      format: "currency",
      icon: Wallet,
      invertColor: true, // Costes ↑ = malo
    },
    {
      title: "Ingresos",
      value: data.ingresoTotal,
      delta: data.ingresoDelta,
      deltaPercent: data.ingresoDeltaPercent,
      format: "currency",
      icon: TrendingUp,
    },
    {
      title: "Margen",
      value: data.margen,
      delta: data.margenDelta,
      deltaPercent: data.margenDeltaPercent,
      format: "currency",
      icon: PieChart,
    },
    {
      title: "Plantilla",
      value: data.plantilla,
      delta: data.plantillaDelta,
      deltaPercent: data.plantillaDeltaPercent,
      format: "number",
      icon: Users,
    },
    {
      title: "Incorporaciones",
      value: data.incorporaciones,
      delta: data.incorporacionesDelta,
      deltaPercent: data.incorporacionesDeltaPercent,
      format: "number",
      icon: UserPlus,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {kpis.map((kpi) => (
        <KPICardWithDelta key={kpi.title} {...kpi} />
      ))}
    </div>
  );
};
