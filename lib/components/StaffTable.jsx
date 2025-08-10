'use client'

import React, { useState } from "react";
import { Users, Clock, MapPin, FileText } from "lucide-react";

export default function StaffTable({
  shifts,
  activeShifts,
  users,
  onDataUpdate,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeRange, setTimeRange] = useState("week");

  const formatTime = (timeString) => {
    if (!timeString) return "Not clocked out";
    return new Date(timeString).toLocaleString();
  };

  const formatLocation = (location) => {
    if (!location) return "Unknown";
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const calculateDuration = (start, end) => {
    if (!end) return "In progress";
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getFilteredShifts = (userId) => {
    const now = new Date();
    const startDate = new Date();

    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setDate(now.getDate() - 1);
    }

    return shifts
      .filter(
        (s) => s.userId === userId && new Date(s.clockInTime) >= startDate
      )
      .sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime));
  };

  const getUserStats = (userId) => {
    const userShifts = getFilteredShifts(userId);
    const completedShifts = userShifts.filter((s) => s.clockOutTime);

    const totalHours = completedShifts.reduce((total, shift) => {
      const duration =
        new Date(shift.clockOutTime) - new Date(shift.clockInTime);
      return total + duration;
    }, 0);

    const hours = Math.floor(totalHours / (1000 * 60 * 60));
    const minutes = Math.floor((totalHours % (1000 * 60 * 60)) / (1000 * 60));

    return {
      totalShifts: userShifts.length,
      completedShifts: completedShifts.length,
      totalTime: `${hours}h ${minutes}m`,
      isActive: activeShifts.some((s) => s.userId === userId),
    };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Users size={24} />
          <div>
            <h3 className="card-title">Staff Management</h3>
            <p style={{ color: "#6b7280", marginTop: "5px" }}>
              Currently active: {activeShifts.length} staff members
            </p>
          </div>
        </div>

        <div className="form-group" style={{ margin: 0, minWidth: "120px" }}>
          <select
            className="form-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="day">Last 24 hours</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
          </select>
        </div>
      </div>

      {/* Currently Active Staff */}
      {activeShifts.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "20px",
            background: "#dcfce7",
            border: "1px solid #10b981",
          }}
        >
          <h4 style={{ color: "#166534", marginBottom: "15px" }}>
            Currently Clocked In
          </h4>
          <div className="grid grid-2">
            {activeShifts.map((shift) => (
              <div
                key={shift.id}
                style={{
                  padding: "10px",
                  background: "white",
                  borderRadius: "8px",
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p style={{ fontWeight: "600" }}>{shift.username}</p>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                      Since: {formatTime(shift.clockInTime)}
                    </p>
                  </div>
                  <span className="status-badge status-clocked-in">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Overview Table */}
      <div className="card">
        <h4 style={{ marginBottom: "15px" }}>All Staff Overview</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Status</th>
                <th>Total Shifts</th>
                <th>Total Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const stats = getUserStats(user.id);
                return (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: "600" }}>{user.username}</p>
                        <p style={{ fontSize: "12px", color: "#6b7280" }}>
                          Joined:{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          stats.isActive
                            ? "status-clocked-in"
                            : "status-clocked-out"
                        }`}
                      >
                        {stats.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{stats.totalShifts}</td>
                    <td>{stats.totalTime}</td>
                    <td>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: "14px" }}
                      >
                        <FileText size={14} style={{ marginRight: "4px" }} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Detail Modal */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">
                {selectedUser.username} - Shift Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-secondary"
                style={{ padding: "6px 12px" }}
              >
                Close
              </button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: "20px" }}>
              {(() => {
                const stats = getUserStats(selectedUser.id);
                return (
                  <>
                    <div className="stats-card">
                      <div className="stats-number">{stats.totalShifts}</div>
                      <div className="stats-label">Total Shifts</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-number">
                        {stats.completedShifts}
                      </div>
                      <div className="stats-label">Completed</div>
                    </div>
                    <div className="stats-card">
                      <div
                        className="stats-number"
                        style={{ fontSize: "24px" }}
                      >
                        {stats.totalTime}
                      </div>
                      <div className="stats-label">Total Hours</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <h4 style={{ marginBottom: "15px" }}>Recent Shifts</h4>
            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              {getFilteredShifts(selectedUser.id).map((shift) => (
                <div
                  key={shift.id}
                  className="card"
                  style={{ marginBottom: "15px" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5>
                        {new Date(shift.clockInTime).toLocaleDateString()}
                      </h5>
                      <span
                        className={`status-badge ${
                          shift.clockOutTime
                            ? "status-clocked-out"
                            : "status-clocked-in"
                        }`}
                      >
                        {shift.clockOutTime ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p style={{ fontWeight: "600", color: "#3b82f6" }}>
                        {calculateDuration(
                          shift.clockInTime,
                          shift.clockOutTime
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div>
                      <h6 style={{ color: "#10b981", marginBottom: "8px" }}>
                        Clock In
                      </h6>
                      <p style={{ fontSize: "14px" }}>
                        <Clock size={12} style={{ marginRight: "4px" }} />
                        {formatTime(shift.clockInTime)}
                      </p>
                      <p style={{ fontSize: "14px" }}>
                        <MapPin size={12} style={{ marginRight: "4px" }} />
                        {formatLocation(shift.clockInLocation)}
                      </p>
                      {shift.clockInNote && (
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            fontStyle: "italic",
                            marginTop: "4px",
                          }}
                        >
                          "{shift.clockInNote}"
                        </p>
                      )}
                    </div>

                    <div>
                      <h6 style={{ color: "#ef4444", marginBottom: "8px" }}>
                        Clock Out
                      </h6>
                      <p style={{ fontSize: "14px" }}>
                        <Clock size={12} style={{ marginRight: "4px" }} />
                        {formatTime(shift.clockOutTime)}
                      </p>
                      {shift.clockOutLocation && (
                        <p style={{ fontSize: "14px" }}>
                          <MapPin size={12} style={{ marginRight: "4px" }} />
                          {formatLocation(shift.clockOutLocation)}
                        </p>
                      )}
                      {shift.clockOutNote && (
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            fontStyle: "italic",
                            marginTop: "4px",
                          }}
                        >
                          "{shift.clockOutNote}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
