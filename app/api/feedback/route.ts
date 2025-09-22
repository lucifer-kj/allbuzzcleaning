import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const feedbackFormSchema = z.object({
  review_id: z.string().uuid('Invalid review ID').optional(),
  contact_email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  issue_category: z.string().min(1, 'Please select an issue category'),
  detailed_feedback: z.string().min(10, 'Please provide at least 10 characters of feedback'),
  allow_follow_up: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for feedback submissions
    const rate = checkRateLimit(request, { limit: 5, windowMs: 60_000, key: 'feedback:post' });
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many feedback submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rate.resetAt - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const validatedData = feedbackFormSchema.parse(body);

    const supabase = await createClient();

    // Store detailed feedback in analytics table
    const { data: feedback, error } = await supabase
      .from('analytics')
      .insert({
        metric_type: 'internal_feedback',
        value: 1,
        metadata: {
          review_id: validatedData.review_id || null,
          issue_category: validatedData.issue_category,
          detailed_feedback: validatedData.detailed_feedback,
          contact_email: validatedData.contact_email || null,
          contact_phone: validatedData.contact_phone || null,
          allow_follow_up: validatedData.allow_follow_up,
          submitted_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || null,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback submission error:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        submitted_at: feedback.created_at,
      },
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
