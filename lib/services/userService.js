import { getDbConnection } from '../config/database.js';

export const userService = {
  // Create a new user
  async createUser(userData) {
    const connection = await getDbConnection();
    
    const { username, password, role } = userData;
    const id = Date.now().toString();
    
    try {
      await connection.execute(
        'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
        [id, username, password, role]
      );
      
      return { id, username, role, createdAt: new Date().toISOString() };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Username already exists');
      }
      throw error;
    }
  },

  // Find user by username and password
  async findUserByCredentials(username, password) {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT id, username, role, created_at FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const user = rows[0];
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.created_at.toISOString()
    };
  },

  // Find user by username (for checking uniqueness)
  async findUserByUsername(username) {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT id, username, role FROM users WHERE username = ?',
      [username]
    );
    
    return rows.length > 0 ? rows[0] : null;
  },

  // Get all users
  async getAllUsers() {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    return rows.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.created_at.toISOString()
    }));
  },

  // Get users by role
  async getUsersByRole(role) {
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute(
      'SELECT id, username, role, created_at FROM users WHERE role = ? ORDER BY username',
      [role]
    );
    
    return rows.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.created_at.toISOString()
    }));
  }
};
