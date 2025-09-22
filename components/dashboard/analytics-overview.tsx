'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, TrendingUp, Users, MessageSquare, Star } from 'lucide-react';
import { ReviewTrendsChart } from '@/components/charts/review-trends-chart';
import { RatingDistributionChart } from '@/components/charts/rating-distribution-chart';

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

export function AnalyticsOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<ReviewTrend[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
      });

      const response = await fetch(`/api/analytics?${params}`);
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
  }, [selectedPeriod]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
              <Button onClick={fetchAnalytics} className="mt-4">
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
      description: `Last ${selectedPeriod} days`,
      icon: Star,
      color: 'text-blue-600',
      trend: '+12%',
    },
    {
      title: 'Positive Reviews',
      value: metrics?.positive_reviews.toString() || '0',
      description: '4+ star ratings',
      icon: TrendingUp,
      color: 'text-green-600',
      trend: '+8%',
    },
    {
      title: 'Internal Feedback',
      value: metrics?.internal_feedback.toString() || '0',
      description: 'Private feedback collected',
      icon: MessageSquare,
      color: 'text-orange-600',
      trend: '+5%',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics?.conversion_rate || 0}%`,
      description: 'Reviews to Google redirects',
      icon: Users,
      color: 'text-purple-600',
      trend: '+3%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>
            Customize your analytics view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Period:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                <span className="text-xs text-green-600 font-medium">
                  {metric.trend}
                </span>
              </div>
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
              Daily review submissions over the selected period
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

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>
              Reviews to Google redirects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics?.conversion_rate || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                High ratings redirect to Google
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>
              Time to respond to feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                2.4h
              </div>
              <p className="text-sm text-muted-foreground">
                Average response time
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction</CardTitle>
            <CardDescription>
              Overall satisfaction score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics?.total_reviews ? 
                  ((metrics.positive_reviews / metrics.total_reviews) * 5).toFixed(1) : 
                  '0.0'
                }/5
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {metrics?.total_reviews || 0} reviews
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
