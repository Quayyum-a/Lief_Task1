'use client'

import { useState, useEffect } from "react";
import { ShiftService, LocationService } from "../services/shiftService";
import { Clock, MapPin, AlertCircle } from "lucide-react";

export default function ClockInOut({
  currentShift,
  user,
  location,
  onLocationUpdate,
  onShiftUpdate,
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("checking");
  const [withinPerimeter, setWithinPerimeter] = useState(false);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    setLocationStatus("checking");
    setError("");

    try {
      const position = await LocationService.getCurrentPosition();
      onLocationUpdate(position);

      const isWithin = await LocationService.isWithinPerimeter(
        position.latitude,
        position.longitude
      );
      setWithinPerimeter(isWithin);
      setLocationStatus("ready");
    } catch (err) {
      setError(`Location error: ${err.message}`);
      setLocationStatus("error");
    }
  };

  const handleClockIn = async () => {
    if (!withinPerimeter) {
      setError("You must be within the designated work area to clock in");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const position = await LocationService.getCurrentPosition();

      await ShiftService.clockIn(
        user.id,
        user.username,
        {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        note.trim() || null
      );

      setNote("");
      onShiftUpdate();
    } catch (err) {
      setError(`Failed to clock in: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentShift) return;

    setLoading(true);
    setError("");

    try {
      const position = await LocationService.getCurrentPosition();

      await ShiftService.clockOut(
        user.id,
        {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        note.trim() || null
      );

      setNote("");
      onShiftUpdate();
    } catch (err) {
      setError(`Failed to clock out: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString();
  };

  const calculateShiftDuration = () => {
    if (!currentShift) return null;
    const start = new Date(currentShift.clockInTime);
    const end = new Date();
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      {/* Location Status */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <MapPin size={20} />
          <div>
            <p style={{ fontWeight: "600" }}>Location Status</p>
            {locationStatus === "checking" && (
              <p style={{ color: "#6b7280" }}>Checking your location...</p>
            )}
            {locationStatus === "ready" && (
              <p style={{ color: withinPerimeter ? "#10b981" : "#ef4444" }}>
                {withinPerimeter ? "Within work area" : "Outside work area"}
              </p>
            )}
            {locationStatus === "error" && (
              <p style={{ color: "#ef4444" }}>Location unavailable</p>
            )}
          </div>
          <button
            onClick={checkLocation}
            className="btn btn-outline"
            style={{ padding: "6px 12px", fontSize: "14px" }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Current Shift Status */}
      {currentShift && (
        <div
          className="card"
          style={{
            background: "#dcfce7",
            border: "1px solid #10b981",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ color: "#166534", marginBottom: "10px" }}>
            Currently Clocked In
          </h4>
          <p>
            <strong>Clock In Time:</strong>{" "}
            {formatTime(currentShift.clockInTime)}
          </p>
          <p>
            <strong>Duration:</strong> {calculateShiftDuration()}
          </p>
          {currentShift.clockInNote && (
            <p>
              <strong>Clock In Note:</strong> {currentShift.clockInNote}
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className="card"
          style={{
            background: "#fef2f2",
            border: "1px solid #ef4444",
            marginBottom: "20px",
          }}
        >
          <div className="flex items-center gap-4">
            <AlertCircle size={20} style={{ color: "#ef4444" }} />
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Note Input */}
      <div className="form-group mb-4">
        <label className="form-label">
          {currentShift
            ? "Clock Out Note (Optional)"
            : "Clock In Note (Optional)"}
        </label>
        <textarea
          className="form-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            currentShift
              ? "Add a note about your shift end..."
              : "Add a note about your shift start..."
          }
          maxLength={500}
        />
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
          {note.length}/500 characters
        </p>
      </div>

      {/* Clock In/Out Button */}
      <div className="flex gap-4">
        {!currentShift ? (
          <button
            onClick={handleClockIn}
            disabled={loading || locationStatus !== "ready" || !withinPerimeter}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            <Clock size={16} style={{ marginRight: "8px" }} />
            {loading ? "Clocking In..." : "Clock In"}
          </button>
        ) : (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            <Clock size={16} style={{ marginRight: "8px" }} />
            {loading ? "Clocking Out..." : "Clock Out"}
          </button>
        )}
      </div>

      {/* Help Text */}
      {!withinPerimeter && locationStatus === "ready" && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#fef3c7",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "#92400e", fontSize: "14px" }}>
            You need to be within the designated work area to clock in. Please
            move closer to your workplace.
          </p>
        </div>
      )}
    </div>
  );
}
