import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MonthNavigatorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthNavigator = ({
  currentMonth,
  onMonthChange,
}: MonthNavigatorProps) => {
  const currentDate = startOfMonth(new Date(currentMonth + "-01"));
  const today = startOfMonth(new Date());

  const handlePreviousMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    onMonthChange(format(prevMonth, "yyyy-MM"));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    onMonthChange(format(nextMonth, "yyyy-MM"));
  };

  const handleCurrentMonth = () => {
    onMonthChange(format(today, "yyyy-MM"));
  };

  const isCurrentMonth = format(currentDate, "yyyy-MM") === format(today, "yyyy-MM");

  // Generar lista de meses (últimos 24 meses)
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const date = subMonths(today, i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: es }),
    };
  });

  return (
    <div className="flex items-center justify-between gap-4 p-6 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Periodo:
        </span>
        <span className="text-xl font-bold text-foreground capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </span>
        {isCurrentMonth && (
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md">
            Actual
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Navegación por flechas */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant={isCurrentMonth ? "default" : "outline"}
          onClick={handleCurrentMonth}
          className={cn("min-w-[100px]", isCurrentMonth && "pointer-events-none")}
        >
          Mes Actual
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Selector rápido */}
        <Select value={currentMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="capitalize">{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
