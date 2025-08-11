import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  try {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT latitude, longitude, radius FROM location_perimeter ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      // Return default perimeter
      return NextResponse.json({
        perimeter: { latitude: 51.5074, longitude: -0.1278, radius: 2000 }
      });
    }
    
    const perimeter = rows[0];
    return NextResponse.json({
      perimeter: {
        latitude: parseFloat(perimeter.latitude),
        longitude: parseFloat(perimeter.longitude),
        radius: perimeter.radius
      }
    });
  } catch (error) {
    console.error('Get perimeter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { latitude, longitude, radius } = await request.json();
    
    if (latitude === undefined || longitude === undefined || radius === undefined) {
      return NextResponse.json(
        { error: 'Latitude, longitude, and radius are required' },
        { status: 400 }
      );
    }
    
    const connection = await getDbConnection();
    
    // Delete existing perimeter
    await connection.execute('DELETE FROM location_perimeter');
    
    // Insert new perimeter
    await connection.execute(
      'INSERT INTO location_perimeter (latitude, longitude, radius) VALUES (?, ?, ?)',
      [latitude, longitude, radius]
    );
    
    return NextResponse.json({
      perimeter: { latitude, longitude, radius }
    });
  } catch (error) {
    console.error('Set perimeter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
