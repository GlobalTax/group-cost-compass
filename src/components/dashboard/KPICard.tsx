import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percentage";
  className?: string;
}

// Move format function outside component
const formatValue = (val: number, type: string) => {
  switch (type) {
    case "currency":
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    case "percentage":
      return `${val.toFixed(1)}%`;
    default:
      return val.toString();
  }
};

export const KPICard = memo(({
  title,
  value,
  format = "number",
  className,
}: KPICardProps) => {
  // Memoize formatted value
  const formattedValue = useMemo(() => {
    return formatValue(value, format);
  }, [value, format]);

  return (
    <Card className={cn("p-6 border-gray-200", className)}>
      <div className="space-y-2">
        <p className="text-sm text-foreground">{title}</p>
        <p className="text-4xl font-bold tracking-tight">
          {formattedValue}
        </p>
      </div>
    </Card>
  );
});

KPICard.displayName = "KPICard";
