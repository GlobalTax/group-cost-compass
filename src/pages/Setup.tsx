import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <CardTitle>Configuración de Acceso</CardTitle>
          </div>
          <CardDescription>
            Tu cuenta aún no tiene roles asignados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              Usuario: <span className="font-medium text-foreground">{user?.email}</span>
            </p>
            <p>
              Para acceder a la aplicación, necesitas que un administrador te asigne los permisos correspondientes.
            </p>
          </div>
          
          <div className="pt-4 space-y-2">
            <p className="text-sm font-medium">¿Qué hacer ahora?</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Contacta con el administrador del sistema</li>
              <li>Proporciona tu email de usuario</li>
              <li>Espera a que te asignen los roles necesarios</li>
            </ol>
          </div>

          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full"
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
