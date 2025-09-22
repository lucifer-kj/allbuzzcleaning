import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const reviewUpdateSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment too long').optional(),
  customer_name: z.string().max(100, 'Customer name too long').optional(),
  customer_email: z.string().email('Invalid email address').optional(),
  allow_follow_up: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const { id } = params;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get review by ID (only if user owns the business)
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        businesses!inner(user_id)
      `)
      .eq('id', id)
      .eq('businesses.user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      review,
    });

  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const { id } = params;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewUpdateSchema.parse(body);
    const supabase = await createClient();

    // Update review (only if user owns the business)
    const { data: review, error } = await supabase
      .from('reviews')
      .update({
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        customer_name: validatedData.customer_name || null,
        customer_email: validatedData.customer_email || null,
        allow_follow_up: validatedData.allow_follow_up || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
      )
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      review,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Review update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    const { id } = params;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Delete review (only if user owns the business)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('business_id', supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
      );

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error) {
    console.error('Review deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
