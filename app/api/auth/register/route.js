import { NextResponse } from 'next/server';
const { getDbConnection, initializeDatabase } = require('../../../../lib/db');

export async function POST(request) {
  try {
    // Initialize database on first request
    await initializeDatabase();
    
    const { username, password, role } = await request.json();
    
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    const connection = await getDbConnection();
    const id = Date.now().toString();
    
    try {
      await connection.execute(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [id, username, password, role]
      );
      
      return NextResponse.json({
        user: {
          id,
          username,
          role,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
