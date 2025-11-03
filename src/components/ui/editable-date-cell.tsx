import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableDateCellProps {
  value: string | null;
  onSave: (newValue: string | null) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function EditableDateCell({
  value,
  onSave,
  disabled = false,
  placeholder = "Establecer fecha",
  minDate,
  maxDate,
  className,
}: EditableDateCellProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleSelect = async (date: Date | undefined) => {
    if (!date) return;
    
    if (minDate && date < minDate) {
      toast.error("La fecha no puede ser anterior al mínimo permitido");
      return;
    }
    if (maxDate && date > maxDate) {
      toast.error("La fecha no puede ser posterior al máximo permitido");
      return;
    }

    setIsSaving(true);
    try {
      const isoDate = format(date, "yyyy-MM-dd");
      await onSave(isoDate);
      setSelectedDate(date);
      setOpen(false);
      toast.success("Fecha actualizada");
    } catch (error) {
      toast.error("Error al guardar la fecha");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave(null);
      setSelectedDate(undefined);
      setOpen(false);
      toast.success("Fecha eliminada");
    } catch (error) {
      toast.error("Error al eliminar la fecha");
    } finally {
      setIsSaving(false);
    }
  };

  const displayValue = selectedDate 
    ? format(selectedDate, "dd MMM yyyy", { locale: es })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled || isSaving}
          className={cn(
            "h-auto px-2 py-1 font-normal justify-start text-left",
            !selectedDate && "text-muted-foreground italic",
            className
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 mr-2" />
              {displayValue}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          className="pointer-events-auto"
        />
        <div className="flex gap-2 p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isSaving || !selectedDate}
            className="flex-1"
          >
            Limpiar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
