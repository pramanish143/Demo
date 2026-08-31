import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("USER");

  const fetchUsers = async () => {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`/api/users/${id}`);
      setSuccess("User deleted successfully!");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const openEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name);
    setEditEmail(targetUser.email);
    setEditRole(targetUser.role);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(`/api/users/${editingUser._id}`, {
        name: editName,
        email: editEmail,
        role: editRole,
      });
      setSuccess("User updated successfully!");
      setUsers(users.map((u) => (u._id === editingUser._id ? response.data : u)));
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  // Helper stats for Admin view
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const standardUsers = totalUsers - adminCount;

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          🛡️ RBAC System
        </div>
        <div className="nav-user">
          <span className="user-badge">{user?.role}</span>
          <span style={{ color: "#fff", fontWeight: 500 }}>{user?.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back, {user?.name}. You are logged in as {user?.role}.</p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {user?.role === "ADMIN" ? (
          // ADMIN PANEL
          <div>
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <span className="stat-label">Total Managed Users</span>
                <span className="stat-value">{totalUsers}</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-label">Admin Accounts</span>
                <span className="stat-value">{adminCount}</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-label">Standard Users</span>
                <span className="stat-value">{standardUsers}</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontFamily: "var(--font-title)", color: "#fff" }}>User Management Directory</h3>
                <button className="btn btn-primary btn-sm" onClick={fetchUsers}>
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`role-tag ${u.role.toLowerCase()}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="actions-cell">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openEditModal(u)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(u._id)}
                                disabled={u._id === user?.id} // Don't delete self
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          // USER PANEL
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div className="glass-panel">
              <h3 style={{ fontFamily: "var(--font-title)", color: "#fff", marginBottom: "1.5rem" }}>
                Your Profile Details
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "block" }}>Name</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{user?.name}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "block" }}>Email</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{user?.email}</span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "block" }}>Assigned Role</span>
                  <span className={`role-tag user`} style={{ marginTop: "0.25rem" }}>{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ fontFamily: "var(--font-title)", color: "#fff", marginBottom: "1.5rem" }}>
                System Access Scope
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--panel-border)", paddingBottom: "0.5rem" }}>
                  <span>View Dashboard Statistics</span>
                  <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>Granted</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--panel-border)", paddingBottom: "0.5rem" }}>
                  <span>Update Self Profile</span>
                  <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>Granted</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--panel-border)", paddingBottom: "0.5rem" }}>
                  <span>List / Search Users Database</span>
                  <span style={{ color: "var(--error-color)", fontWeight: "bold" }}>Denied</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
                  <span>Modify Roles / Delete Users</span>
                  <span style={{ color: "var(--error-color)", fontWeight: "bold" }}>Denied</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button
                style={{ background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}
                onClick={() => setEditingUser(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
