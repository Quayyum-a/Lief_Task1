import { getDbConnection } from '../config/database.js';

export const dbShiftService = {
  // Create a new shift (clock in)
  async clockIn(userId, username, location, note = null) {
    const connection = await getDbConnection();
    
    // Check if user already has an active shift
    const activeShift = await this.getActiveShift(userId);
    if (activeShift) {
      throw new Error('User already has an active shift');
    }
    
    const shiftId = `shift-${Date.now()}`;
    const clockInTime = new Date();
    
    await connection.execute(
      `INSERT INTO shifts (id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shiftId, userId, username, clockInTime, location.latitude, location.longitude, note]
    );
    
    return {
      id: shiftId,
      userId,
      username,
      clockInTime: clockInTime.toISOString(),
      clockInLocation: location,
      clockInNote: note,
      clockOutTime: null,
      clockOutLocation: null,
      clockOutNote: null
    };
  },

  // End a shift (clock out)
  async clockOut(userId, location, note = null) {
    const connection = await getDbConnection();
    
    // Find the active shift for this user
    const activeShift = await this.getActiveShift(userId);
    if (!activeShift) {
      throw new Error('No active shift found for user');
    }
    
    const clockOutTime = new Date();
    
    await connection.execute(
      `UPDATE shifts SET clock_out_time = ?, clock_out_latitude = ?, clock_out_longitude = ?, clock_out_note = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [clockOutTime, location.latitude, location.longitude, note, activeShift.id]
    );
    
    return {
      ...activeShift,
      clockOutTime: clockOutTime.toISOString(),
      clockOutLocation: location,
      clockOutNote: note
    };
  },

  // Get active shift for a user
  async getActiveShift(userId) {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      `SELECT id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note
       FROM shifts WHERE user_id = ? AND clock_out_time IS NULL`,
      [userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const shift = rows[0];
    return {
      id: shift.id,
      userId: shift.user_id,
      username: shift.username,
      clockInTime: shift.clock_in_time.toISOString(),
      clockInLocation: {
        latitude: parseFloat(shift.clock_in_latitude),
        longitude: parseFloat(shift.clock_in_longitude)
      },
      clockInNote: shift.clock_in_note,
      clockOutTime: null,
      clockOutLocation: null,
      clockOutNote: null
    };
  },

  // Get all shifts for a user
  async getUserShifts(userId, limit = null) {
    const connection = await getDbConnection();
    
    let query = `
      SELECT id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note,
             clock_out_time, clock_out_latitude, clock_out_longitude, clock_out_note
      FROM shifts WHERE user_id = ? ORDER BY clock_in_time DESC
    `;
    
    const params = [userId];
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    const [rows] = await connection.execute(query, params);
    
    return rows.map(shift => ({
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
  },

  // Get all shifts (for manager view)
  async getAllShifts(limit = null) {
    const connection = await getDbConnection();
    
    let query = `
      SELECT id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note,
             clock_out_time, clock_out_latitude, clock_out_longitude, clock_out_note
      FROM shifts ORDER BY clock_in_time DESC
    `;
    
    const params = [];
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    const [rows] = await connection.execute(query, params);
    
    return rows.map(shift => ({
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
  },

  // Get currently active shifts (all users)
  async getActiveShifts() {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(`
      SELECT id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note
      FROM shifts WHERE clock_out_time IS NULL ORDER BY clock_in_time DESC
    `);
    
    return rows.map(shift => ({
      id: shift.id,
      userId: shift.user_id,
      username: shift.username,
      clockInTime: shift.clock_in_time.toISOString(),
      clockInLocation: {
        latitude: parseFloat(shift.clock_in_latitude),
        longitude: parseFloat(shift.clock_in_longitude)
      },
      clockInNote: shift.clock_in_note,
      clockOutTime: null,
      clockOutLocation: null,
      clockOutNote: null
    }));
  },

  // Get shifts within date range
  async getShiftsByDateRange(startDate, endDate, userId = null) {
    const connection = await getDbConnection();
    
    let query = `
      SELECT id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note,
             clock_out_time, clock_out_latitude, clock_out_longitude, clock_out_note
      FROM shifts WHERE clock_in_time >= ? AND clock_in_time <= ?
    `;
    
    const params = [startDate, endDate];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY clock_in_time DESC';
    
    const [rows] = await connection.execute(query, params);
    
    return rows.map(shift => ({
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
  }
};

export const locationService = {
  // Set location perimeter
  async setLocationPerimeter(latitude, longitude, radius) {
    const connection = await getDbConnection();
    
    // Delete existing perimeter
    await connection.execute('DELETE FROM location_perimeter');
    
    // Insert new perimeter
    await connection.execute(
      'INSERT INTO location_perimeter (latitude, longitude, radius) VALUES (?, ?, ?)',
      [latitude, longitude, radius]
    );
    
    return { latitude, longitude, radius };
  },

  // Get current location perimeter
  async getLocationPerimeter() {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT latitude, longitude, radius FROM location_perimeter ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      // Return default perimeter
      return { latitude: 51.5074, longitude: -0.1278, radius: 2000 };
    }
    
    const perimeter = rows[0];
    return {
      latitude: parseFloat(perimeter.latitude),
      longitude: parseFloat(perimeter.longitude),
      radius: perimeter.radius
    };
  }
};
