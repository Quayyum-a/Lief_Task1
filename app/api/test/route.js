import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      status: 'ok',
      message: 'POST request received',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Invalid JSON',
      error: error.message
    }, { status: 400 });
  }
}
