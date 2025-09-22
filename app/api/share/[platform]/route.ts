import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';

const shareSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  platform: z.enum(['whatsapp', 'email', 'sms', 'facebook', 'twitter', 'linkedin']),
  custom_message: z.string().max(500, 'Message too long').optional(),
});

export async function POST(
  request: Request,
  { params }: any
) {
  try {
    const user = await getUser();
    const { platform } = params;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = shareSchema.parse({ ...body, platform });
    const supabase = await createClient();

    // Verify business ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name')
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

    // Create share message
    const defaultMessage = `Please share your experience with ${business.name}: ${reviewUrl}`;
    const shareMessage = validatedData.custom_message || defaultMessage;

    // Generate platform-specific share URLs
    let shareUrl: string;
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(reviewUrl);

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Share your experience with ${business.name}&body=${encodedMessage}`;
        break;
      case 'sms':
        shareUrl = `sms:?body=${encodedMessage}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported platform' },
          { status: 400 }
        );
    }

    // Track sharing activity
    await supabase
      .from('link_tracking')
      .insert({
        business_id: business.id,
        link_type: 'social',
        link_url: shareUrl,
        metadata: {
          platform,
          custom_message: validatedData.custom_message,
          share_message: shareMessage
        }
      });

    return NextResponse.json({
      success: true,
      share: {
        platform,
        url: shareUrl,
        message: shareMessage,
        business_name: business.name
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Share generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
