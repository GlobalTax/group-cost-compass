import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface BudgetPeriodHeaderProps {
  period: any;
}

export function BudgetPeriodHeader({ period }: BudgetPeriodHeaderProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      approved: "default",
      closed: "outline",
    };

    const labels: Record<string, string> = {
      draft: "Borrador",
      approved: "Aprobado",
      closed: "Cerrado",
    };

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {new Date(period.period).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
            </h2>
            {getStatusBadge(period.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {period.companies?.name || "Presupuesto consolidado"}
          </p>
          {period.notes && (
            <p className="text-sm mt-2 text-muted-foreground">{period.notes}</p>
          )}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Creado: {new Date(period.created_at).toLocaleDateString('es-ES')}</p>
          {period.approved_at && (
            <p>Aprobado: {new Date(period.approved_at).toLocaleDateString('es-ES')}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
