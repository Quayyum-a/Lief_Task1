import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  try {
    const connection = await getDbConnection();
    await connection.execute('SELECT 1');
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      message: 'Database connection is working properly'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Database connection failed',
      message: error.message
    }, { status: 503 });
  }
}
