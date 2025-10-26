import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditFiltersProps {
  onFilterChange: (filters: {
    userId?: string;
    tableName?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
}

const ENTITY_TYPES = [
  { value: "hr_employees", label: "Empleados" },
  { value: "hr_employee_costs", label: "Costes" },
  { value: "hr_transfers", label: "Traslados" },
  { value: "companies", label: "Empresas" },
];

export const AuditFilters = ({ onFilterChange }: AuditFiltersProps) => {
  const [tableName, setTableName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleApplyFilters = () => {
    onFilterChange({
      tableName: tableName || undefined,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    setTableName("");
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({});
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Entidad</Label>
          <Select value={tableName} onValueChange={setTableName}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las entidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {ENTITY_TYPES.map((entity) => (
                <SelectItem key={entity.value} value={entity.value}>
                  {entity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fecha desde</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Fecha hasta</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1">
          Aplicar filtros
        </Button>
        <Button onClick={handleClearFilters} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>
    </div>
  );
};
