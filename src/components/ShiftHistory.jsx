import React from "react";
import { Clock, MapPin } from "lucide-react";

export default function ShiftHistory({ shifts }) {
  const formatTime = (timeString) => {
    if (!timeString) return "Not clocked out";
    return new Date(timeString).toLocaleString();
  };

  const calculateDuration = (start, end) => {
    if (!end) return "In progress";
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatLocation = (location) => {
    if (!location) return "Unknown";
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  if (shifts.length === 0) {
    return (
      <div
        className="text-center"
        style={{ padding: "40px", color: "#6b7280" }}
      >
        <Clock size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
        <p>No shift history yet</p>
        <p style={{ fontSize: "14px" }}>
          Your clock in/out records will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile view */}
      <div className="mobile-shifts" style={{ display: "block" }}>
        {shifts.map((shift) => (
          <div key={shift.id} className="card" style={{ marginBottom: "15px" }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 style={{ color: "#111827" }}>
                  {new Date(shift.clockInTime).toLocaleDateString()}
                </h4>
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
                  {calculateDuration(shift.clockInTime, shift.clockOutTime)}
                </p>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: "15px" }}>
              <div>
                <h5
                  style={{
                    color: "#10b981",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Clock In
                </h5>
                <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                  <strong>Time:</strong> {formatTime(shift.clockInTime)}
                </p>
                <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                  <MapPin
                    size={12}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  {formatLocation(shift.clockInLocation)}
                </p>
                {shift.clockInNote && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      fontStyle: "italic",
                    }}
                  >
                    "{shift.clockInNote}"
                  </p>
                )}
              </div>

              <div>
                <h5
                  style={{
                    color: "#ef4444",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Clock Out
                </h5>
                <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                  <strong>Time:</strong> {formatTime(shift.clockOutTime)}
                </p>
                {shift.clockOutLocation && (
                  <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                    <MapPin
                      size={12}
                      style={{ display: "inline", marginRight: "4px" }}
                    />
                    {formatLocation(shift.clockOutLocation)}
                  </p>
                )}
                {shift.clockOutNote && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      fontStyle: "italic",
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

      {/* Desktop table view */}
      <div style={{ display: "none" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id}>
                <td>{new Date(shift.clockInTime).toLocaleDateString()}</td>
                <td>
                  <div>
                    <p>{formatTime(shift.clockInTime)}</p>
                    {shift.clockInNote && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        "{shift.clockInNote}"
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <p>{formatTime(shift.clockOutTime)}</p>
                    {shift.clockOutNote && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        "{shift.clockOutNote}"
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  {calculateDuration(shift.clockInTime, shift.clockOutTime)}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      shift.clockOutTime
                        ? "status-clocked-out"
                        : "status-clocked-in"
                    }`}
                  >
                    {shift.clockOutTime ? "Completed" : "In Progress"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
