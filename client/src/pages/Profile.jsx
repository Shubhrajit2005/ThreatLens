import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading profile...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Profile</h1>

        <p>
          View your ThreatLens account information.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Account Information</h2>

        <p>
          <strong>Name:</strong>{" "}
          {user?.name || "N/A"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email || "N/A"}
        </p>

        <p>
          <strong>Username:</strong>{" "}
          {user?.username || "N/A"}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.role || "N/A"}
        </p>
      </section>
    </main>
  );
}

export default Profile;