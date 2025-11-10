import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare } from "lucide-react";

export const AlertConfigPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Alertas Automáticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-1">
                <Label className="text-base">Alertas por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar email cuando haya errores críticos o importaciones fallidas
                </p>
                <Input
                  placeholder="admin@gruponavarro.com"
                  className="mt-2 max-w-xs"
                />
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <Label className="text-base">Alertas por Slack</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar en canal de Slack #tech-alerts
                </p>
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-2 max-w-xs"
                />
              </div>
            </div>
            <Switch />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <Label className="text-base">Umbrales de Alerta</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Errores críticos (por hora)
                </Label>
                <Input type="number" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  FCP máximo (ms)
                </Label>
                <Input type="number" defaultValue="2500" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  LCP máximo (ms)
                </Label>
                <Input type="number" defaultValue="4000" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Importaciones fallidas consecutivas
                </Label>
                <Input type="number" defaultValue="3" />
              </div>
            </div>
          </div>

          <Button className="w-full">Guardar Configuración</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Alertas Enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay alertas recientes
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
