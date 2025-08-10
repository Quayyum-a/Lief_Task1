import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const { user } = await authAPI.login(username, password);
      setUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      // Fallback to localStorage for offline mode
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error('Invalid username or password');
      }

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    }
  };

  const register = async (userData) => {
    try {
      const { user } = await authAPI.register(userData);
      setUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      // Fallback to localStorage for offline mode
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      if (users.find((u) => u.username === userData.username)) {
        throw new Error('Username already exists');
      }

      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        password: userData.password,
        role: userData.role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
