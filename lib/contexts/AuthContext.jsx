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
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    const userWithoutPassword = { ...data.user };
    delete userWithoutPassword.password;

    setUser(userWithoutPassword);

    // Keep session in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
    }

    return userWithoutPassword;
  };

  const login = async (username, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);

    // Keep session in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }

    return data.user;
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
