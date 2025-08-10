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

// Initialize database tables
const initializeDatabase = async () => {
  try {
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

    console.log('Database tables initialized successfully!');
    return connection;
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw, just log - the API should still work if tables exist
  }
};

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
