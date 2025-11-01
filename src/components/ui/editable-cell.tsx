import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: number | null;
  onSave: (newValue: number) => Promise<void>;
  format?: "currency" | "number";
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const EditableCell = ({
  value,
  onSave,
  format = "currency",
  min = 0,
  max = 1000000,
  disabled = false,
  placeholder,
  className,
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatDisplay = (num: number | null): string => {
    if (num === null) {
      return placeholder || "—";
    }
    
    if (format === "currency") {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(num);
    }
    
    return new Intl.NumberFormat("es-ES").format(num);
  };

  const handleDoubleClick = () => {
    if (disabled || isSaving) return;
    setIsEditing(true);
    setEditValue(value?.toString() || "0");
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
    setError(null);
  };

  const handleSave = async () => {
    const numValue = parseFloat(editValue.replace(/,/g, "."));

    // Validaciones
    if (isNaN(numValue)) {
      setError("Valor inválido");
      return;
    }

    if (numValue < min) {
      setError(`Mínimo: ${min}`);
      return;
    }

    if (numValue > max) {
      setError(`Máximo: ${formatDisplay(max)}`);
      return;
    }

    // Evitar guardar si no hay cambios
    if (numValue === value) {
      handleCancel();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(numValue);
      setIsEditing(false);
      setEditValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Pequeño delay para permitir clicks en botones
    setTimeout(() => {
      if (isEditing && !isSaving) {
        handleSave();
      }
    }, 150);
  };

  if (isEditing || isSaving) {
    return (
      <div className="relative inline-flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          className={cn(
            "w-28 px-2 py-1 text-sm text-right border rounded",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            error ? "border-destructive" : "border-input",
            isSaving && "opacity-50 cursor-not-allowed",
            className
          )}
        />
        {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {error && (
          <span className="absolute -bottom-5 right-0 text-xs text-destructive whitespace-nowrap">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDoubleClick}
      disabled={disabled}
      className={cn(
        "text-right w-full px-2 py-1 rounded transition-colors",
        !disabled && "hover:bg-accent/50 cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      title={disabled ? "No tienes permisos para editar" : "Doble clic para editar"}
    >
      {formatDisplay(value)}
    </button>
  );
};
