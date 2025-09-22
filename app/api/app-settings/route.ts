import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get app settings (single row)
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch app settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Error fetching app settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = await createClient();

    // Update app settings (single row)
    const { data: settings, error } = await supabase
      .from('app_settings')
      .update(body)
      .eq('id', true)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update app settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Error updating app settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
