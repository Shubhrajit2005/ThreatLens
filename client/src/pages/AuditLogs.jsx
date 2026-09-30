import { useEffect, useState } from "react";
import api from "../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const response = await api.get("/audit-logs");

        setLogs(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load audit logs"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading audit logs...
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
        <h1>Audit Logs</h1>

        <p>
          Review security and investigation activity
          recorded by ThreatLens.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Activity Log</h2>

        {logs.length === 0 ? (
          <p>No audit logs found.</p>
        ) : (
          <div className="distribution-list">
            {logs.map((log) => (
              <div
                key={log._id}
                className="distribution-item"
              >
                <strong>{log.action}</strong>

                <div>
                  Resource: {log.resourceType}
                </div>

                <div>
                  User:{" "}
                  {log.userId?.name ||
                    log.userId?.email ||
                    "Unknown"}
                </div>

                <div>
                  Timestamp:{" "}
                  {log.timestamp
                    ? new Date(
                        log.timestamp
                      ).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AuditLogs;