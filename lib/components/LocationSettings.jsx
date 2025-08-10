'use client'

import React, { useState, useEffect } from "react";
import { LocationService } from "../services/shiftService";
import { MapPin, Save, RefreshCw } from "lucide-react";

export default function LocationSettings({ onUpdate }) {
  const [perimeter, setPerimeter] = useState({
    latitude: "",
    longitude: "",
    radius: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const current = LocationService.getPerimeter();
    setPerimeter(current);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const lat = parseFloat(perimeter.latitude);
      const lon = parseFloat(perimeter.longitude);
      const rad = parseInt(perimeter.radius);

      if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
        throw new Error("Please enter valid numbers for all fields");
      }

      if (lat < -90 || lat > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }

      if (lon < -180 || lon > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }

      if (rad < 10 || rad > 10000) {
        throw new Error("Radius must be between 10 and 10000 meters");
      }

      LocationService.setPerimeter(lat, lon, rad);
      setMessage("Location perimeter updated successfully");
      setMessageType("success");
      onUpdate();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setMessage("");

    LocationService.getCurrentPosition()
      .then((position) => {
        setPerimeter((prev) => ({
          ...prev,
          latitude: position.latitude.toString(),
          longitude: position.longitude.toString(),
        }));
        setMessage("Current location detected");
        setMessageType("success");
      })
      .catch((error) => {
        setMessage(`Failed to get location: ${error.message}`);
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <MapPin size={24} />
        <div>
          <h3 className="card-title">Location Perimeter Settings</h3>
          <p style={{ color: "#6b7280", marginTop: "5px" }}>
            Set the work area where staff can clock in
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={perimeter.latitude}
              onChange={(e) =>
                setPerimeter((prev) => ({ ...prev, latitude: e.target.value }))
              }
              placeholder="51.5074"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={perimeter.longitude}
              onChange={(e) =>
                setPerimeter((prev) => ({ ...prev, longitude: e.target.value }))
              }
              placeholder="-0.1278"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Radius (meters)</label>
          <input
            type="number"
            className="form-input"
            value={perimeter.radius}
            onChange={(e) =>
              setPerimeter((prev) => ({ ...prev, radius: e.target.value }))
            }
            placeholder="2000"
            min="10"
            max="10000"
            required
          />
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "5px" }}>
            Staff can clock in within this distance from the center point
          </p>
        </div>

        {message && (
          <div
            className={`${
              messageType === "success" ? "success-message" : "error-message"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="btn btn-outline"
          >
            <RefreshCw size={16} style={{ marginRight: "8px" }} />
            Use Current Location
          </button>

          <button type="submit" disabled={loading} className="btn btn-primary">
            <Save size={16} style={{ marginRight: "8px" }} />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Current Settings Display */}
      <div
        className="card"
        style={{ marginTop: "20px", background: "#f9fafb" }}
      >
        <h4 style={{ marginBottom: "10px" }}>Current Settings</h4>
        <div className="grid grid-3">
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Latitude</p>
            <p style={{ fontWeight: "600" }}>
              {perimeter.latitude || "Not set"}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Longitude</p>
            <p style={{ fontWeight: "600" }}>
              {perimeter.longitude || "Not set"}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Radius</p>
            <p style={{ fontWeight: "600" }}>
              {perimeter.radius ? `${perimeter.radius}m` : "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
