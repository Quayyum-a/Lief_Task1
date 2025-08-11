import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return sanitized database configuration info (no passwords)
    const config = {
      environment: process.env.NODE_ENV || 'development',
      isVercel: !!process.env.VERCEL,
      hasDbHost: !!process.env.DB_HOST,
      hasDbUser: !!process.env.DB_USER,  
      hasDbPassword: !!process.env.DB_PASSWORD,
      hasDbName: !!process.env.DB_NAME,
      dbHost: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 10) + '...' : 'not set',
      dbUser: process.env.DB_USER ? process.env.DB_USER.substring(0, 3) + '...' : 'not set',
      dbName: process.env.DB_NAME || 'not set',
      envVarCount: Object.keys(process.env).filter(key => key.startsWith('DB_')).length
    };

    return NextResponse.json({
      status: 'info',
      message: 'Database configuration (sanitized)',
      config
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to read configuration',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
