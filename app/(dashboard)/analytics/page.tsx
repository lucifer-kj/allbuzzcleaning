import { requireAuth } from '@/lib/auth';
import { AnalyticsOverview } from '@/components/dashboard/analytics-overview';

export default async function AnalyticsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your review performance
        </p>
      </div>
      
      <AnalyticsOverview />
    </div>
  );
}
