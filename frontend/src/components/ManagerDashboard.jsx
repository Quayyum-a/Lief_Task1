import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shiftsAPI } from '../services/api';
import Navigation from './Navigation';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allShifts, currentShifts] = await Promise.all([
        shiftsAPI.getAllShifts(),
        shiftsAPI.getActiveShifts()
      ]);
      
      setShifts(allShifts.shifts || []);
      setActiveShifts(currentShifts.shifts || []);
    } catch (error) {
      console.error('Failed to load manager data:', error);
      // Fallback to localStorage
      const localShifts = JSON.parse(localStorage.getItem('shifts') || '[]');
      setShifts(localShifts);
      setActiveShifts(localShifts.filter(s => !s.clockOutTime));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString();
  };

  const calculateStats = () => {
    const today = new Date();
    const todayShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.clockInTime);
      return shiftDate.toDateString() === today.toDateString();
    });

    const totalHours = shifts.reduce((total, shift) => {
      if (shift.clockOutTime) {
        const duration = new Date(shift.clockOutTime) - new Date(shift.clockInTime);
        return total + (duration / (1000 * 60 * 60));
      }
      return total;
    }, 0);

    return {
      activeShifts: activeShifts.length,
      todayShifts: todayShifts.length,
      totalHours: Math.round(totalHours),
      totalShifts: shifts.length
    };
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

  const stats = calculateStats();

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Manager Dashboard</h2>
            <p style={{ color: '#6b7280', marginTop: '5px' }}>
              Overview of staff shifts and activities
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-2 mb-4">
            <div className="stats-card">
              <div className="stats-number">{stats.activeShifts}</div>
              <div className="stats-label">Currently Active</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{stats.todayShifts}</div>
              <div className="stats-label">Today's Shifts</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{stats.totalHours}</div>
              <div className="stats-label">Total Hours</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{stats.totalShifts}</div>
              <div className="stats-label">Total Shifts</div>
            </div>
          </div>
        </div>

        {/* Active Shifts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Currently Active Shifts</h3>
          </div>
          {activeShifts.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No active shifts at the moment.</p>
          ) : (
            <div className="table">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Clock In Time</th>
                    <th>Duration</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {activeShifts.map((shift) => {
                    const duration = Math.round((new Date() - new Date(shift.clockInTime)) / (1000 * 60 * 60 * 100)) / 10;
                    return (
                      <tr key={shift.id}>
                        <td style={{ fontWeight: '600' }}>{shift.username}</td>
                        <td>{formatTime(shift.clockInTime)}</td>
                        <td>{duration}h</td>
                        <td>{shift.clockInNote || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Shifts */}
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
                    <th>Staff Member</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.slice(0, 20).map((shift) => {
                    const duration = shift.clockOutTime 
                      ? Math.round((new Date(shift.clockOutTime) - new Date(shift.clockInTime)) / (1000 * 60 * 60 * 100)) / 10
                      : 'Active';
                    return (
                      <tr key={shift.id}>
                        <td style={{ fontWeight: '600' }}>{shift.username}</td>
                        <td>{new Date(shift.clockInTime).toLocaleDateString()}</td>
                        <td>{new Date(shift.clockInTime).toLocaleTimeString()}</td>
                        <td>
                          {shift.clockOutTime 
                            ? new Date(shift.clockOutTime).toLocaleTimeString()
                            : '-'
                          }
                        </td>
                        <td>{duration}{duration !== 'Active' ? 'h' : ''}</td>
                        <td>
                          <span className={`status-badge ${shift.clockOutTime ? 'status-clocked-out' : 'status-clocked-in'}`}>
                            {shift.clockOutTime ? 'Completed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
