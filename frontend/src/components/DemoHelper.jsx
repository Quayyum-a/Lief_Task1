import React, { useState } from 'react';
import { demoAPI } from '../services/api';

// Demo data for local fallback
const initializeDemoData = () => {
  localStorage.clear();

  const demoUsers = [
    {
      id: 'manager-1',
      username: 'manager',
      password: 'password123',
      role: 'manager',
      createdAt: '2024-01-01T10:00:00.000Z'
    },
    {
      id: 'care-1', 
      username: 'alice',
      password: 'password123',
      role: 'care_worker',
      createdAt: '2024-01-01T10:00:00.000Z'
    },
    {
      id: 'care-2',
      username: 'bob', 
      password: 'password123',
      role: 'care_worker',
      createdAt: '2024-01-02T10:00:00.000Z'
    },
    {
      id: 'care-3',
      username: 'carol',
      password: 'password123', 
      role: 'care_worker',
      createdAt: '2024-01-03T10:00:00.000Z'
    }
  ];

  localStorage.setItem('users', JSON.stringify(demoUsers));
  localStorage.setItem('shifts', JSON.stringify([]));
  localStorage.setItem('locationPerimeter', JSON.stringify({
    latitude: 51.5074,
    longitude: -0.1278,
    radius: 2000
  }));
  
  console.log('Demo data initialized locally!');
};

export default function DemoHelper() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitializeDemoDatabase = async () => {
    setIsLoading(true);
    setMessage('Migrating demo data to database...');
    
    try {
      await demoAPI.migrateDemoData();
      setMessage('Demo data migrated to database successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(`Migration error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeDemo = () => {
    initializeDemoData();
    window.location.reload();
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      zIndex: 1000,
      maxWidth: '280px'
    }}>
      <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
        Demo Helper
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleInitializeDemoDatabase}
          className="btn btn-success"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          disabled={isLoading}
        >
          {isLoading ? 'Migrating...' : 'Load Demo Data (Database)'}
        </button>
        <button
          onClick={handleInitializeDemo}
          className="btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          Load Demo Data (LocalStorage)
        </button>
        <button
          onClick={handleClearData}
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          Clear All Data
        </button>
      </div>
      {message && (
        <div style={{ 
          marginTop: '10px', 
          fontSize: '11px', 
          color: message.includes('success') ? '#10b981' : '#ef4444',
          padding: '5px',
          borderRadius: '4px',
          backgroundColor: message.includes('success') ? '#f0fdf4' : '#fef2f2'
        }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#6b7280' }}>
        <p><strong>Demo Accounts:</strong></p>
        <p>Manager: manager/password123</p>
        <p>Workers: alice, bob, carol/password123</p>
      </div>
    </div>
  );
}
