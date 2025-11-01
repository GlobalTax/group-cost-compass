import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Sparkles, Trash2, Table as TableIcon } from "lucide-react";
import Papa from "papaparse";

interface PasteAreaProps {
  onParsedData: (rows: Array<Record<string, any>>) => void;
  disabled?: boolean;
}

export const PasteArea = ({ onParsedData, disabled }: PasteAreaProps) => {
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState<Array<Record<string, any>> | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string>("");

  const handleParse = () => {
    if (!rawText.trim()) {
      return;
    }

    // Detectar separador
    const hasTab = rawText.includes("\t");
    const hasSemicolon = rawText.includes(";");
    const hasComma = rawText.includes(",");

    let delimiter = "\t"; // Por defecto, TSV (desde Excel)
    let formatName = "TSV (tabs)";

    if (!hasTab && hasSemicolon) {
      delimiter = ";";
      formatName = "CSV (punto y coma)";
    } else if (!hasTab && !hasSemicolon && hasComma) {
      delimiter = ",";
      formatName = "CSV (comas)";
    }

    Papa.parse(rawText, {
      delimiter,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data as Array<Record<string, any>>;
        
        if (data.length === 0) {
          setPreview(null);
          return;
        }

        // Validar que tenga al menos 2 columnas
        const firstRow = data[0];
        const columnCount = Object.keys(firstRow).length;

        if (columnCount < 2) {
          setPreview(null);
          return;
        }

        setDetectedFormat(formatName);
        setPreview(data.slice(0, 5)); // Mostrar primeras 5 filas
      },
    });
  };

  const handleAnalyze = () => {
    if (!rawText.trim()) return;

    Papa.parse(rawText, {
      delimiter: detectedFormat.includes("tabs") ? "\t" : detectedFormat.includes("coma") ? "," : ";",
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data as Array<Record<string, any>>;
        onParsedData(data);
      },
    });
  };

  const handleClear = () => {
    setRawText("");
    setPreview(null);
    setDetectedFormat("");
  };

  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Clipboard className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>Cómo usar:</strong> Selecciona las celdas en Excel/Google Sheets (incluye la fila de encabezados), 
          copia con Ctrl+C, y pega aquí con Ctrl+V. La IA analizará automáticamente la estructura.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Pega tus datos aquí
          </label>
          {rawText && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        
        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onBlur={handleParse}
          placeholder="Pega los datos copiados desde Excel, Google Sheets, o cualquier tabla...

Ejemplo:
Nombre	Empresa	Fecha Alta	NIF
Juan Pérez	Navarro Legal	01/01/2020	12345678A
María López	Beglobal	15/03/2021	87654321B"
          className="min-h-[200px] font-mono text-xs"
          disabled={disabled}
        />
      </div>

      {preview && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              Vista previa detectada
            </span>
            <Badge variant="outline" className="text-xs">
              {detectedFormat}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {preview.length} filas (mostrando primeras 5)
            </Badge>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  {Object.keys(preview[0]).map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-3 py-2 text-muted-foreground">
                        {String(value || "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleAnalyze}
        disabled={!rawText.trim() || disabled}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Analizar con IA
      </Button>
    </div>
  );
};
