import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('Robots.txt generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate robots.txt' },
      { status: 500 }
    );
  }
}
