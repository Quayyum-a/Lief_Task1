import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Password@2001',
  database: process.env.DB_NAME || 'healthcare_shifts',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

const getDbConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

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
