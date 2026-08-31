import React from "react";
import { Link } from "react-router-dom";

export const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="glass-panel auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "5rem", color: "#ff1744", marginBottom: "1rem" }}>
          ⚠️
        </div>
        <h1 style={{ fontFamily: "var(--font-title)", fontSize: "2rem", marginBottom: "1rem", color: "#fff" }}>
          Access Denied
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          You do not have the required permissions to view this page.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
