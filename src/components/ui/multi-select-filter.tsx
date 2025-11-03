import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

interface MultiSelectFilterProps {
  label: string;
  options: Array<{
    id: string;
    name: string;
  }>;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  icon?: React.ReactNode;
}

export function MultiSelectFilter({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = "Seleccionar...",
  emptyMessage = "No hay opciones",
  icon
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  
  const handleToggle = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(sid => sid !== id)
      : [...selectedIds, id];
    onChange(newSelected);
  };
  
  const handleSelectAll = () => {
    onChange(options.map(opt => opt.id));
  };
  
  const handleClearAll = () => {
    onChange([]);
  };
  
  const buttonText = selectedIds.length === 0
    ? placeholder
    : selectedIds.length === options.length
    ? `Todos los ${label.toLowerCase()}`
    : `${selectedIds.length} ${label.toLowerCase()} seleccionados`;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-between">
          <span className="flex items-center gap-2">
            {icon}
            {buttonText}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex items-center justify-between border-b p-2">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-7 text-xs"
            >
              Todos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 text-xs"
            >
              Limpiar
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-72">
          <div className="p-2 space-y-1">
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">
                {emptyMessage}
              </p>
            ) : (
              options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent cursor-pointer"
                  onClick={() => handleToggle(option.id)}
                >
                  <Checkbox
                    checked={selectedIds.includes(option.id)}
                    onCheckedChange={() => handleToggle(option.id)}
                  />
                  <label className="text-sm cursor-pointer flex-1">
                    {option.name}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {selectedIds.length > 0 && (
          <div className="border-t p-2 text-xs text-muted-foreground">
            {selectedIds.length} seleccionado(s)
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
