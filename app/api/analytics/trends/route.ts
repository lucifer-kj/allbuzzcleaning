import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '90'; // days
    const granularity = searchParams.get('granularity') || 'week'; // day, week, month
    const supabase = await createClient();

    // Build query conditions
    let query = supabase
      .from('reviews')
      .select(`
        rating,
        created_at
      `);

    // Add date filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    query = query.gte('created_at', startDate.toISOString());

    const { data: reviews, error } = await query;

    if (error) {
      throw error;
    }

    // Group data by time period
    const groupedData = new Map<string, { reviews: number; ratings: number[] }>();

    reviews?.forEach(review => {
      const date = new Date(review.created_at);
      let key: string;

      switch (granularity) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, { reviews: 0, ratings: [] });
      }

      const data = groupedData.get(key)!;
      data.reviews += 1;
      data.ratings.push(review.rating);
    });

    // Convert to array and calculate trends
    const trends = Array.from(groupedData.entries())
      .map(([period, data]) => ({
        period,
        reviews: data.reviews,
        averageRating: data.ratings.length > 0 
          ? Math.round((data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length) * 100) / 100
          : 0,
        ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: data.ratings.filter(r => r === rating).length
        }))
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Calculate growth metrics
    const totalReviews = reviews?.length || 0;
    const previousPeriodReviews = trends.length > 1 
      ? trends[trends.length - 2].reviews 
      : 0;
    
    const reviewGrowth = previousPeriodReviews > 0 
      ? ((totalReviews - previousPeriodReviews) / previousPeriodReviews) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      trends: {
        data: trends,
        summary: {
          totalReviews,
          reviewGrowth: Math.round(reviewGrowth * 100) / 100,
          period: parseInt(period),
          granularity
        }
      }
    });

  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
