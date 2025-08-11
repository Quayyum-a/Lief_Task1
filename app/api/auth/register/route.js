import { NextResponse } from 'next/server';
import { dbOperations } from '../../../../lib/supabase';

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

    const id = Date.now().toString();
    const userData = {
      id,
      username,
      password,
      role,
      created_at: new Date().toISOString()
    };

    // Create user in Supabase
    const { data, error } = await dbOperations.createUser(userData);

    if (error) {
      console.error('Database error:', error);

      // Handle duplicate username
      if (error.code === '23505' || error.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    const user = data[0];
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
