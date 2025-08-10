'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import DemoHelper from "./DemoHelper";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = login(username, password);
      if (user.role === "manager") {
        router.push("/manager");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DemoHelper />
      <div className="auth-container">
        <div className="text-center mb-4">
          <h1 className="card-title">Healthcare Shift Tracker</h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center">
            <p style={{ color: "#6b7280" }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
