import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  title: string;
  description?: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full py-6">
      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <p
                  className={cn(
                    'mt-2 text-sm font-medium',
                    (isCompleted || isCurrent) && 'text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-4">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0 transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    (isCompleted || isCurrent) && 'text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
