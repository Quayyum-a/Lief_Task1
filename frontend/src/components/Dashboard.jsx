import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shiftsAPI, locationUtils } from '../services/api';
import Navigation from './Navigation';
import { Clock, MapPin, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('checking');
  const [withinPerimeter, setWithinPerimeter] = useState(false);

  useEffect(() => {
    loadData();
    checkLocation();
  }, [user]);

  const loadData = async () => {
    if (user) {
      try {
        const current = await shiftsAPI.getCurrentShift(user.id);
        const userShifts = await shiftsAPI.getUserShifts(user.id);
        setCurrentShift(current);
        setShifts(userShifts.sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime)));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to localStorage
        const localShifts = JSON.parse(localStorage.getItem('shifts') || '[]');
        const userLocalShifts = localShifts.filter(s => s.userId === user.id);
        setCurrentShift(userLocalShifts.find(s => !s.clockOutTime) || null);
        setShifts(userLocalShifts.sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime)));
      }
    }
    setLoading(false);
  };

  const checkLocation = async () => {
    setLocationStatus('checking');
    setError('');

    try {
      const position = await locationUtils.getCurrentPosition();
      setLocation(position);

      const isWithin = await locationUtils.isWithinPerimeter(
        position.latitude,
        position.longitude
      );
      setWithinPerimeter(isWithin);
      setLocationStatus('ready');
    } catch (err) {
      setError(`Location error: ${err.message}`);
      setLocationStatus('error');
    }
  };

  const handleClockIn = async () => {
    if (!withinPerimeter) {
      setError('You must be within the designated work area to clock in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const position = await locationUtils.getCurrentPosition();
      await shiftsAPI.clockIn(user.id, user.username, position, note.trim() || null);
      setNote('');
      loadData();
    } catch (err) {
      setError(`Failed to clock in: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentShift) return;

    setLoading(true);
    setError('');

    try {
      const position = await locationUtils.getCurrentPosition();
      await shiftsAPI.clockOut(user.id, position, note.trim() || null);
      setNote('');
      loadData();
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

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ marginTop: '50px' }}>
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
            <h2 className="card-title">Welcome, {user?.username}</h2>
            <p style={{ color: '#6b7280', marginTop: '5px' }}>
              {currentShift ? 'Currently clocked in' : 'Ready to start your shift'}
            </p>
          </div>

          {/* Location Status */}
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <MapPin size={20} />
              <div>
                <p style={{ fontWeight: '600' }}>Location Status</p>
                {locationStatus === 'checking' && (
                  <p style={{ color: '#6b7280' }}>Checking your location...</p>
                )}
                {locationStatus === 'ready' && (
                  <p style={{ color: withinPerimeter ? '#10b981' : '#ef4444' }}>
                    {withinPerimeter ? 'Within work area' : 'Outside work area'}
                  </p>
                )}
                {locationStatus === 'error' && (
                  <p style={{ color: '#ef4444' }}>Location unavailable</p>
                )}
              </div>
              <button
                onClick={checkLocation}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '14px' }}
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
                background: '#dcfce7',
                border: '1px solid #10b981',
                marginBottom: '20px',
              }}
            >
              <h4 style={{ color: '#166534', marginBottom: '10px' }}>
                Currently Clocked In
              </h4>
              <p>
                <strong>Clock In Time:</strong> {formatTime(currentShift.clockInTime)}
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
                background: '#fef2f2',
                border: '1px solid #ef4444',
                marginBottom: '20px',
              }}
            >
              <div className="flex items-center gap-4">
                <AlertCircle size={20} style={{ color: '#ef4444' }} />
                <p style={{ color: '#dc2626' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="form-group mb-4">
            <label className="form-label">
              {currentShift ? 'Clock Out Note (Optional)' : 'Clock In Note (Optional)'}
            </label>
            <textarea
              className="form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                currentShift
                  ? 'Add a note about your shift end...'
                  : 'Add a note about your shift start...'
              }
              maxLength={500}
            />
          </div>

          {/* Clock In/Out Button */}
          <div className="flex gap-4">
            {!currentShift ? (
              <button
                onClick={handleClockIn}
                disabled={loading || locationStatus !== 'ready' || !withinPerimeter}
                className="btn btn-success"
                style={{ flex: 1 }}
              >
                <Clock size={16} style={{ marginRight: '8px' }} />
                {loading ? 'Clocking In...' : 'Clock In'}
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                disabled={loading}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                <Clock size={16} style={{ marginRight: '8px' }} />
                {loading ? 'Clocking Out...' : 'Clock Out'}
              </button>
            )}
          </div>
        </div>

        {/* Shift History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Shifts</h3>
          </div>
          {shifts.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No shifts recorded yet.</p>
          ) : (
            <div className="table">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.slice(0, 10).map((shift) => (
                    <tr key={shift.id}>
                      <td>{new Date(shift.clockInTime).toLocaleDateString()}</td>
                      <td>{new Date(shift.clockInTime).toLocaleTimeString()}</td>
                      <td>
                        {shift.clockOutTime
                          ? new Date(shift.clockOutTime).toLocaleTimeString()
                          : 'Active'}
                      </td>
                      <td>
                        {shift.clockOutTime
                          ? Math.round(
                              (new Date(shift.clockOutTime) - new Date(shift.clockInTime)) /
                                (1000 * 60 * 60)
                            ) + 'h'
                          : calculateShiftDuration()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
