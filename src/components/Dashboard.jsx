import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ShiftService, LocationService } from "../services/shiftService";
import Navigation from "./Navigation";
import ClockInOut from "./ClockInOut";
import ShiftHistory from "./ShiftHistory";

export default function Dashboard() {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user) {
      try {
        const current = await ShiftService.getCurrentShift(user.id);
        const userShifts = await ShiftService.getShiftsByUser(user.id);
        setCurrentShift(current);
        setShifts(
          userShifts.sort(
            (a, b) => new Date(b.clockInTime) - new Date(a.clockInTime)
          )
        );
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
    setLoading(false);
  };

  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation);
  };

  const handleShiftUpdate = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ marginTop: "50px" }}>
          <p>Loading...</p>
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
            <h2 className="card-title">Welcome, {user.username}</h2>
            <p style={{ color: "#6b7280", marginTop: "5px" }}>
              {currentShift
                ? "Currently clocked in"
                : "Ready to start your shift"}
            </p>
          </div>

          <ClockInOut
            currentShift={currentShift}
            user={user}
            location={location}
            onLocationUpdate={handleLocationUpdate}
            onShiftUpdate={handleShiftUpdate}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Shift History</h3>
          </div>
          <ShiftHistory shifts={shifts} />
        </div>
      </div>
    </>
  );
}
