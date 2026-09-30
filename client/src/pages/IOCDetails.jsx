import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function IOCDetails() {
  const { id } = useParams();

  const [ioc, setIOC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadIOC = async () => {
      try {
        const response = await api.get(`/iocs/${id}`);

        setIOC(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load IOC details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadIOC();
  }, [id]);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading IOC details...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <p className="error-message">{error}</p>

        <p>
          <Link to="/iocs">Back to IOC Explorer</Link>
        </p>
      </main>
    );
  }

  if (!ioc) {
    return (
      <main className="main-content">
        <p>No IOC data available.</p>

        <Link to="/iocs">Back to IOC Explorer</Link>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>IOC Details</h1>

        <p>
          Detailed threat intelligence information for
          this indicator.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Indicator</h2>

        <p>
          <strong>Value:</strong> {ioc.value}
        </p>

        <p>
          <strong>Type:</strong> {ioc.type}
        </p>

        <p>
          <strong>Normalized Value:</strong>{" "}
          {ioc.normalizedValue}
        </p>

        <p>
          <strong>Status:</strong> {ioc.status}
        </p>
      </section>

      <section className="dashboard-card">
        <h2>Risk Assessment</h2>

        <p>
          <strong>Risk Score:</strong>{" "}
          {ioc.risk?.score ?? "N/A"}
        </p>

        <p>
          <strong>Risk Level:</strong>{" "}
          {ioc.risk?.level || "N/A"}
        </p>

        <p>
          <strong>Confidence:</strong>{" "}
          {ioc.confidence ?? "N/A"}
        </p>
      </section>

      <section className="dashboard-card">
        <h2>Sources</h2>

        {ioc.sources?.length ? (
          <div className="distribution-list">
            {ioc.sources.map((source, index) => (
              <div
                className="distribution-item"
                key={`${source.name}-${index}`}
              >
                {source.name || "Unknown Source"}
              </div>
            ))}
          </div>
        ) : (
          <p>No source information available.</p>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Enrichment</h2>

        <p>
          <strong>Country:</strong>{" "}
          {ioc.enrichment?.country || "N/A"}
        </p>

        <p>
          <strong>ASN:</strong>{" "}
          {ioc.enrichment?.asn || "N/A"}
        </p>

        <p>
          <strong>Organization:</strong>{" "}
          {ioc.enrichment?.organization || "N/A"}
        </p>

        <p>
          <strong>Malware Family:</strong>{" "}
          {ioc.enrichment?.malwareFamily || "N/A"}
        </p>

        <p>
          <strong>Reputation:</strong>{" "}
          {ioc.enrichment?.reputation ?? "N/A"}
        </p>
      </section>

      <p>
        <Link to="/iocs">← Back to IOC Explorer</Link>
      </p>
    </main>
  );
}

export default IOCDetails;