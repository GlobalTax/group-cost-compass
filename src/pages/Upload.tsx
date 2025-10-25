import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Upload = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carga de Datos</h1>
          <p className="text-muted-foreground mt-1">
            Importa datos desde A3Nom mediante archivos CSV o Excel
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Formato requerido:</strong> Los archivos deben seguir el formato estándar de exportación de A3Nom.
            Descarga las plantillas de ejemplo si es tu primera importación.
          </AlertDescription>
        </Alert>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employees Upload */}
          <Card className="glass-card p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Datos de Empleados</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importa información de la plantilla
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Arrastra el archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV, XLSX (máx. 10MB)
                  </p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-medium">Columnas requeridas:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Nombre completo</li>
                    <li>• DNI/NIE</li>
                    <li>• Empresa</li>
                    <li>• Fecha de alta</li>
                    <li>• Fecha de baja (opcional)</li>
                  </ul>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Descargar Plantilla
              </Button>
            </div>
          </Card>

          {/* Costs Upload */}
          <Card className="glass-card p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Costes Mensuales</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importa nóminas y costes empresa
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-success/50 transition-colors cursor-pointer">
                  <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Arrastra el archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV, XLSX (máx. 10MB)
                  </p>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-medium">Columnas requeridas:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• DNI/NIE del empleado</li>
                    <li>• Periodo (YYYY-MM)</li>
                    <li>• Bruto mensual</li>
                    <li>• Coste empresa</li>
                  </ul>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Descargar Plantilla
              </Button>
            </div>
          </Card>
        </div>

        {/* Process Button */}
        <Card className="glass-elevated p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">¿Listo para procesar?</h3>
              <p className="text-sm text-muted-foreground">
                Los datos se validarán antes de ser guardados
              </p>
            </div>
            <Button size="lg" className="gradient-primary" disabled>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Procesar Importación
            </Button>
          </div>
        </Card>

        {/* Recent Imports */}
        <Card className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Importaciones Recientes</h3>
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay importaciones previas</p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Upload;
