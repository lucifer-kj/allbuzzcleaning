'use client';

import React, { useState, useEffect } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Star, MessageSquare, Eye, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';


type ConsolidatedAnalyticsProps = object;

interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  totalBusinesses: number;
  recentReviews: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  monthlyTrends: Array<{ month: string; reviews: number; rating: number }>;
  topPerformingBusinesses: Array<{ name: string; reviews: number; rating: number }>;
}

export function ConsolidatedAnalytics(_: ConsolidatedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const businesses: Array<{ id: string; name: string; reviews_count?: number; average_rating?: number; logo_url?: string }> = [];

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        totalReviews: 1247,
        averageRating: 4.2,
        totalBusinesses: 1,
        recentReviews: 23,
        ratingDistribution: [
          { rating: 5, count: 456 },
          { rating: 4, count: 312 },
          { rating: 3, count: 234 },
          { rating: 2, count: 145 },
          { rating: 1, count: 100 },
        ],
        monthlyTrends: [
          { month: 'Jan', reviews: 89, rating: 4.1 },
          { month: 'Feb', reviews: 102, rating: 4.2 },
          { month: 'Mar', reviews: 95, rating: 4.0 },
          { month: 'Apr', reviews: 118, rating: 4.3 },
          { month: 'May', reviews: 134, rating: 4.2 },
          { month: 'Jun', reviews: 127, rating: 4.4 },
        ],
        topPerformingBusinesses: [
          { name: 'Your Business', reviews: 1247, rating: 4.2 },
        ],
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [dateRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">
              Analytics data will appear here once you have reviews
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">Single-business analytics overview</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40">
                {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Custom date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{analyticsData.totalReviews.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{analyticsData.averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+0.2 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-bold">{analyticsData.totalBusinesses}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">Active businesses</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Reviews</p>
                <p className="text-2xl font-bold">{analyticsData.recentReviews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">This week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of reviews by star rating</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  nameKey="rating"
                  label={(props: any) => `${props.name}★ (${props.value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Reviews and ratings over time</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="reviews" fill="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Businesses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Businesses</CardTitle>
          <CardDescription>Your best performing businesses by reviews and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPerformingBusinesses.map((business, index) => (
              <div key={business.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <h3 className="font-medium">{business.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {business.reviews} reviews • {business.rating.toFixed(1)}★ average
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{business.rating.toFixed(1)}</span>
                  </div>
                  <Badge variant="secondary">{business.reviews} reviews</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
