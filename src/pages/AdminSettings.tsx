import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SystemSettingsForm } from '@/components/admin/SystemSettingsForm';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useCompanies } from '@/hooks/useCompanies';

export default function AdminSettings() {
  const { data: companies = [] } = useCompanies();
  const orgId = companies.length > 0 ? companies[0].org_id : '';
  const { data: settings = [], isLoading } = useSystemSettings(orgId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Parámetros globales de la organización"
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : (
        <SystemSettingsForm settings={settings} orgId={orgId} />
      )}
    </div>
  );
}
