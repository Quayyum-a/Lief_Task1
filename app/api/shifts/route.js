import { NextResponse } from 'next/server';
import { dbOperations } from '../../../lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activeOnly = searchParams.get('activeOnly');

    let shifts;
    let error;

    if (activeOnly === 'true' && userId) {
      // Get active shift for specific user
      const result = await dbOperations.getActiveShift(userId);
      shifts = result.data ? [result.data] : [];
      error = result.error;
    } else if (userId) {
      // Get all shifts for specific user
      const result = await dbOperations.getShiftsByUserId(userId);
      shifts = result.data || [];
      error = result.error;
    } else {
      // Get all shifts
      const result = await dbOperations.getAllShifts();
      shifts = result.data || [];
      error = result.error;
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Get shifts error:', error);
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      );
    }

    const formattedShifts = shifts.map(shift => ({
      id: shift.id,
      userId: shift.user_id,
      username: shift.username,
      clockInTime: shift.clock_in_time,
      clockInLocation: {
        latitude: parseFloat(shift.clock_in_latitude),
        longitude: parseFloat(shift.clock_in_longitude)
      },
      clockInNote: shift.clock_in_note,
      clockOutTime: shift.clock_out_time,
      clockOutLocation: shift.clock_out_time ? {
        latitude: parseFloat(shift.clock_out_latitude),
        longitude: parseFloat(shift.clock_out_longitude)
      } : null,
      clockOutNote: shift.clock_out_note
    }));

    return NextResponse.json({ shifts: formattedShifts });
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

    if (action === 'clockIn') {
      if (!location) {
        return NextResponse.json(
          { error: 'Location is required for clock in' },
          { status: 400 }
        );
      }

      // Check if user already has an active shift
      const { data: activeShift, error: activeError } = await dbOperations.getActiveShift(userId);

      if (activeShift && !activeError) {
        return NextResponse.json(
          { error: 'User already has an active shift' },
          { status: 400 }
        );
      }

      const shiftId = `shift-${Date.now()}`;
      const clockInTime = new Date().toISOString();

      const shiftData = {
        id: shiftId,
        user_id: userId,
        username,
        clock_in_time: clockInTime,
        clock_in_latitude: location.latitude,
        clock_in_longitude: location.longitude,
        clock_in_note: note,
        created_at: clockInTime,
        updated_at: clockInTime
      };

      const { data, error } = await dbOperations.createShift(shiftData);

      if (error) {
        console.error('Clock in error:', error);
        return NextResponse.json(
          { error: 'Failed to clock in', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        shift: {
          id: shiftId,
          userId,
          username,
          clockInTime,
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
      const { data: activeShift, error: activeError } = await dbOperations.getActiveShift(userId);

      if (!activeShift || activeError) {
        return NextResponse.json(
          { error: 'No active shift found for user' },
          { status: 400 }
        );
      }

      const clockOutTime = new Date().toISOString();

      const updateData = {
        clock_out_time: clockOutTime,
        clock_out_latitude: location.latitude,
        clock_out_longitude: location.longitude,
        clock_out_note: note,
        updated_at: clockOutTime
      };

      const { data, error } = await dbOperations.updateShift(activeShift.id, updateData);

      if (error) {
        console.error('Clock out error:', error);
        return NextResponse.json(
          { error: 'Failed to clock out', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        shift: {
          id: activeShift.id,
          userId: activeShift.user_id,
          username: activeShift.username,
          clockInTime: activeShift.clock_in_time,
          clockInLocation: {
            latitude: parseFloat(activeShift.clock_in_latitude),
            longitude: parseFloat(activeShift.clock_in_longitude)
          },
          clockInNote: activeShift.clock_in_note,
          clockOutTime,
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
