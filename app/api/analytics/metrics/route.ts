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
    const period = searchParams.get('period') || '30'; // days
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

    // Calculate metrics
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map((rating: number) => ({
      rating,
      count: reviews?.filter((r: { rating: number }) => r.rating === rating).length || 0,
      percentage: totalReviews > 0 
        ? ((reviews?.filter((r: { rating: number }) => r.rating === rating).length || 0) / totalReviews) * 100 
        : 0
    }));

    // Recent trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyTrends = last7Days.map((date: string) => {
      const dayReviews = reviews?.filter((r: { created_at: string }) => 
        r.created_at.startsWith(date)
      ) || [];
      
      return {
        date,
        reviews: dayReviews.length,
        averageRating: dayReviews.length > 0 
          ? dayReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / dayReviews.length 
          : 0
      };
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalReviews,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        dailyTrends,
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Analytics metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
