import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { reviewFormSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting per IP for public review submissions
    const rate = checkRateLimit(request, { limit: 10, windowMs: 60_000, key: 'reviews:post' });
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rate.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();

    const validatedData = reviewFormSchema.parse(body);
    // validated

    const supabase = await createClient();

    // Insert review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        customer_name: validatedData.customer_name,
        customer_phone: validatedData.customer_phone || null,
        rating: validatedData.rating,
        is_public: validatedData.rating >= 4,
      })
      .select()
      .single();

    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json(
        { error: 'Database insert error' },
        { status: 500 }
      );
    }

    // Track review submission in analytics
    await supabase
      .from('analytics')
      .insert({
        metric_type: 'review_submitted',
        value: 1,
        metadata: {
          review_id: review.id,
          rating: validatedData.rating,
          is_public: review.is_public,
          customer_name: validatedData.customer_name,
          submitted_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || null,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        },
      });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        is_public: review.is_public,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all reviews (single business model)
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
