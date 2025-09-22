'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReviewTrend {
  date: string;
  count: number;
  positive_count: number;
  negative_count: number;
}

interface ReviewTrendsChartProps {
  data: ReviewTrend[];
}

export function ReviewTrendsChart({ data }: ReviewTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
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
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Total Reviews"
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="positive_count" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name="Positive (4-5 stars)"
            dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="negative_count" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="Negative (1-3 stars)"
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
