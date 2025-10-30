import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, Calendar } from 'lucide-react';

export function OnboardingSuccess() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">¡Proceso completado con éxito!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Has completado todos los pasos del proceso de incorporación. 
            Tu información ha sido registrada correctamente.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Próximos pasos</h3>
                <p className="text-sm text-muted-foreground">
                  Recibirás un correo electrónico con toda la información sobre tu primer día de trabajo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Bienvenida</h3>
                <p className="text-sm text-muted-foreground">
                  El departamento de RRHH se pondrá en contacto contigo en breve para confirmar 
                  tu fecha de incorporación y resolver cualquier duda.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              ¡Te damos la bienvenida al equipo de <strong>Grupo Navarro</strong>!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
