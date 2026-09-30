import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Investigations() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvestigations = async () => {
      try {
        const response = await api.get("/investigations");

        setInvestigations(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load investigations"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvestigations();
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading investigations...
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
        <h1>Investigations</h1>

        <p>
          Review and track investigations associated
          with indicators of compromise.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Investigation Queue</h2>

        {investigations.length === 0 ? (
          <p>No investigations found.</p>
        ) : (
          <div className="distribution-list">
            {investigations.map((investigation) => (
              <div
                key={investigation._id}
                className="distribution-item"
              >
                <strong>
                  {investigation.title}
                </strong>

                <div>
                  Priority: {investigation.priority}
                </div>

                <div>
                  Status: {investigation.status}
                </div>

                <div>
                  IOC:{" "}
                  {investigation.iocId?.value ||
                    "Unknown IOC"}
                </div>

                <Link
                  to={`/investigations/${investigation._id}`}
                >
                  View Investigation
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Investigations;