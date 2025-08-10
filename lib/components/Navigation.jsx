'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, Users, Clock } from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="nav-brand">
          <Clock size={24} style={{ marginRight: "8px", display: "inline" }} />
          Shift Tracker
        </div>

        <div className="nav-user">
          <span style={{ color: "#6b7280" }}>
            {user?.username} ({user?.role?.replace("_", " ")})
          </span>

          {user?.role === "manager" && (
            <Link
              href="/manager"
              className="btn btn-outline"
              style={{ padding: "8px 16px" }}
            >
              <Users size={16} style={{ marginRight: "4px" }} />
              Manager View
            </Link>
          )}

          {user?.role === "care_worker" && (
            <Link
              href="/dashboard"
              className="btn btn-outline"
              style={{ padding: "8px 16px" }}
            >
              <Clock size={16} style={{ marginRight: "4px" }} />
              My Shifts
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: "8px 16px" }}
          >
            <LogOut size={16} style={{ marginRight: "4px" }} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
