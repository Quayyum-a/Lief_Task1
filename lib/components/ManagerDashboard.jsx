'use client'

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ShiftService, LocationService } from "../services/shiftService";
import Navigation from "./Navigation";
import LocationSettings from "./LocationSettings";
import StaffTable from "./StaffTable";
import Analytics from "./Analytics";
import { Users, BarChart3, MapPin, Clock } from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [shifts, setShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allShifts = await ShiftService.getAllShifts();
      const currentlyActive = allShifts.filter(shift => !shift.clockOutTime);
      const allUsers = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem("users") || "[]")
        : [];

      setShifts(allShifts);
      setActiveShifts(currentlyActive);
      setUsers(allUsers.filter((u) => u.role === "care_worker"));
    } catch (error) {
      console.error('Failed to load manager dashboard data:', error);
    }
  };

  if (user?.role !== "manager") {
    return (
      <div className="container">
        <div className="card">
          <h2 style={{ color: "#ef4444" }}>Access Denied</h2>
          <p>You don't have permission to access the manager dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Manager Dashboard</h2>
            <p style={{ color: "#6b7280", marginTop: "5px" }}>
              Manage staff shifts and view analytics
            </p>
          </div>

          {/* Tab Navigation */}
          <div
            style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "20px" }}
          >
            <div style={{ display: "flex", gap: "20px" }}>
              <button
                onClick={() => setActiveTab("overview")}
                className={`tab-button ${
                  activeTab === "overview" ? "active" : ""
                }`}
                style={{
                  padding: "10px 0",
                  border: "none",
                  background: "none",
                  borderBottom:
                    activeTab === "overview"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  color: activeTab === "overview" ? "#3b82f6" : "#6b7280",
                  fontWeight: "600",
                }}
              >
                <BarChart3 size={16} style={{ marginRight: "8px" }} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={`tab-button ${
                  activeTab === "staff" ? "active" : ""
                }`}
                style={{
                  padding: "10px 0",
                  border: "none",
                  background: "none",
                  borderBottom:
                    activeTab === "staff"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  color: activeTab === "staff" ? "#3b82f6" : "#6b7280",
                  fontWeight: "600",
                }}
              >
                <Users size={16} style={{ marginRight: "8px" }} />
                Staff
              </button>
              <button
                onClick={() => setActiveTab("location")}
                className={`tab-button ${
                  activeTab === "location" ? "active" : ""
                }`}
                style={{
                  padding: "10px 0",
                  border: "none",
                  background: "none",
                  borderBottom:
                    activeTab === "location"
                      ? "2px solid #3b82f6"
                      : "2px solid transparent",
                  color: activeTab === "location" ? "#3b82f6" : "#6b7280",
                  fontWeight: "600",
                }}
              >
                <MapPin size={16} style={{ marginRight: "8px" }} />
                Location
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <Analytics
              shifts={shifts}
              activeShifts={activeShifts}
              users={users}
              onDataUpdate={loadData}
            />
          )}

          {activeTab === "staff" && (
            <StaffTable
              shifts={shifts}
              activeShifts={activeShifts}
              users={users}
              onDataUpdate={loadData}
            />
          )}

          {activeTab === "location" && <LocationSettings onUpdate={loadData} />}
        </div>
      </div>
    </>
  );
}
