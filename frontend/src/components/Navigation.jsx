import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="nav-brand">Healthcare Shift Tracker</div>
        <div className="nav-user">
          <span>Welcome, {user?.username}</span>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            ({user?.role === 'manager' ? 'Manager' : 'Care Worker'})
          </span>
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
