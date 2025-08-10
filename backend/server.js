const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Database connection
const getDbConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // First connect without database to create it if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConnection.end();

    // Now connect to the specific database
    const connection = await getDbConnection();

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('manager', 'care_worker') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create shifts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shifts (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        username VARCHAR(100) NOT NULL,
        clock_in_time TIMESTAMP NOT NULL,
        clock_in_latitude DECIMAL(10, 8),
        clock_in_longitude DECIMAL(11, 8),
        clock_in_note TEXT,
        clock_out_time TIMESTAMP NULL,
        clock_out_latitude DECIMAL(10, 8) NULL,
        clock_out_longitude DECIMAL(11, 8) NULL,
        clock_out_note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create location_perimeter table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS location_perimeter (
        id INT AUTO_INCREMENT PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        radius INT NOT NULL DEFAULT 2000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully!');
    return connection;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Healthcare Shift Tracker API is running!' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT id, username, role, created_at FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    const connection = await getDbConnection();
    const id = Date.now().toString();
    
    try {
      await connection.execute(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [id, username, password, role]
      );
      
      res.json({
        user: {
          id,
          username,
          role,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Shift routes
app.get('/api/shifts', async (req, res) => {
  try {
    const { userId, activeOnly } = req.query;
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
    
    res.json({ shifts });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/shifts', async (req, res) => {
  try {
    const { action, userId, username, location, note } = req.body;
    
    if (!action || !userId || !username) {
      return res.status(400).json({ error: 'Action, userId, and username are required' });
    }
    
    const connection = await getDbConnection();
    
    if (action === 'clockIn') {
      if (!location) {
        return res.status(400).json({ error: 'Location is required for clock in' });
      }
      
      // Check if user already has an active shift
      const [activeShifts] = await connection.execute(
        'SELECT id FROM shifts WHERE user_id = ? AND clock_out_time IS NULL',
        [userId]
      );
      
      if (activeShifts.length > 0) {
        return res.status(400).json({ error: 'User already has an active shift' });
      }
      
      const shiftId = `shift-${Date.now()}`;
      const clockInTime = new Date();
      
      await connection.execute(
        `INSERT INTO shifts (id, user_id, username, clock_in_time, clock_in_latitude, clock_in_longitude, clock_in_note) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [shiftId, userId, username, clockInTime, location.latitude, location.longitude, note]
      );
      
      res.json({
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
        return res.status(400).json({ error: 'Location is required for clock out' });
      }
      
      // Find the active shift for this user
      const [activeShifts] = await connection.execute(
        'SELECT * FROM shifts WHERE user_id = ? AND clock_out_time IS NULL',
        [userId]
      );
      
      if (activeShifts.length === 0) {
        return res.status(400).json({ error: 'No active shift found for user' });
      }
      
      const activeShift = activeShifts[0];
      const clockOutTime = new Date();
      
      await connection.execute(
        `UPDATE shifts SET clock_out_time = ?, clock_out_latitude = ?, clock_out_longitude = ?, clock_out_note = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [clockOutTime, location.latitude, location.longitude, note, activeShift.id]
      );
      
      res.json({
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
      res.status(400).json({ error: 'Invalid action. Must be clockIn or clockOut' });
    }
  } catch (error) {
    console.error('Shift operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Location routes
app.get('/api/location/perimeter', async (req, res) => {
  try {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT latitude, longitude, radius FROM location_perimeter ORDER BY created_at DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      // Return default perimeter
      return res.json({
        perimeter: { latitude: 51.5074, longitude: -0.1278, radius: 2000 }
      });
    }
    
    const perimeter = rows[0];
    res.json({
      perimeter: {
        latitude: parseFloat(perimeter.latitude),
        longitude: parseFloat(perimeter.longitude),
        radius: perimeter.radius
      }
    });
  } catch (error) {
    console.error('Get perimeter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/location/perimeter', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;
    
    if (latitude === undefined || longitude === undefined || radius === undefined) {
      return res.status(400).json({ error: 'Latitude, longitude, and radius are required' });
    }
    
    const connection = await getDbConnection();
    
    // Delete existing perimeter
    await connection.execute('DELETE FROM location_perimeter');
    
    // Insert new perimeter
    await connection.execute(
      'INSERT INTO location_perimeter (latitude, longitude, radius) VALUES (?, ?, ?)',
      [latitude, longitude, radius]
    );
    
    res.json({
      perimeter: { latitude, longitude, radius }
    });
  } catch (error) {
    console.error('Set perimeter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Demo data migration endpoint
app.post('/api/demo/migrate', async (req, res) => {
  try {
    const connection = await getDbConnection();
    
    // Create demo users
    const demoUsers = [
      { username: "manager", password: "password123", role: "manager" },
      { username: "alice", password: "password123", role: "care_worker" },
      { username: "bob", password: "password123", role: "care_worker" },
      { username: "carol", password: "password123", role: "care_worker" }
    ];

    const createdUsers = {};
    for (const userData of demoUsers) {
      const id = Date.now().toString() + Math.random();
      try {
        await connection.execute(
          'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
          [id, userData.username, userData.password, userData.role]
        );
        createdUsers[userData.username] = { id, ...userData };
        console.log(`Created user: ${userData.username}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // User already exists, find them
          const [rows] = await connection.execute(
            'SELECT id, username, role FROM users WHERE username = ?',
            [userData.username]
          );
          if (rows.length > 0) {
            createdUsers[userData.username] = rows[0];
            console.log(`User already exists: ${userData.username}`);
          }
        }
      }
    }

    // Set location perimeter
    await connection.execute('DELETE FROM location_perimeter');
    await connection.execute(
      'INSERT INTO location_perimeter (latitude, longitude, radius) VALUES (?, ?, ?)',
      [51.5074, -0.1278, 2000]
    );

    res.json({
      message: 'Demo data migrated successfully',
      users: Object.keys(createdUsers).length,
      success: true
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed: ' + error.message });
  }
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Healthcare Shift Tracker API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
