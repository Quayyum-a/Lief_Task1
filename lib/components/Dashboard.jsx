'use client'

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ShiftService, LocationService } from "../services/shiftService";
import Navigation from "./Navigation";
import ClockInOut from "./ClockInOut";
import ShiftHistory from "./ShiftHistory";
import PullToRefresh from "./PullToRefresh";
import { LoadingSpinner, SkeletonCard, NetworkStatus } from "./LoadingStates";
import StatusBar from "./StatusBar";

export default function Dashboard() {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [locationStatus, setLocationStatus] = useState('unknown');
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  useEffect(() => {
    loadData();
    
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial network status
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadData = async () => {
    if (user) {
      try {
        const current = await ShiftService.getActiveShift(user.id);
        const userShifts = await ShiftService.getUserShifts(user.id);
        setCurrentShift(current);
        setShifts(
          userShifts.sort(
            (a, b) => new Date(b.clockInTime) - new Date(a.clockInTime)
          )
        );
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    }
    setLoading(false);
  };

  const handleLocationUpdate = (newLocation, status = 'success', accuracy = null) => {
    setLocation(newLocation);
    setLocationStatus(status);
    setLocationAccuracy(accuracy);
  };

  const handleShiftUpdate = () => {
    loadData();
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <PullToRefresh onRefresh={loadData}>
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Welcome, {user?.username}</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "5px" }}>
                {currentShift
                  ? "Currently clocked in"
                  : "Ready to start your shift"}
              </p>
            </div>

            <StatusBar
              locationStatus={locationStatus}
              locationAccuracy={locationAccuracy}
              isOnline={isOnline}
            />

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
      </PullToRefresh>
    </>
  );
}
