'use client'

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || `Registration failed with status ${response.status}`);
      }

      const userWithoutPassword = { ...data.user };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);

      // Keep session in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      }

      return userWithoutPassword;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || `Login failed with status ${response.status}`);
      }

      setUser(data.user);

      // Keep session in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("currentUser");
    }
  };

  const value = {
    user,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
