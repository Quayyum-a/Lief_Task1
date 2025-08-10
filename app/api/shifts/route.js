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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activeOnly = searchParams.get('activeOnly');
    
    const connection = await getDbConnection();
    
    let query = `
      SELECT id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note,
             clock_out_time, clock_out_latitude, clock_out_longitude, clock_out_note
      FROM shifts
    `;
    
    let params = [];
    let conditions = [];
    
    if (activeOnly === 'true') {
      conditions.push('clock_out_time IS NULL');
    }
    
    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY clock_in_time DESC';
    
    const [rows] = await connection.execute(query, params);
    
    const shifts = rows.map(shift => ({
      id: shift.id,
      userId: shift.user_id,
      username: shift.username,
      clockInTime: shift.clock_in_time.toISOString(),
      clockInLocation: {
        latitude: parseFloat(shift.clock_in_latitude),
        longitude: parseFloat(shift.clock_in_longitude)
      },
      clockInNote: shift.clock_in_note,
      clockOutTime: shift.clock_out_time ? shift.clock_out_time.toISOString() : null,
      clockOutLocation: shift.clock_out_time ? {
        latitude: parseFloat(shift.clock_out_latitude),
        longitude: parseFloat(shift.clock_out_longitude)
      } : null,
      clockOutNote: shift.clock_out_note
    }));
    
    return NextResponse.json({ shifts });
  } catch (error) {
    console.error('Get shifts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, userId, username, location, note } = await request.json();
    
    if (!action || !userId || !username) {
      return NextResponse.json(
        { error: 'Action, userId, and username are required' },
        { status: 400 }
      );
    }
    
    const connection = await getDbConnection();
    
    if (action === 'clockIn') {
      if (!location) {
        return NextResponse.json(
          { error: 'Location is required for clock in' },
          { status: 400 }
        );
      }
      
      // Check if user already has an active shift
      const [activeShifts] = await connection.execute(
        'SELECT id FROM shifts WHERE user_id = ? AND clock_out_time IS NULL',
        [userId]
      );
      
      if (activeShifts.length > 0) {
        return NextResponse.json(
          { error: 'User already has an active shift' },
          { status: 400 }
        );
      }
      
      const shiftId = `shift-${Date.now()}`;
      const clockInTime = new Date();
      
      await connection.execute(
        `INSERT INTO shifts (id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [shiftId, userId, username, clockInTime, location.latitude, location.longitude, note]
      );
      
      return NextResponse.json({
        shift: {
          id: shiftId,
          userId,
          username,
          clockInTime: clockInTime.toISOString(),
          clockInLocation: location,
          clockInNote: note,
          clockOutTime: null,
          clockOutLocation: null,
          clockOutNote: null
        }
      });
      
    } else if (action === 'clockOut') {
      if (!location) {
        return NextResponse.json(
          { error: 'Location is required for clock out' },
          { status: 400 }
        );
      }
      
      // Find the active shift for this user
      const [activeShifts] = await connection.execute(
        'SELECT * FROM shifts WHERE user_id = ? AND clock_out_time IS NULL',
        [userId]
      );
      
      if (activeShifts.length === 0) {
        return NextResponse.json(
          { error: 'No active shift found for user' },
          { status: 400 }
        );
      }
      
      const activeShift = activeShifts[0];
      const clockOutTime = new Date();
      
      await connection.execute(
        `UPDATE shifts SET clock_out_time = ?, clock_out_latitude = ?, clock_out_longitude = ?, clock_out_note = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [clockOutTime, location.latitude, location.longitude, note, activeShift.id]
      );
      
      return NextResponse.json({
        shift: {
          id: activeShift.id,
          userId: activeShift.user_id,
          username: activeShift.username,
          clockInTime: activeShift.clock_in_time.toISOString(),
          clockInLocation: {
            latitude: parseFloat(activeShift.clock_in_latitude),
            longitude: parseFloat(activeShift.clock_in_longitude)
          },
          clockInNote: activeShift.clock_in_note,
          clockOutTime: clockOutTime.toISOString(),
          clockOutLocation: location,
          clockOutNote: note
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be clockIn or clockOut' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Shift operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
