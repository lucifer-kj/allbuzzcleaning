'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface DashboardMetrics {
  totalReviews: number;
  averageRating: number;
  totalFeedback: number;
  responseRate: number;
  ratingTrend: number;
  reviewTrend: number;
}

interface ReviewTrend {
  date: string;
  count: number;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface EnhancedDashboardOverviewProps {
  metrics?: DashboardMetrics;
  trends?: ReviewTrend[];
  ratingDistribution?: RatingDistribution[];
  isLoading?: boolean;
}

export function EnhancedDashboardOverview({
  metrics,
  trends = [],
  ratingDistribution = [],
  isLoading = false,
}: EnhancedDashboardOverviewProps) {
  const { toast } = useToast();

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Latest metrics are being updated.",
    });
    // Add refresh logic here
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Total Reviews',
      value: metrics?.totalReviews || 0,
      description: 'All time reviews',
      icon: MessageSquare,
      color: 'text-blue-600',
      trend: metrics?.reviewTrend || 0,
    },
    {
      title: 'Average Rating',
      value: metrics?.averageRating?.toFixed(1) || '0.0',
      description: 'Out of 5 stars',
      icon: Star,
      color: 'text-yellow-600',
      trend: metrics?.ratingTrend || 0,
    },
    {
      title: 'Feedback Received',
      value: metrics?.totalFeedback || 0,
      description: 'Private feedback',
      icon: Users,
      color: 'text-green-600',
      trend: 0,
    },
    {
      title: 'Response Rate',
      value: `${metrics?.responseRate || 0}%`,
      description: 'Customer engagement',
      icon: TrendingUp,
      color: 'text-purple-600',
      trend: 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your review performance and customer feedback
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </motion.button>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <AnimatedCard
            key={metric.title}
            delay={index * 0.1}
            className="relative overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className={`flex items-center gap-1 text-xs ${
                      metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.trend > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(metric.trend)}%
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
            
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'linear',
              }}
            />
          </AnimatedCard>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Trends */}
        <AnimatedCard delay={0.4} className="h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Review Trends
            </CardTitle>
            <CardDescription>
              Daily review submissions over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trends.length > 0 ? (
              <div className="space-y-3">
                {trends.slice(-7).map((trend, index) => (
                  <motion.div
                    key={trend.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(trend.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(trend.count / Math.max(...trends.map(t => t.count))) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-8 text-right">
                        {trend.count}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Rating Distribution */}
        <AnimatedCard delay={0.5} className="h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
            <CardDescription>
              Distribution of star ratings received
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratingDistribution.length > 0 ? (
              <div className="space-y-3">
                {ratingDistribution.map((rating, index) => (
                  <motion.div
                    key={rating.rating}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rating.rating}★</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={rating.percentage} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {rating.count}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  );
}
