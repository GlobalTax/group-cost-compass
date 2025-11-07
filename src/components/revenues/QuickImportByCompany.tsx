import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  ChevronRight, 
  ArrowLeft, 
  Upload, 
  Clipboard, 
  Info, 
  Zap,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { PasteArea } from "@/components/upload/PasteArea";
import { parseRevenueFromRows, groupItemsByClient, type ParsedRevenueItem } from "@/lib/parsers/revenueParser";
import { bulkImportRevenueItems } from "@/services/import/revenueImportService";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";
import * as XLSX from "xlsx";

type QuickStep = 'select-company' | 'paste-data' | 'preview' | 'importing' | 'complete';

interface QuickImportByCompanyProps {
  onImportComplete?: () => void;
}

export const QuickImportByCompany = ({ onImportComplete }: QuickImportByCompanyProps) => {
  const queryClient = useQueryClient();
  const { data: companies } = useCompanies();

  const [step, setStep] = useState<QuickStep>('select-company');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('paste');
  const [parsedItems, setParsedItems] = useState<ParsedRevenueItem[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; error: string; data?: any }>>([]);
  const [summary, setSummary] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);

  const selectedCompany = companies?.find(c => c.id === selectedCompanyId);

  const handleFileUpload = async (file: File) => {
    try {
      const toastId = toast.loading('Procesando archivo...');
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);

      const result = await parseRevenueFromRows(rows);
      
      setParsedItems(result.items);
      setParseErrors(result.errors);
      setSummary(result.summary);
      
      setStep('preview');
      toast.dismiss(toastId);
      toast.success(`${result.items.length} líneas procesadas para ${selectedCompany?.name}`);
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo', {
        description: error.message
      });
    }
  };

  const handlePastedData = async (rows: Array<Record<string, any>>) => {
    try {
      const toastId = toast.loading('Procesando datos...');
      
      const result = await parseRevenueFromRows(rows);
      
      setParsedItems(result.items);
      setParseErrors(result.errors);
      setSummary(result.summary);
      
      setStep('preview');
      toast.dismiss(toastId);
      toast.success(`${result.items.length} líneas procesadas para ${selectedCompany?.name}`);
    } catch (error: any) {
      console.error('Error processing data:', error);
      toast.error('Error al procesar los datos', {
        description: error.message
      });
    }
  };

  const handleQuickImport = async () => {
    if (!selectedCompanyId || parsedItems.length === 0) return;

    setImporting(true);
    setStep('importing');
    setProgress(0);

    try {
      // Crear mapping automático: todos los clientes → empresa seleccionada
      const autoMapping: Record<string, string> = {};
      const grouped = groupItemsByClient(parsedItems);
      
      grouped.forEach((group) => {
        autoMapping[group.client_name] = selectedCompanyId;
      });

      const result = await bulkImportRevenueItems(
        parsedItems,
        autoMapping,
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
        }
      );

      setImportResult(result);
      setStep('complete');

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });

      toast.success('Importación completada', {
        description: `${result.success.length} ingresos creados para ${selectedCompany?.name}`,
      });
    } catch (error: any) {
      console.error('Error importing:', error);
      toast.error('Error en la importación', {
        description: error.message,
      });
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setStep('select-company');
    setSelectedCompanyId('');
    setParsedItems([]);
    setParseErrors([]);
    setSummary(null);
    setImportResult(null);
    setProgress(0);
  };

  const handleFinish = () => {
    handleReset();
    onImportComplete?.();
  };

  const groupedItems = parsedItems.length > 0 ? groupItemsByClient(parsedItems) : [];

  // Calcular rango de fechas (memorizado para evitar re-renders infinitos)
  const dateRange = useMemo(() => {
    if (parsedItems.length === 0) return { min: null, max: null };
    
    return parsedItems.reduce((acc, item) => {
      const date = new Date(item.period);
      return {
        min: !acc.min || date < acc.min ? date : acc.min,
        max: !acc.max || date > acc.max ? date : acc.max,
      };
    }, { min: null as Date | null, max: null as Date | null });
  }, [parsedItems]);

  return (
    <div className="space-y-6">
      {/* Paso 1: Selección de Empresa */}
      {step === 'select-company' && (
        <Card>
          <CardHeader>
            <CardTitle>Importación Rápida por Empresa</CardTitle>
            <CardDescription>
              Selecciona primero la empresa y luego pega todos sus datos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Flujo express:</strong> Todos los datos se asignarán automáticamente 
                a la empresa seleccionada. Ideal cuando copias datos de una sola empresa.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="company-select">Empresa del Grupo Navarro</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger id="company-select" className="w-full">
                  <SelectValue placeholder="🔍 Buscar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{company.name}</span>
                        {company.nif && (
                          <span className="text-xs text-muted-foreground">({company.nif})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep('paste-data')} 
                disabled={!selectedCompanyId}
              >
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Pegar Datos */}
      {step === 'paste-data' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Importar Datos</CardTitle>
                <CardDescription>
                  Empresa seleccionada: <strong>{selectedCompany?.name}</strong>
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('select-company')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar empresa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'paste')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Archivo
                </TabsTrigger>
                <TabsTrigger value="paste">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copiar y Pegar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Sube un archivo CSV o Excel con datos de <strong>{selectedCompany?.name}</strong>
                  </AlertDescription>
                </Alert>
                <FileDropzone
                  accept=".csv,.xlsx,.xls"
                  onFileSelect={handleFileUpload}
                  maxSize={10 * 1024 * 1024}
                />
              </TabsContent>

              <TabsContent value="paste" className="mt-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Copia los datos de <strong>{selectedCompany?.name}</strong> desde 
                    Excel y pégalos aquí. No incluyas datos de otras empresas.
                  </AlertDescription>
                </Alert>
                
                <PasteArea
                  onParsedData={handlePastedData}
                  disabled={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Paso 3: Preview (sin mapping) */}
      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Preview de Importación</CardTitle>
            <CardDescription className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  <Building className="h-3 w-3 mr-1" />
                  {selectedCompany?.name}
                </Badge>
                <span className="text-muted-foreground">·</span>
                <span>{parsedItems.length} conceptos</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold">{formatCurrency(summary?.totalAmount || 0)}</span>
              </div>
              {dateRange.min && dateRange.max && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Periodo:</span>
                  <span className="font-medium">
                    {dateRange.min.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    {dateRange.min.getTime() !== dateRange.max.getTime() && (
                      <> - {dateRange.max.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</>
                    )}
                  </span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parseErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{parseErrors.length} errores detectados:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {parseErrors.slice(0, 3).map((error, idx) => (
                      <li key={idx} className="text-sm">
                        {typeof error === 'string' ? error : error.error || 'Error desconocido'}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Vista agrupada por cliente */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {groupedItems.map((group) => (
                <div key={group.client_name} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{group.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.items_count} concepto{group.items_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(group.total_amount)}</div>
                      {group.is_recurring && (
                        <Badge variant="secondary" className="mt-1">
                          <Zap className="h-3 w-3 mr-1" />
                          Recurrente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            {summary && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-lg font-semibold">{formatCurrency(summary.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Recurrente</div>
                    <div className="text-lg font-semibold">{formatCurrency(summary.recurringAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Clientes</div>
                    <div className="text-lg font-semibold">{summary.uniqueClients}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Conceptos</div>
                    <div className="text-lg font-semibold">{parsedItems.length}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('paste-data')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={handleQuickImport} disabled={parsedItems.length === 0}>
              <Upload className="h-4 w-4 mr-2" />
              Confirmar e Importar {parsedItems.length} Ingresos
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Paso 4: Importando */}
      {step === 'importing' && (
        <Card>
          <CardHeader>
            <CardTitle>Importando Datos</CardTitle>
            <CardDescription>
              Por favor espera mientras se importan los datos...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso de importación</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <Alert>
              <FileSpreadsheet className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                Importando {parsedItems.length} ingresos para <strong>{selectedCompany?.name}</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Paso 5: Completado */}
      {step === 'complete' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Importación Completada
            </CardTitle>
            <CardDescription>
              Los datos han sido importados exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  {importResult.success.length}
                </div>
                <div className="text-sm text-muted-foreground">Exitosos</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {importResult.duplicates.length}
                </div>
                <div className="text-sm text-muted-foreground">Duplicados</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {importResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errores</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Errores detectados:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {importResult.errors.slice(0, 5).map((error: string, idx: number) => (
                      <li key={idx} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Los ingresos importados ya están disponibles en la vista principal de Ingresos.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Nueva Importación
            </Button>
            <Button onClick={handleFinish}>
              Ir a Ingresos
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
