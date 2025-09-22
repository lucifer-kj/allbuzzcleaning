import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import QRCode from 'qrcode';
import { z } from 'zod';

const qrCodeSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  size: z.number().min(100).max(1000).default(300),
  include_logo: z.boolean().default(false),
  format: z.enum(['png', 'svg', 'base64']).default('png'),
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
    const validatedData = qrCodeSchema.parse(body);
    const supabase = await createClient();

    // Verify business ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, logo_url')
      .eq('id', validatedData.business_id)
      .eq('user_id', user.id)
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    // Generate review URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reviewUrl = `${baseUrl}/review/${business.id}`;

    // QR Code options
    const qrOptions = {
      width: validatedData.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    let qrCodeData: string;

    if (validatedData.format === 'svg') {
      qrCodeData = await QRCode.toString(reviewUrl, { 
        ...qrOptions, 
        type: 'svg' 
      });
    } else if (validatedData.format === 'base64') {
      qrCodeData = await QRCode.toDataURL(reviewUrl, qrOptions);
    } else {
      qrCodeData = await QRCode.toDataURL(reviewUrl, qrOptions);
    }

    // Track QR code generation
    await supabase
      .from('link_tracking')
      .insert({
        business_id: business.id,
        link_type: 'qr_code',
        link_url: reviewUrl,
        metadata: {
          size: validatedData.size,
          format: validatedData.format,
          include_logo: validatedData.include_logo
        }
      });

    return NextResponse.json({
      success: true,
      qr_code: {
        data: qrCodeData,
        url: reviewUrl,
        business_name: business.name,
        format: validatedData.format,
        size: validatedData.size
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('QR code generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
