import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface WelcomeStepProps {
  positionTitle: string;
  onNext: () => void;
}

export function WelcomeStep({ positionTitle, onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido/a al proceso de incorporación!</CardTitle>
          <CardDescription>
            Estamos encantados de que formes parte del equipo como <strong>{positionTitle}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Este proceso incluye los siguientes pasos:</h3>
            <div className="space-y-3">
              {[
                'Datos personales',
                'Información de contacto',
                'Datos bancarios para nómina',
                'Subida de documentación requerida',
                'Firma de documentos',
                'Confirmación final',
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Importante:</strong> Puedes guardar tu progreso y volver más tarde. 
              El enlace tiene validez de 7 días desde su envío.
            </p>
          </div>

          <Button onClick={onNext} size="lg" className="w-full">
            Comenzar Proceso
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
