import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request) {
  try {
    // Check if we have the required environment variables
    if (!process.env.SUPABASE_KEY) {
      return NextResponse.json({
        status: 'error',
        database: 'misconfigured',
        message: 'Missing SUPABASE_KEY environment variable',
        environment: process.env.NODE_ENV || 'development'
      }, { status: 500 });
    }

    // Test the connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      message: 'Supabase connection is working properly',
      environment: process.env.NODE_ENV || 'development',
      supabaseUrl: 'https://fpzoowjaorzrrvkyvprj.supabase.co'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: 'Database connection failed',
        error: error.message,
        environment: process.env.NODE_ENV || 'development'
      },
      { status: 500 }
    );
  }
}
