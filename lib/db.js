import mysql from 'mysql2/promise';

// Database configuration with fallbacks for serverless environments
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Password@2001',
  database: process.env.DB_NAME || 'healthcare_shifts',
  charset: 'utf8mb4',
  // Remove invalid configuration options that cause warnings
  connectTimeout: 60000,
  // Only include valid mysql2 options
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

let pool;

export const getDbConnection = async () => {
  try {
    if (!pool) {
      // For serverless environments, create a new connection each time
      if (process.env.VERCEL) {
        return await mysql.createConnection(dbConfig);
      } else {
        // For local development, use connection pooling
        pool = mysql.createPool(dbConfig);
      }
    }
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Initialize database tables - called once during deployment or first request
export const initializeDatabase = async () => {
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
    
    // Close connection in serverless environment
    if (process.env.VERCEL && connection.end) {
      await connection.end();
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw in production, just log
    return false;
  }
};
