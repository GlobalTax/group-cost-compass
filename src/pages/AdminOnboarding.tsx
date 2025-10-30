import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { OnboardingKPIs } from '@/components/onboarding/OnboardingKPIs';
import { OnboardingFilters } from '@/components/onboarding/OnboardingFilters';
import { OnboardingTable } from '@/components/onboarding/OnboardingTable';
import { CreateOnboardingDialog } from '@/components/onboarding/CreateOnboardingDialog';
import { OnboardingDetailDrawer } from '@/components/onboarding/OnboardingDetailDrawer';
import { useOnboardings, useDeleteOnboarding } from '@/hooks/useOnboarding';
import type { OnboardingFilters as Filters } from '@/lib/validators/onboardingSchema';
import type { OnboardingRecord } from '@/lib/supabase/repositories/onboarding.repo';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function AdminOnboarding() {
  const [filters, setFilters] = useState<Filters>({ status: 'all' });
  const [selectedOnboarding, setSelectedOnboarding] = useState<OnboardingRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: onboardings, isLoading } = useOnboardings(filters);
  const deleteMutation = useDeleteOnboarding();

  const handleViewDetail = (onboarding: OnboardingRecord) => {
    setSelectedOnboarding(onboarding);
    setDrawerOpen(true);
  };

  const handleResendInvitation = (onboarding: OnboardingRecord) => {
    // TODO: Implementar envío de email en Fase 3
    toast.info('Funcionalidad de reenvío pendiente de implementar');
    console.log('Reenviar invitación a:', onboarding.email);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este onboarding?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Gestión de Onboarding"
        subtitle="Administra los procesos de incorporación de personal"
      />

      <OnboardingKPIs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <OnboardingFilters filters={filters} onFiltersChange={setFilters} />
        <CreateOnboardingDialog />
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : (
        <OnboardingTable
          onboardings={onboardings || []}
          onViewDetail={handleViewDetail}
          onResendInvitation={handleResendInvitation}
          onDelete={handleDelete}
        />
      )}

      <OnboardingDetailDrawer
        onboarding={selectedOnboarding}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
