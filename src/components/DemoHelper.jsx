import React from "react";
import { initializeDemoData, clearDemoData } from "../utils/demoData";

export default function DemoHelper() {
  const handleInitializeDemo = () => {
    initializeDemoData();
    window.location.reload();
  };

  const handleClearData = () => {
    clearDemoData();
    window.location.reload();
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
      zIndex: 1000
    }}>
      <h4 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "600" }}>
        Demo Helper
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={handleInitializeDemo}
          className="btn btn-primary"
          style={{ padding: "6px 12px", fontSize: "12px" }}
        >
          Load Demo Data
        </button>
        <button
          onClick={handleClearData}
          className="btn btn-outline"
          style={{ padding: "6px 12px", fontSize: "12px" }}
        >
          Clear All Data
        </button>
      </div>
      <div style={{ marginTop: "10px", fontSize: "11px", color: "#6b7280" }}>
        <p><strong>Demo Accounts:</strong></p>
        <p>Manager: manager/password123</p>
        <p>Workers: alice, bob, carol/password123</p>
      </div>
    </div>
  );
}
