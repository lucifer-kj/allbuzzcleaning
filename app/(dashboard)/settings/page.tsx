import { requireAuth } from '@/lib/auth';
import { SettingsForm } from '@/components/dashboard/settings-form';
import { PasswordChangeForm } from '@/components/forms/password-change-form';

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your business information, review settings, and account preferences
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SettingsForm />
        </div>
        <div className="space-y-6">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
