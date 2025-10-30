import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOnboardingByToken, useUpdateOnboardingStepByToken } from '@/hooks/useOnboardingByToken';
import { PublicOnboardingLayout } from '@/components/onboarding/public/PublicOnboardingLayout';
import { OnboardingStepper, type Step } from '@/components/onboarding/public/OnboardingStepper';
import { WelcomeStep } from '@/components/onboarding/public/WelcomeStep';
import { PersonalDataForm } from '@/components/onboarding/public/PersonalDataForm';
import { ContactDataForm } from '@/components/onboarding/public/ContactDataForm';
import { BankingDataForm } from '@/components/onboarding/public/BankingDataForm';
import { DocumentUploadZone } from '@/components/onboarding/public/DocumentUploadZone';
import { DocumentSignature } from '@/components/onboarding/public/DocumentSignature';
import { OnboardingSuccess } from '@/components/onboarding/public/OnboardingSuccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompleteOnboarding } from '@/hooks/useOnboarding';
import { toast } from 'sonner';
import type { PersonalData, ContactData, BankingData } from '@/lib/validators/onboardingSchema';

const STEPS: Step[] = [
  { id: 1, title: 'Bienvenida' },
  { id: 2, title: 'Datos Personales' },
  { id: 3, title: 'Contacto' },
  { id: 4, title: 'Datos Bancarios' },
  { id: 5, title: 'Documentación' },
  { id: 6, title: 'Firma' },
  { id: 7, title: 'Confirmación' },
];

export default function PublicOnboarding() {
  const { token } = useParams<{ token: string }>();
  const { data: onboarding, isLoading, error } = useOnboardingByToken(token);
  const updateStep = useUpdateOnboardingStepByToken();
  const completeOnboarding = useCompleteOnboarding();
  
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (onboarding?.current_step) {
      setCurrentStep(onboarding.current_step);
    }
  }, [onboarding]);

  const handleStepComplete = async (step: number, data?: Record<string, any>) => {
    if (!onboarding) return;

    try {
      await updateStep.mutateAsync({
        id: onboarding.id,
        step: step + 1,
        stepData: data || {},
      });
      setCurrentStep(step + 1);
      toast.success('Progreso guardado');
    } catch (error) {
      console.error('Error saving step:', error);
    }
  };

  const handleComplete = async () => {
    if (!onboarding) return;

    try {
      await completeOnboarding.mutateAsync(onboarding.id);
      setCurrentStep(7);
      toast.success('¡Proceso completado!');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PublicOnboardingLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando proceso de incorporación...</p>
          </div>
        </div>
      </PublicOnboardingLayout>
    );
  }

  // Error state - token inválido
  if (error || !onboarding) {
    return (
      <PublicOnboardingLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-center">Enlace no válido</CardTitle>
            <CardDescription className="text-center">
              El enlace de incorporación no es válido o ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Por favor, contacta con el departamento de Recursos Humanos para obtener un nuevo enlace.
            </p>
          </CardContent>
        </Card>
      </PublicOnboardingLayout>
    );
  }

  // Onboarding expirado
  if (onboarding.status === 'expired') {
    return (
      <PublicOnboardingLayout candidateName={onboarding.email}>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-center">Proceso expirado</CardTitle>
            <CardDescription className="text-center">
              Este proceso de incorporación ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Por favor, contacta con Recursos Humanos para renovar el enlace.
            </p>
          </CardContent>
        </Card>
      </PublicOnboardingLayout>
    );
  }

  // Calcular días restantes
  const expiresAt = new Date(onboarding.expires_at);
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <PublicOnboardingLayout candidateName={onboarding.email}>
      {/* Alerta de expiración */}
      {daysRemaining <= 2 && daysRemaining > 0 && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Este enlace expirará en {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}. 
            Te recomendamos completar el proceso cuanto antes.
          </AlertDescription>
        </Alert>
      )}

      {/* Stepper */}
      <OnboardingStepper steps={STEPS} currentStep={currentStep} />

      {/* Content por paso */}
      <div className="mt-8">
        {currentStep === 1 && (
          <WelcomeStep
            positionTitle={onboarding.position_title}
            onNext={() => handleStepComplete(1)}
          />
        )}

        {currentStep === 2 && (
          <PersonalDataForm
            initialData={onboarding.personal_data}
            onNext={(data: PersonalData) => handleStepComplete(2, data)}
            onBack={() => setCurrentStep(1)}
            isSubmitting={updateStep.isPending}
          />
        )}

        {currentStep === 3 && (
          <ContactDataForm
            initialData={onboarding.contact_data}
            onNext={(data: ContactData) => handleStepComplete(3, data)}
            onBack={() => setCurrentStep(2)}
            isSubmitting={updateStep.isPending}
          />
        )}

        {currentStep === 4 && (
          <BankingDataForm
            initialData={onboarding.banking_data}
            onNext={(data: BankingData) => handleStepComplete(4, data)}
            onBack={() => setCurrentStep(3)}
            isSubmitting={updateStep.isPending}
          />
        )}

        {currentStep === 5 && (
          <DocumentUploadZone
            onNext={() => handleStepComplete(5)}
            onBack={() => setCurrentStep(4)}
            isSubmitting={updateStep.isPending}
          />
        )}

        {currentStep === 6 && (
          <DocumentSignature
            onNext={handleComplete}
            onBack={() => setCurrentStep(5)}
            isSubmitting={completeOnboarding.isPending}
          />
        )}

        {currentStep === 7 && <OnboardingSuccess />}
      </div>
    </PublicOnboardingLayout>
  );
}
