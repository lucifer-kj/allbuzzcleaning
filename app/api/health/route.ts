import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('businesses')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational'
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(healthStatus);

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          api: 'operational'
        },
        ...apiError('Database connection failed')
      },
      { status: 503 }
    );
  }
}
