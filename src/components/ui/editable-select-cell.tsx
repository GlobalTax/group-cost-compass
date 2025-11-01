import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface SelectOption {
  id: string;
  label: string;
  color?: string;
}

interface EditableSelectCellProps {
  value: string | null;
  displayValue: string | null;
  options: SelectOption[];
  onSave: (newValue: string | null) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  renderDisplay?: (option: { label: string; color?: string }) => React.ReactNode;
  className?: string;
}

export function EditableSelectCell({
  value,
  displayValue,
  options,
  onSave,
  disabled = false,
  placeholder = "Sin asignar",
  renderDisplay,
  className = "",
}: EditableSelectCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(value);
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleClick = () => {
    if (!disabled && !isSaving) {
      setIsEditing(true);
    }
  };

  const handleSave = async (newValue: string) => {
    const finalValue = newValue === "null" ? null : newValue;
    
    if (finalValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(finalValue);
      setSelectedValue(finalValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      setSelectedValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedValue(value);
    setIsEditing(false);
  };

  const currentOption = options.find(opt => opt.id === value);

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 py-1">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Guardando...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedValue || "null"}
          onValueChange={handleSave}
          open={isEditing}
          onOpenChange={(open) => {
            if (!open) handleCancel();
          }}
        >
          <SelectTrigger ref={selectRef} className="w-[200px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">{placeholder}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className={`h-auto p-1 hover:bg-accent ${className}`}
      title={disabled ? "No tienes permisos para editar" : "Clic para editar"}
    >
      {displayValue && currentOption ? (
        renderDisplay ? (
          renderDisplay({ label: currentOption.label, color: currentOption.color })
        ) : (
          <span>{displayValue}</span>
        )
      ) : (
        <span className="text-muted-foreground text-sm">{placeholder}</span>
      )}
    </Button>
  );
}
