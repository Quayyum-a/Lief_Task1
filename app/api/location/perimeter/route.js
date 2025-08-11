import { NextResponse } from 'next/server';
import { dbOperations } from '../../../../lib/supabase';

export async function GET(request) {
  try {
    const { data: perimeter, error } = await dbOperations.getLocationPerimeter();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Get perimeter error:', error);
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      );
    }
    
    if (!perimeter) {
      // Return default perimeter
      return NextResponse.json({
        perimeter: { latitude: 51.5074, longitude: -0.1278, radius: 2000 }
      });
    }
    
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
    
    const locationData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await dbOperations.updateLocationPerimeter(locationData);
    
    if (error) {
      console.error('Set perimeter error:', error);
      return NextResponse.json(
        { error: 'Database update failed', details: error.message },
        { status: 500 }
      );
    }
    
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
