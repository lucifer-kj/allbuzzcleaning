'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface RatingDistributionChartProps {
  data: RatingDistribution | null;
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  // Convert data to array format for the chart
  const chartData = [
    { rating: '1★', count: data[1], color: 'hsl(var(--destructive))' },
    { rating: '2★', count: data[2], color: 'hsl(var(--destructive))' },
    { rating: '3★', count: data[3], color: 'hsl(var(--warning))' },
    { rating: '4★', count: data[4], color: 'hsl(var(--chart-1))' },
    { rating: '5★', count: data[5], color: 'hsl(var(--chart-1))' },
  ];

  const totalReviews = Object.values(data).reduce((sum, count) => sum + count, 0);

  if (totalReviews === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="rating" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value: number) => [
              `${value} reviews (${((value / totalReviews) * 100).toFixed(1)}%)`,
              'Count'
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
