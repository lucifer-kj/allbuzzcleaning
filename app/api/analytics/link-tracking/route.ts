import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(request, { limit: 60, windowMs: 60_000, key: 'analytics:track' });
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rate.resetAt - Date.now()) / 1000).toString() } }
      );
    }
    const body = await request.json();
    const { link_type, source, user_agent, referrer } = body;

    if (!link_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert link tracking data
    const { error } = await supabase
      .from('analytics')
      .insert({
        metric_type: 'review_submitted',
        value: 1,
        metadata: {
          link_type, // 'qr_code', 'direct_link', 'social_share', etc.
          source, // 'facebook', 'whatsapp', 'email', etc.
          user_agent: user_agent || null,
          referrer: referrer || null,
          timestamp: new Date().toISOString(),
          ...body.metadata, // Include any additional metadata
        },
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Link click tracked successfully',
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const period = searchParams.get('period') || '30';

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Get link tracking analytics
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('business_id', businessId)
      .eq('metric_type', 'link_click')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process analytics data
    const linkStats = {
      total_clicks: analytics?.length || 0,
      by_source: {} as Record<string, number>,
      by_type: {} as Record<string, number>,
      daily_clicks: [] as Array<{ date: string; count: number }>,
    };

    // Group by source and type
    analytics?.forEach((item: { metadata: unknown }) => {
      const metadata = item.metadata as unknown as { source: string; link_type: string };
      const source = metadata?.source || 'unknown';
      const type = metadata?.link_type || 'unknown';

      linkStats.by_source[source] = (linkStats.by_source[source] || 0) + 1;
      linkStats.by_type[type] = (linkStats.by_type[type] || 0) + 1;
    });

    // Calculate daily clicks
    const days = parseInt(period);
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClicks = analytics?.filter((item: { created_at: string }) => 
        item.created_at.startsWith(dateStr)
      ).length || 0;
      
      linkStats.daily_clicks.push({
        date: dateStr,
        count: dayClicks,
      });
    }

    return NextResponse.json({
      success: true,
      analytics: linkStats,
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
