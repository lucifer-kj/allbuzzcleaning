import { requireAuth } from '@/lib/auth';
import { SettingsForm } from '@/components/dashboard/settings-form';

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your business information and review settings
        </p>
      </div>
      
      <SettingsForm />
    </div>
  );
}
