import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  try {
    // First check if we have the required environment variables
    const missingEnvVars = [];
    if (!process.env.DB_HOST) missingEnvVars.push('DB_HOST');
    if (!process.env.DB_USER) missingEnvVars.push('DB_USER');
    if (!process.env.DB_PASSWORD) missingEnvVars.push('DB_PASSWORD');
    if (!process.env.DB_NAME) missingEnvVars.push('DB_NAME');

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        database: 'misconfigured',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        environment: process.env.NODE_ENV || 'development'
      }, { status: 500 });
    }

    const connection = await getDbConnection();

    // Test the connection with a simple query
    const [result] = await connection.execute('SELECT 1 as test');

    // Close connection in serverless environment
    if (process.env.VERCEL && connection.end) {
      await connection.end();
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      message: 'Database connection is working properly',
      environment: process.env.NODE_ENV || 'development',
      testQuery: result[0].test === 1 ? 'passed' : 'failed'
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
