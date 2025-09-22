import { requireAuth } from '@/lib/auth';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Buzz Cleaning Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your professional cleaning service review management dashboard
        </p>
      </div>
      
      <DashboardOverview />
    </div>
  );
}
