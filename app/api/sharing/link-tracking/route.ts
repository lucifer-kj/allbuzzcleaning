import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const trackingSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  link_type: z.enum(['direct', 'qr_code', 'social', 'email']),
  link_url: z.string().url('Invalid URL'),
  metadata: z.record(z.string(), z.unknown()).optional(),
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
    const validatedData = trackingSchema.parse(body);
    const supabase = await createClient();

    // Verify business ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', validatedData.business_id)
      .eq('user_id', user.id)
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Record link tracking
    const { data: tracking, error } = await supabase
      .from('link_tracking')
      .insert({
        business_id: validatedData.business_id,
        link_type: validatedData.link_type,
        link_url: validatedData.link_url,
        metadata: validatedData.metadata || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      tracking,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Link tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const businessId = searchParams.get('business_id');
    const period = searchParams.get('period') || '30'; // days
    const supabase = await createClient();

    // Build query conditions
    let query = supabase
      .from('link_tracking')
      .select(`
        *,
        businesses!inner(user_id)
      `)
      .eq('businesses.user_id', user.id);

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    // Add date filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    query = query.gte('created_at', startDate.toISOString());

    const { data: tracking, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Aggregate tracking data
    const linkTypes = ['direct', 'qr_code', 'social', 'email'];
    const typeStats = linkTypes.map(type => ({
      type,
      count: tracking?.filter(t => t.link_type === type).length || 0
    }));

    const totalClicks = tracking?.length || 0;

    return NextResponse.json({
      success: true,
      tracking: {
        data: tracking || [],
        stats: {
          totalClicks,
          typeStats,
          period: parseInt(period)
        }
      }
    });

  } catch (error) {
    console.error('Link tracking fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
