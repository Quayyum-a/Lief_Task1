'use client'

import React, { useState, useEffect } from "react";
import { BarChart3, Users, Clock, TrendingUp } from "lucide-react";

export default function Analytics({
  shifts,
  activeShifts,
  users,
  onDataUpdate,
}) {
  const [analytics, setAnalytics] = useState({
    avgHoursPerDay: 0,
    peoplePerDay: 0,
    totalActiveStaff: 0,
    weeklyStats: [],
  });

  useEffect(() => {
    calculateAnalytics();
  }, [shifts, activeShifts, users]);

  const calculateAnalytics = () => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    // Get shifts from last week
    const weeklyShifts = shifts.filter(
      (s) => new Date(s.clockInTime) >= oneWeekAgo
    );
    const completedWeeklyShifts = weeklyShifts.filter((s) => s.clockOutTime);

    // Calculate average hours per day
    const totalHours = completedWeeklyShifts.reduce((total, shift) => {
      const duration =
        new Date(shift.clockOutTime) - new Date(shift.clockInTime);
      return total + duration;
    }, 0);

    const avgHoursPerDay = totalHours / (7 * 1000 * 60 * 60); // Convert to hours and divide by 7 days

    // Calculate average people clocking in per day
    const dailyClockIns = {};
    weeklyShifts.forEach((shift) => {
      const date = new Date(shift.clockInTime).toDateString();
      dailyClockIns[date] = (dailyClockIns[date] || 0) + 1;
    });

    const peoplePerDay =
      Object.values(dailyClockIns).reduce((a, b) => a + b, 0) / 7;

    // Calculate staff weekly stats
    const weeklyStats = users
      .map((user) => {
        const userShifts = weeklyShifts.filter((s) => s.userId === user.id);
        const completedUserShifts = userShifts.filter((s) => s.clockOutTime);

        const userTotalHours = completedUserShifts.reduce((total, shift) => {
          const duration =
            new Date(shift.clockOutTime) - new Date(shift.clockInTime);
          return total + duration;
        }, 0);

        return {
          userId: user.id,
          username: user.username,
          totalHours: userTotalHours / (1000 * 60 * 60), // Convert to hours
          totalShifts: userShifts.length,
          completedShifts: completedUserShifts.length,
          isActive: activeShifts.some((s) => s.userId === user.id),
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);

    setAnalytics({
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      peoplePerDay: Math.round(peoplePerDay * 10) / 10,
      totalActiveStaff: activeShifts.length,
      weeklyStats,
    });
  };

  const getDailyStats = () => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateString = date.toDateString();

      const dayShifts = shifts.filter(
        (s) => new Date(s.clockInTime).toDateString() === dateString
      );

      const completedDayShifts = dayShifts.filter((s) => s.clockOutTime);
      const totalHours =
        completedDayShifts.reduce((total, shift) => {
          const duration =
            new Date(shift.clockOutTime) - new Date(shift.clockInTime);
          return total + duration;
        }, 0) /
        (1000 * 60 * 60);

      days.push({
        date: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        clockIns: dayShifts.length,
        totalHours: Math.round(totalHours * 10) / 10,
      });
    }

    return days;
  };

  const dailyStats = getDailyStats();
  const maxClockIns = Math.max(...dailyStats.map((d) => d.clockIns), 1);
  const maxHours = Math.max(...dailyStats.map((d) => d.totalHours), 1);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <BarChart3 size={24} />
        <div>
          <h3 className="card-title">Analytics Overview</h3>
          <p style={{ color: "#6b7280", marginTop: "5px" }}>
            Performance metrics for the last 7 days
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-3" style={{ marginBottom: "30px" }}>
        <div className="stats-card">
          <div className="stats-number">{analytics.avgHoursPerDay}</div>
          <div className="stats-label">Avg Hours/Day</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{analytics.peoplePerDay}</div>
          <div className="stats-label">Avg Clock-ins/Day</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{analytics.totalActiveStaff}</div>
          <div className="stats-label">Currently Active</div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h4 style={{ marginBottom: "20px" }}>Daily Activity (Last 7 Days)</h4>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: "15px",
            height: "200px",
            padding: "20px 0",
          }}
        >
          {dailyStats.map((day, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "150px",
                  gap: "5px",
                }}
              >
                {/* Hours bar */}
                <div
                  style={{
                    width: "20px",
                    height: `${(day.totalHours / maxHours) * 70}px`,
                    backgroundColor: "#3b82f6",
                    borderRadius: "4px 4px 0 0",
                    minHeight: "2px",
                  }}
                  title={`${day.totalHours}h total`}
                />

                {/* Clock-ins bar */}
                <div
                  style={{
                    width: "20px",
                    height: `${(day.clockIns / maxClockIns) * 70}px`,
                    backgroundColor: "#10b981",
                    borderRadius: "4px 4px 0 0",
                    minHeight: "2px",
                  }}
                  title={`${day.clockIns} clock-ins`}
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600" }}>
                  {day.date}
                </p>
                <p style={{ fontSize: "10px", color: "#6b7280" }}>
                  {day.clockIns} / {day.totalHours}h
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#10b981",
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              Clock-ins
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#3b82f6",
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              Total Hours
            </span>
          </div>
        </div>
      </div>

      {/* Staff Leaderboard */}
      <div className="card">
        <h4 style={{ marginBottom: "20px" }}>
          Staff Performance (Last 7 Days)
        </h4>
        {analytics.weeklyStats.length === 0 ? (
          <div
            className="text-center"
            style={{ padding: "40px", color: "#6b7280" }}
          >
            <Users size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <p>No shift data available</p>
            <p style={{ fontSize: "14px" }}>
              Staff performance will appear here once shifts are recorded
            </p>
          </div>
        ) : (
          <div>
            {analytics.weeklyStats.map((staff, index) => (
              <div
                key={staff.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px",
                  backgroundColor: index < 3 ? "#f9fafb" : "transparent",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === 0
                          ? "#fbbf24"
                          : index === 1
                          ? "#9ca3af"
                          : index === 2
                          ? "#cd7c2f"
                          : "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "600",
                      color: "white",
                      fontSize: "14px",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600" }}>
                      {staff.username}
                      {staff.isActive && (
                        <span
                          className="status-badge status-clocked-in"
                          style={{ marginLeft: "8px", fontSize: "10px" }}
                        >
                          Active
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                      {staff.completedShifts} completed shifts
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p style={{ fontWeight: "600", color: "#3b82f6" }}>
                    {Math.round(staff.totalHours * 10) / 10}h
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    {staff.totalShifts} total shifts
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
