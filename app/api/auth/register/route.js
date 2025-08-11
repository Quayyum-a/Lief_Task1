import { NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '../../../../lib/db';

export async function POST(request) {
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { username, password, role } = requestBody;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    // Initialize database tables (safe to call multiple times)
    try {
      await initializeDatabase();
    } catch (initError) {
      console.warn('Database initialization warning:', initError.message);
      // Continue anyway - tables might already exist
    }

    const connection = await getDbConnection();
    const id = Date.now().toString();

    try {
      await connection.execute(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [id, username, password, role]
      );

      // Close connection in serverless environment
      if (process.env.VERCEL && connection.end) {
        await connection.end();
      }

      return NextResponse.json({
        user: {
          id,
          username,
          role,
          createdAt: new Date().toISOString()
        }
      });
    } catch (dbError) {
      // Close connection on error too
      if (process.env.VERCEL && connection.end) {
        try { await connection.end(); } catch (e) {}
      }

      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
