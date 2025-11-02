import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "./FileDropzone";
import { PasteArea } from "./PasteArea";
import { ImportProgress } from "./ImportProgress";
import { Sparkles, AlertTriangle, Loader2, RefreshCw, CheckCircle2, Settings, Upload, Clipboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { AIParseResponse } from "@/lib/types/aiParse";
import { importFromAIResult } from "@/services/import/intelligentImportService";

// Campos disponibles por tipo de datos
const FIELD_OPTIONS = {
  employees: [
    { value: "employee_code", label: "Código Empleado" },
    { value: "name", label: "Nombre" },
    { value: "nif", label: "NIF/NIE" },
    { value: "company", label: "Empresa" },
    { value: "hire_date", label: "Fecha Alta" },
    { value: "termination_date", label: "Fecha Baja" },
    { value: "seniority_date", label: "Fecha Antigüedad" },
    { value: "department", label: "Departamento" },
    { value: "position", label: "Puesto" },
    { value: "ignored", label: "❌ Ignorar" },
  ],
  costs: [
    { value: "ignore", label: "🚫 Ignorar" },
    { value: "employee_code", label: "Código Empleado" },
    { value: "employee_nif", label: "NIF" },
    { value: "employee_name", label: "Nombre Empleado" },
    { value: "company", label: "Empresa" },
    { value: "period", label: "Período (YYYY-MM)" },
    { value: "bruto", label: "Bruto" },
    { value: "coste_empresa", label: "Coste Empresa" },
  ],
  payroll: [
    { value: "employee_code", label: "Código Empleado" },
    { value: "employee_name", label: "Nombre" },
    { value: "employee_nif", label: "NIF Empleado" },
    { value: "company_nif", label: "NIF Empresa" },
    { value: "bruto", label: "Bruto" },
    { value: "coste_empresa", label: "Coste Empresa" },
    { value: "sal_neto", label: "Salario Neto" },
    { value: "ss_empresa", label: "SS Empresa" },
    { value: "ss_trabajador", label: "SS Trabajador" },
    { value: "irpf_dinero", label: "IRPF" },
    { value: "ignored", label: "❌ Ignorar" },
  ],
};

export const IntelligentUpload = () => {
  const [uploadMode, setUploadMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIParseResponse | null>(null);
  const [userAdjustments, setUserAdjustments] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [period, setPeriod] = useState<string>("");
  const [fullDataset, setFullDataset] = useState<Array<Record<string, any>>>([]);

  const { data: companies } = useCompanies();

  const parseFile = async (file: File): Promise<Array<Record<string, any>>> => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv" || ext === "txt") {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data as Array<Record<string, any>>),
          error: (error) => reject(error),
        });
      });
    } else if (ext === "xls" || ext === "xlsx") {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(firstSheet);
    } else {
      throw new Error("Formato de archivo no soportado");
    }
  };

  const handleAnalyzeData = async (rows: Array<Record<string, any>>, sourceName: string) => {
    setAiResult(null);
    setUserAdjustments({});
    setFullDataset(rows); // ✅ Guardar dataset completo
    setAnalyzing(true);

    try {
      if (rows.length === 0) {
        toast.error("No hay datos para analizar");
        setAnalyzing(false);
        return;
      }

      // ✅ Enviar solo muestra de 25 filas a la IA para análisis
      const sampleRows = rows.slice(0, 25);

      const { data, error } = await supabase.functions.invoke("ai-parse-upload", {
        body: {
          rows: sampleRows,
          fileName: sourceName,
          companyCatalog: companies || [],
        },
      });

      if (error) throw error;

      const result: AIParseResponse = data;
      setAiResult(result);

      // Auto-completar período si la IA lo detectó
      if (result.suggested_period && !period) {
        setPeriod(result.suggested_period);
      }

      toast.success(`Análisis completado: ${result.detected_type} (${(result.confidence * 100).toFixed(0)}% confianza)`);
    } catch (error: any) {
      toast.error(`Error al analizar: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const rows = await parseFile(selectedFile);
    await handleAnalyzeData(rows, selectedFile.name);
  };

  const handlePastedData = async (rows: Array<Record<string, any>>) => {
    setFile(null);
    await handleAnalyzeData(rows, "Datos Pegados");
  };

  const handleAdjustMapping = (originalColumn: string, newField: string) => {
    setUserAdjustments((prev) => ({ ...prev, [originalColumn]: newField }));
  };

  const handleReanalyze = () => {
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!aiResult || (aiResult.detected_type !== "employees" && !period)) {
      toast.error("Completa todos los campos antes de importar");
      return;
    }

    if (fullDataset.length === 0) {
      toast.error("No hay datos para importar");
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: fullDataset.length });

    try {
      const result = await importFromAIResult(aiResult, userAdjustments, period, fullDataset, (current, total) => {
        setImportProgress({ current, total });
      });

      toast.success(`✅ Importación completada: ${result.employeesCreated + result.costsImported} registros`);

      // Reset
      setFile(null);
      setAiResult(null);
      setUserAdjustments({});
      setPeriod("");
      setFullDataset([]);
    } catch (error: any) {
      toast.error(`Error en importación: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const finalMapping = aiResult ? { ...aiResult.column_mapping, ...userAdjustments } : {};
  const currentFieldOptions = aiResult ? FIELD_OPTIONS[aiResult.detected_type] || FIELD_OPTIONS.payroll : [];

  return (
    <div className="space-y-6">
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertDescription>
          <strong>Importación Inteligente con IA:</strong> Sube un archivo Excel/CSV o copia 
          y pega datos directamente desde tu hoja de cálculo. La IA detectará automáticamente 
          la estructura, tipo de datos, y mapeará columnas.
        </AlertDescription>
      </Alert>

      {!companies && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esperando catálogo de empresas. Por favor, recarga la página.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Método de Importación</CardTitle>
          <CardDescription>
            Elige cómo quieres importar los datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle entre modos */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <Button
              variant={uploadMode === "file" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUploadMode("file")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivo
            </Button>
            <Button
              variant={uploadMode === "paste" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUploadMode("paste")}
            >
              <Clipboard className="h-4 w-4 mr-2" />
              Copiar y Pegar
            </Button>
          </div>

          {/* Zona de entrada según modo */}
          {uploadMode === "file" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Formatos soportados: Excel (.xls, .xlsx), CSV (.csv), o archivos de texto con tabs (.txt)
              </p>
              <FileDropzone onFileSelect={handleFileSelect} accept=".xls,.xlsx,.csv,.txt" />
            </div>
          ) : (
            <PasteArea onParsedData={handlePastedData} disabled={analyzing} />
          )}
        </CardContent>
      </Card>

      {analyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <p className="text-sm text-muted-foreground">
                Analizando estructura con IA... Esto puede tardar 10-15 segundos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {aiResult && (
        <>
          {/* Resultados del análisis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Análisis Completado
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <Badge variant={aiResult.confidence > 0.8 ? "default" : "secondary"}>
                      {aiResult.detected_type.toUpperCase()}
                    </Badge>
                    <span className="text-xs">
                      {(aiResult.confidence * 100).toFixed(0)}% confianza
                    </span>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleReanalyze}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warnings */}
              {aiResult.warnings.length > 0 && (
                <Alert variant="default" className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle>Advertencias Detectadas</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc ml-4 text-sm space-y-1 mt-2">
                      {aiResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Advertencia si falta NIF */}
              {aiResult.detected_type !== "employees" && 
               !Object.values(finalMapping).includes("employee_nif") && 
               !Object.values(finalMapping).includes("nif") && (
                <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Matching por Nombre Detectado</AlertTitle>
                  <AlertDescription>
                    <p className="text-sm">
                      No se detectó columna de <strong>NIF/NIE</strong>. El sistema buscará empleados 
                      por <strong>nombre completo exacto</strong>.
                    </p>
                    <p className="text-sm mt-2">
                      ⚠️ Asegúrate de que los nombres coincidan <strong>exactamente</strong> con los 
                      registrados en la base de datos (mayúsculas, acentos, espacios).
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Mapeo de columnas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold">Mapeo de Columnas</h4>
                </div>
                <ScrollArea className="h-[300px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Columna Original</TableHead>
                        <TableHead className="w-[200px]">Campo Sistema</TableHead>
                        <TableHead>Valores Muestra</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(finalMapping).map(([original, mapped]) => (
                        <TableRow key={original}>
                          <TableCell className="font-mono text-xs">{original}</TableCell>
                          <TableCell>
                            <Select
                              value={mapped}
                              onValueChange={(value) => handleAdjustMapping(original, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currentFieldOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {aiResult.preview[0]?.[original] || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Empresas detectadas */}
              {aiResult.companies_detected.length > 0 && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm">🏢 Empresas Detectadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiResult.companies_detected.map((company, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{company.normalized}</p>
                          <p className="text-xs text-muted-foreground">
                            Original: "{company.original}" | NIF: {company.nif}
                          </p>
                        </div>
                        <Badge variant={company.confidence === 1 ? "default" : "secondary"}>
                          {(company.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Preview de datos */}
              <Accordion type="single" collapsible>
                <AccordionItem value="preview">
                  <AccordionTrigger>
                    Ver preview de {aiResult.preview.length} filas mapeadas
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="h-[300px]">
                      <pre className="text-xs bg-muted p-4 rounded-md">
                        {JSON.stringify(aiResult.preview.slice(0, 10), null, 2)}
                      </pre>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Período (solo para costes/nóminas) */}
          {aiResult.detected_type !== "employees" && (
            <Card>
              <CardHeader>
                <CardTitle>Período de Nómina</CardTitle>
                <CardDescription>
                  {aiResult.suggested_period
                    ? `La IA sugiere: ${aiResult.suggested_period}`
                    : "Selecciona el período al que corresponden estos datos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="period">Período (YYYY-MM)</Label>
                  <Input
                    id="period"
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    max={new Date().toISOString().slice(0, 7)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botón de importación */}
          {importing ? (
            <Card>
              <CardContent className="pt-6">
                <ImportProgress
                  current={importProgress.current}
                  total={importProgress.total}
                  status="uploading"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={aiResult.errors.length > 0 || (aiResult.detected_type !== "employees" && !period)}
                  onClick={handleImport}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Importar {fullDataset.length} Registros
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
