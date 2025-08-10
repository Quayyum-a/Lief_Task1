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
    } catch (error) {
      console.error('Registration API error, falling back to localStorage:', error);
      // Fallback to localStorage if API fails
      if (typeof window === 'undefined') throw error;

      const users = JSON.parse(localStorage.getItem("users") || "[]");

      if (users.find((u) => u.username === userData.username)) {
        throw new Error("Username already exists");
      }

      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        password: userData.password,
        role: userData.role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
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
    } catch (error) {
      console.error('Login API error, falling back to localStorage:', error);
      // Fallback to localStorage if API fails
      if (typeof window === 'undefined') throw error;

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error("Invalid username or password");
      }

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
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
