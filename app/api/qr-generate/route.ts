import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(request, { limit: 20, windowMs: 60_000, key: 'qr:post' });
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rate.resetAt - Date.now()) / 1000).toString() } }
      );
    }
    const body = await request.json();
    const { businessId, size = 'medium', includeTracking = true } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get business data
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('name, logo_url')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Generate the review URL with optional tracking
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const reviewUrl = includeTracking 
      ? `${baseUrl}/review/${businessId}?source=qr_code`
      : `${baseUrl}/review/${businessId}`;

    // QR code dimensions
    const dimensions = {
      small: 128,
      medium: 256,
      large: 512,
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(reviewUrl, {
      width: dimensions[size as keyof typeof dimensions] || dimensions.medium,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      url: reviewUrl,
      businessName: business.name,
      size,
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
