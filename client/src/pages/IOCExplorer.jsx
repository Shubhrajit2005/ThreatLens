import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function IOCExplorer() {
  const [iocs, setIOCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIOCs = async () => {
      try {
        const response = await api.get("/iocs");

        setIOCs(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load IOCs"
        );
      } finally {
        setLoading(false);
      }
    };

    loadIOCs();
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading IOCs...
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
        <h1>IOC Explorer</h1>

        <p>
          Search and investigate indicators of
          compromise collected by ThreatLens.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Indicators of Compromise</h2>

        {iocs.length === 0 ? (
          <p>No IOCs found.</p>
        ) : (
          <div>
            {iocs.map((ioc) => (
              <div
                key={ioc._id}
                className="distribution-item"
              >
                <strong>{ioc.value}</strong>

                <div>
                  Type: {ioc.type}
                </div>

                <div>
                  Risk: {ioc.risk?.level || "low"}
                </div>

                <div>
                  Confidence: {ioc.confidence}
                </div>

                <div>
                  Status: {ioc.status}
                </div>

                <Link to={`/iocs/${ioc._id}`}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default IOCExplorer;