import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Mail, Calendar, User, Briefcase, FileText } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import type { OnboardingRecord } from '@/lib/supabase/repositories/onboarding.repo';
import { useOnboardingDocuments } from '@/hooks/useOnboardingDocuments';

interface OnboardingDetailDrawerProps {
  onboarding: OnboardingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 1, title: 'Bienvenida' },
  { id: 2, title: 'Datos Personales' },
  { id: 3, title: 'Contacto' },
  { id: 4, title: 'Datos Bancarios' },
  { id: 5, title: 'Documentación' },
  { id: 6, title: 'Firma' },
  { id: 7, title: 'Confirmación' },
];

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  in_progress: { label: 'En Progreso', variant: 'default' as const },
  completed: { label: 'Completado', variant: 'default' as const },
  expired: { label: 'Expirado', variant: 'destructive' as const },
};

export function OnboardingDetailDrawer({ onboarding, open, onOpenChange }: OnboardingDetailDrawerProps) {
  const { data: documents } = useOnboardingDocuments(onboarding?.id);

  if (!onboarding) return null;

  const config = statusConfig[onboarding.status];
  const progress = Math.round((onboarding.current_step / 7) * 100);
  const onboardingUrl = `${window.location.origin}/onboarding/${onboarding.token}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle del Onboarding</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Header Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{onboarding.email}</span>
                  </div>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{onboarding.position_title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Creado: {formatDate(onboarding.created_at)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link de Acceso */}
          {onboarding.status !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Link de Acceso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={onboardingUrl} readOnly className="text-xs" />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(onboardingUrl);
                      toast.success('Link copiado');
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="progress">Progreso</TabsTrigger>
              <TabsTrigger value="data">Datos</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pasos Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {STEPS.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.id <= onboarding.current_step
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {step.id}
                        </div>
                        <span
                          className={`text-sm ${
                            step.id <= onboarding.current_step
                              ? 'font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              {onboarding.personal_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Datos Personales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(onboarding.personal_data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {onboarding.contact_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Datos de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(onboarding.contact_data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {onboarding.banking_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Datos Bancarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(onboarding.banking_data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Documentos Subidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 p-2 border rounded"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-sm flex-1">{doc.document_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay documentos
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
