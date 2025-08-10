'use client'

import { useState } from 'react';
import { initializeDemoData, clearDemoData } from "../utils/demoData";

export default function DemoHelper() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitializeDemo = () => {
    initializeDemoData();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleInitializeDemoDatabase = () => {
    setMessage('Database migration moved to separated frontend/backend architecture. See DEPLOYMENT.md');
  };

  const handleClearData = () => {
    clearDemoData();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "white",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e5e7eb",
      zIndex: 1000,
      maxWidth: "280px"
    }}>
      <h4 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "600" }}>
        Demo Helper
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={handleInitializeDemoDatabase}
          className="btn btn-secondary"
          style={{ padding: "6px 12px", fontSize: "12px" }}
          disabled={true}
        >
          Use Separated Frontend
        </button>
        <button
          onClick={handleInitializeDemo}
          className="btn btn-primary"
          style={{ padding: "6px 12px", fontSize: "12px" }}
        >
          Load Demo Data (LocalStorage)
        </button>
        <button
          onClick={handleClearData}
          className="btn btn-outline"
          style={{ padding: "6px 12px", fontSize: "12px" }}
        >
          Clear All Data
        </button>
      </div>
      {message && (
        <div style={{
          marginTop: "10px",
          fontSize: "11px",
          color: message.includes('success') ? "#10b981" : "#ef4444",
          padding: "5px",
          borderRadius: "4px",
          backgroundColor: message.includes('success') ? "#f0fdf4" : "#fef2f2"
        }}>
          {message}
        </div>
      )}
      <div style={{ marginTop: "10px", fontSize: "11px", color: "#6b7280" }}>
        <p><strong>Demo Accounts:</strong></p>
        <p>Manager: manager/password123</p>
        <p>Workers: alice, bob, carol/password123</p>
      </div>
    </div>
  );
}
