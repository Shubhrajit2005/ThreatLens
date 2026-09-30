import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/dashboard/overview");

        setDashboard(response.data.dashboard);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          return;
        }

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [logout]);

  if (loading) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <p className="loading-message">
            Loading ThreatLens dashboard...
          </p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <p className="error-message">{error}</p>
        </main>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <p>No dashboard data available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          ThreatLens
          <span>Threat Intelligence Platform</span>
        </div>

        <div className="topbar-right">
          <span className="user-role">
            {user?.role || "User"}
          </span>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-title">
            Workspace
          </div>

          <NavLink
  to="/"
  end
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  Dashboard
</NavLink>

          <NavLink
  to="/iocs"
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  IOC Explorer
</NavLink>

          <NavLink
  to="/feeds"
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  Feeds
</NavLink>

          <NavLink
  to="/investigations"
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  Investigations
</NavLink>

          {user?.role === "admin" && (
         <NavLink
             to="/audit-logs"
             className="sidebar-link"
         >
          Audit Logs
        </NavLink>
        )}
<NavLink
  to="/profile"
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  Profile
</NavLink>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <h1>Security Dashboard</h1>

            <p>
              Monitor threat intelligence, indicators,
              risk levels, and investigations.
            </p>
          </div>

          <section className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">
                Total IOCs
              </div>

              <div className="stat-value">
                {dashboard.totalIOCs}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                Risk Categories
              </div>

              <div className="stat-value">
                {dashboard.riskDistribution.length}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                Active Feeds
              </div>

              <div className="stat-value">
                {dashboard.feedStatistics.length}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                Recent Investigations
              </div>

              <div className="stat-value">
                {dashboard.recentInvestigations.length}
              </div>
            </div>
          </section>

          <section className="dashboard-card">
            <h2>Risk Distribution</h2>

            <div className="distribution-list">
              {dashboard.riskDistribution.map(
                (item) => (
                  <div
                    className="distribution-item"
                    key={item._id}
                  >
                    {item._id}: {item.count}
                  </div>
                )
              )}
            </div>
          </section>

          <section className="dashboard-card">
            <h2>IOC Types</h2>

            <div className="distribution-list">
              {dashboard.typeDistribution.map(
                (item) => (
                  <div
                    className="distribution-item"
                    key={item._id}
                  >
                    {item._id}: {item.count}
                  </div>
                )
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;