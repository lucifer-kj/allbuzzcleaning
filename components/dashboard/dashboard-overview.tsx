'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Star, TrendingUp, Users, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ReviewTrendsChart } from '@/components/charts/review-trends-chart';
import { RatingDistributionChart } from '@/components/charts/rating-distribution-chart';
import { NotificationSystem } from '@/components/notifications/notification-system';
import { ExportPanel } from '@/components/export/export-panel';
import { AutoRefreshAnalytics } from '@/components/analytics/auto-refresh-analytics';
import { ReviewLinkCard } from '@/components/dashboard/review-link-card';
import { useAppSettings } from '@/components/providers/app-settings-provider';

interface DashboardMetrics {
  total_reviews: number;
  positive_reviews: number;
  internal_feedback: number;
  conversion_rate: number;
}

interface ReviewTrend {
  date: string;
  count: number;
  positive_count: number;
  negative_count: number;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<ReviewTrend[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { settings } = useAppSettings();

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        if (data.success) {
          setMetrics(data.metrics);
          setTrends(data.trends);
          setRatingDistribution(data.rating_distribution);
        } else {
          setError(data.error || 'Failed to fetch analytics');
        }
      } catch {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Total Reviews',
      value: metrics?.total_reviews.toString() || '0',
      description: 'Last 30 days',
      icon: Star,
      color: 'text-blue-600',
    },
    {
      title: 'Positive Reviews',
      value: metrics?.positive_reviews.toString() || '0',
      description: '4+ star ratings',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Internal Feedback',
      value: metrics?.internal_feedback.toString() || '0',
      description: 'Private feedback collected',
      icon: MessageSquare,
      color: 'text-orange-600',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics?.conversion_rate || 0}%`,
      description: 'Reviews to Google redirects',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {settings?.name || 'All Buzz Cleaning Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {settings?.description || 'Professional cleaning service review management dashboard'}
          </p>
        </div>
        <NotificationSystem />
      </div>

      {/* Single business mode: no switcher */}

      {/* Review Link Card */}
      <ReviewLinkCard />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your cleaning service reviews and customer feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/review/global">
                <Plus className="mr-2 h-4 w-4" />
                Open Public Review Page
              </Link>
            </Button>
            {/* Single business: no businesses management */}
            <Button variant="outline" asChild>
              <Link href="/reviews">
                View Reviews
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Trends</CardTitle>
            <CardDescription>
              Daily review submissions over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewTrendsChart data={trends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Distribution of star ratings received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RatingDistributionChart data={ratingDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Export and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AutoRefreshAnalytics
          onRefresh={() => {
            // Refresh analytics data
            (async () => {
              try {
                const response = await fetch('/api/analytics');
                const data = await response.json();
                if (data.success) {
                  setMetrics(data.metrics);
                  setTrends(data.trends);
                  setRatingDistribution(data.rating_distribution);
                }
              } catch {
                // ignore refresh error; UI already shows last data
              }
            })();
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Live Analytics</CardTitle>
              <CardDescription>
                Real-time analytics with auto-refresh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Analytics will appear here with real-time updates
                </p>
              </div>
            </CardContent>
          </Card>
        </AutoRefreshAnalytics>

        <ExportPanel reviews={[]} analytics={[]} />
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Configure your cleaning service settings and start collecting customer reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Configure Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Add your cleaning service details, logo, and Google Business Profile URL
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Generate Review Links</h4>
                <p className="text-sm text-muted-foreground">
                  Create shareable links and QR codes for customers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Start Collecting Reviews</h4>
                <p className="text-sm text-muted-foreground">
                  Share links with customers and watch your reviews grow
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
