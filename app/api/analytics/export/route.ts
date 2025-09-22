import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const exportSchema = z.object({
  business_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  format: z.enum(['csv', 'json']).default('csv'),
  include_analytics: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = exportSchema.parse(body);
    const supabase = await createClient();

    // Build query conditions
    let query = supabase
      .from('reviews')
      .select(`
        *,
        businesses!inner(
          id,
          name,
          user_id
        )
      `)
      .eq('businesses.user_id', user.id);

    if (validatedData.business_id) {
      query = query.eq('business_id', validatedData.business_id);
    }

    if (validatedData.start_date) {
      query = query.gte('created_at', validatedData.start_date);
    }

    if (validatedData.end_date) {
      query = query.lte('created_at', validatedData.end_date);
    }

    const { data: reviews, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Prepare export data
    const exportData = reviews?.map(review => ({
      id: review.id,
      business_name: review.businesses.name,
      rating: review.rating,
      comment: review.comment,
      customer_name: review.customer_name,
      customer_email: review.customer_email,
      allow_follow_up: review.allow_follow_up,
      created_at: review.created_at,
      updated_at: review.updated_at,
    })) || [];

    // Add analytics if requested
    let analytics = null;
    if (validatedData.include_analytics && exportData.length > 0) {
      const totalReviews = exportData.length;
      const averageRating = exportData.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      
      analytics = {
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 100) / 100,
        rating_distribution: [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: exportData.filter(r => r.rating === rating).length,
          percentage: Math.round((exportData.filter(r => r.rating === rating).length / totalReviews) * 100)
        })),
        export_date: new Date().toISOString(),
        period: {
          start: validatedData.start_date || 'all_time',
          end: validatedData.end_date || 'all_time'
        }
      };
    }

    const response = {
      success: true,
      data: exportData,
      analytics,
      metadata: {
        format: validatedData.format,
        total_records: exportData.length,
        exported_at: new Date().toISOString(),
        user_id: user.id
      }
    };

    if (validatedData.format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'ID', 'Business Name', 'Rating', 'Comment', 'Customer Name', 
        'Customer Email', 'Allow Follow Up', 'Created At', 'Updated At'
      ];
      
      const csvRows = exportData.map(review => [
        review.id,
        review.business_name,
        review.rating,
        review.comment || '',
        review.customer_name || '',
        review.customer_email || '',
        review.allow_follow_up ? 'Yes' : 'No',
        review.created_at,
        review.updated_at
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reviews-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Analytics export error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
