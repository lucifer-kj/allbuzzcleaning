import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Intentionally throw to test Sentry
    throw new Error('Sentry test error (manual trigger)');
  } catch (error) {
    return NextResponse.json({ ok: true, message: 'Error captured (Sentry disabled).'}, { status: 500 });
  }
}


