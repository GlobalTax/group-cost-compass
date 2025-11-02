import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings2, RotateCcw } from "lucide-react";

// Normalizar nombre de columna (debe coincidir con uploadCostsParser)
const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

interface ColumnMapperProps {
  headers: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  storageKey?: string;
}

const REQUIRED_FIELDS = [
  { key: "employee_id", label: "Código empleado", optional: true },
  { key: "nif", label: "NIF/DNI", optional: true },
  { key: "name", label: "Nombre", optional: true },
  { key: "company", label: "Empresa", optional: false },
  { key: "date", label: "Periodo (YYYY-MM)", optional: false },
  { key: "bruto", label: "Bruto", optional: false },
  { key: "coste_empresa", label: "Coste Empresa", optional: false },
];

export const ColumnMapper = ({ headers, onMappingChange, storageKey = "upload-column-mapping" }: ColumnMapperProps) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Cargar mapeo guardado o auto-detectar
  useEffect(() => {
    const savedMapping = localStorage.getItem(storageKey);
    if (savedMapping) {
      try {
        const parsed = JSON.parse(savedMapping);
        setMapping(parsed);
        onMappingChange(parsed);
        return;
      } catch {
        // Ignorar errores de parsing
      }
    }

    // Auto-detección inicial
    const autoMapping: Record<string, string> = {};
    REQUIRED_FIELDS.forEach(field => {
      const match = headers.find(h => h.toLowerCase() === field.key.toLowerCase());
      if (match) {
        autoMapping[field.key] = match;
      }
    });
    setMapping(autoMapping);
    onMappingChange(autoMapping);
  }, [headers, storageKey]);

  const handleMappingChange = (fieldKey: string, headerValue: string) => {
    const newMapping = { ...mapping, [fieldKey]: headerValue === "none" ? "" : headerValue };
    setMapping(newMapping);
    onMappingChange(newMapping);
    localStorage.setItem(storageKey, JSON.stringify(newMapping));
  };

  const handleReset = () => {
    setMapping({});
    onMappingChange({});
    localStorage.removeItem(storageKey);
  };

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="h-8"
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Configurar mapeo de columnas
        </Button>
        {Object.keys(mapping).length > 0 && (
          <span className="text-muted-foreground">
            ({Object.keys(mapping).filter(k => mapping[k]).length} campos mapeados)
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-4 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-sm">Mapeo de Columnas</h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Resetear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-7 text-xs"
          >
            Ocultar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {REQUIRED_FIELDS.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-xs font-medium">
              {field.label}
              {!field.optional && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={mapping[field.key] || "none"}
              onValueChange={(value) => handleMappingChange(field.key, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Seleccionar columna..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground italic">No mapear</span>
                </SelectItem>
                {headers.map(header => (
                  <SelectItem key={header} value={header}>
                    <div className="flex items-center gap-2">
                      <span>{header}</span>
                      <span className="text-xs text-muted-foreground">
                        → {normalizeColumnName(header)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Tip: Debes mapear al menos uno de: Código empleado, NIF o Nombre
      </p>
    </Card>
  );
};
