import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { PasteArea } from "@/components/upload/PasteArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies } from "@/hooks/useCompanies";
import { parseRevenueCSV, parseRevenueFromRows, groupItemsByClient, ParsedRevenueItem, detectCompanyForClient } from "@/lib/parsers/revenueParser";
import { bulkImportRevenueItems, validateImportData } from "@/services/import/revenueImportService";
import { formatCurrency } from "@/lib/formatters";
import { Upload, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronRight, Zap, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RevenueCSVUploadProps {
  onImportComplete: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';
type UploadMethod = 'file' | 'paste';

export const RevenueCSVUpload = ({ onImportComplete }: RevenueCSVUploadProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
  const [parsedItems, setParsedItems] = useState<ParsedRevenueItem[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; error: string }>>([]);
  const [summary, setSummary] = useState<any>(null);
  const [companyMapping, setCompanyMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const { data: companies } = useCompanies();
  const queryClient = useQueryClient();

  const handleFileUpload = async (file: File) => {
    try {
      toast.loading('Procesando archivo CSV...');
      
      const result = await parseRevenueCSV(file);
      
      setParsedItems(result.items);
      setParseErrors(result.errors);
      setSummary(result.summary);

      // Auto-detect company for each client
      const grouped = groupItemsByClient(result.items);
      const autoMapping: Record<string, string> = {};
      
      grouped.forEach(group => {
        const detected = detectCompanyForClient(group.client_name, group.categories);
        if (detected && companies) {
          const company = companies.find(c => 
            c.name.toLowerCase().includes(detected) ||
            c.nif?.toLowerCase().includes(detected)
          );
          if (company) {
            autoMapping[group.client_name] = company.id;
          }
        }
      });

      setCompanyMapping(autoMapping);
      setStep('mapping');
      toast.dismiss();
      toast.success(`Archivo procesado: ${result.items.length} líneas válidas`);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.dismiss();
      toast.error(error.message || 'Error al procesar el archivo');
    }
  };

  const handlePastedData = async (rows: Array<Record<string, any>>) => {
    try {
      toast.loading('Procesando datos pegados...');
      
      const result = await parseRevenueFromRows(rows);
      
      setParsedItems(result.items);
      setParseErrors(result.errors);
      setSummary(result.summary);

      // Auto-detect company for each client
      const grouped = groupItemsByClient(result.items);
      const autoMapping: Record<string, string> = {};
      
      grouped.forEach(group => {
        const detected = detectCompanyForClient(group.client_name, group.categories);
        if (detected && companies) {
          const company = companies.find(c => 
            c.name.toLowerCase().includes(detected) ||
            c.nif?.toLowerCase().includes(detected)
          );
          if (company) {
            autoMapping[group.client_name] = company.id;
          }
        }
      });

      setCompanyMapping(autoMapping);
      setStep('mapping');
      toast.dismiss();
      toast.success(`Datos procesados: ${result.items.length} líneas válidas`);
    } catch (error: any) {
      console.error('Error processing pasted data:', error);
      toast.dismiss();
      toast.error(error.message || 'Error al procesar los datos');
    }
  };

  const handleConfirmMapping = () => {
    const validation = validateImportData(parsedItems, companyMapping);
    
    if (!validation.valid) {
      toast.error('Faltan asignaciones', {
        description: validation.errors[0],
      });
      return;
    }

    setStep('preview');
  };

  const handleImport = async () => {
    setImporting(true);
    setStep('importing');
    setProgress(0);

    try {
      const result = await bulkImportRevenueItems(
        parsedItems,
        companyMapping,
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
        }
      );

      setImportResult(result);
      setStep('complete');

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['revenues'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });

      toast.success('Importación completada', {
        description: `${result.success.length} ingresos creados`,
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

  const toggleClientExpanded = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const groupedItems = groupItemsByClient(parsedItems);

  return (
    <div className="space-y-6">
      {/* Step: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Importar Facturación</CardTitle>
            <CardDescription>
              Elige cómo quieres cargar los datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as UploadMethod)}>
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
                <FileDropzone
                  accept=".csv,.xlsx,.xls"
                  onFileSelect={handleFileUpload}
                  maxSize={10 * 1024 * 1024}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Formato esperado: T, NÚMERO, INICIO, CL, NOMBRE CLIENTE, SECCIÓN, HN, CB, PG, E, FACTURA
                </p>
              </TabsContent>

              <TabsContent value="paste" className="mt-4">
                <PasteArea
                  onParsedData={handlePastedData}
                  disabled={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Step: Mapping */}
      {step === 'mapping' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Importación</CardTitle>
              <CardDescription>
                {summary.validRows} líneas válidas de {summary.totalRows} totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Ingresos</div>
                  <div className="text-2xl font-semibold">{formatCurrency(summary.totalAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Recurrentes</div>
                  <div className="text-2xl font-semibold">{formatCurrency(summary.recurringAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Clientes</div>
                  <div className="text-2xl font-semibold">{summary.uniqueClients}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Conceptos</div>
                  <div className="text-2xl font-semibold">{parsedItems.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {parseErrors.length} filas con errores fueron omitidas
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Asignar Empresas del Grupo</CardTitle>
              <CardDescription>
                Asigna cada cliente a una empresa del Grupo Navarro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedItems.map((group) => (
                  <div key={group.client_name} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{group.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.items_count} conceptos · {formatCurrency(group.total_amount)}
                      </div>
                    </div>
                    <Select
                      value={companyMapping[group.client_name] || ''}
                      onValueChange={(value) =>
                        setCompanyMapping((prev) => ({ ...prev, [group.client_name]: value }))
                      }
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmMapping}>
              Continuar a Preview
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview de Importación</CardTitle>
              <CardDescription>
                Revisa los datos antes de confirmar. Cada concepto/sección se guardará como un ingreso separado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedItems.map((group) => {
                  const companyName = companies?.find(c => c.id === companyMapping[group.client_name])?.name;
                  const isExpanded = expandedClients.has(group.client_name);
                  
                  return (
                    <Collapsible key={group.client_name} open={isExpanded} onOpenChange={() => toggleClientExpanded(group.client_name)}>
                      <div className="border rounded-lg">
                        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <div className="text-left">
                              <div className="font-medium">{group.client_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {companyName} · {group.items_count} conceptos
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(group.total_amount)}</div>
                            <div className="flex gap-1 justify-end mt-1">
                              {group.is_recurring && (
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Recurrente
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="border-t px-4 py-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Categoría</TableHead>
                                  <TableHead>Factura</TableHead>
                                  <TableHead className="text-right">Importe</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.items.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <span>{item.category}</span>
                                        {item.is_recurring && (
                                          <Badge variant="outline" className="text-xs">Recurrente</Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{item.invoice_number}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(item.total_amount)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')}>
              Volver
            </Button>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Confirmar e Importar {parsedItems.length} Ingresos
            </Button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <Card>
          <CardHeader>
            <CardTitle>Importando...</CardTitle>
            <CardDescription>
              Creando {parsedItems.length} ingresos en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} />
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progress}% completado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {step === 'complete' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Importación Completada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Creados</div>
                <div className="text-2xl font-semibold text-green-600">{importResult.success.length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Duplicados</div>
                <div className="text-2xl font-semibold text-yellow-600">{importResult.duplicates.length}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Errores</div>
                <div className="text-2xl font-semibold text-red-600">{importResult.errors.length}</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {importResult.errors.length} errores durante la importación
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={onImportComplete} className="w-full">
              Ver Ingresos Importados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
