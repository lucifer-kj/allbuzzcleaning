import { requireAuth } from '@/lib/auth';
import { ReviewsTable } from '@/components/dashboard/reviews-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Download, RefreshCw } from 'lucide-react';

export default async function ReviewsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">
            Manage and analyze customer reviews
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            Latest customer reviews and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewsTable />
        </CardContent>
      </Card>
    </div>
  );
}
