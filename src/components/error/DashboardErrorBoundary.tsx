import { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

/**
 * Error Boundary específico para páginas de Dashboard
 * Fallback con botones para recargar o ir al inicio
 */
export function DashboardErrorBoundary({ children }: Props) {
  const navigate = useNavigate();

  const fallback = (
    <div className="p-8">
      <Card className="p-8 text-center border-destructive/50 bg-destructive/5">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Error al cargar el Dashboard
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          No se pudieron cargar los datos del dashboard. Por favor, intenta nuevamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>
            Recargar Página
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Ir al Inicio
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} context="Dashboard">
      {children}
    </ErrorBoundary>
  );
}
