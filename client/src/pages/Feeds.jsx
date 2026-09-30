import { useEffect, useState } from "react";
import api from "../services/api";

function Feeds() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const response = await api.get("/feeds");

        setFeeds(response.data.feeds || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load feeds"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeeds();
  }, []);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading threat feeds...
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
        <h1>Threat Feeds</h1>

        <p>
          Monitor the intelligence sources currently
          supported by ThreatLens.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Available Feeds</h2>

        {feeds.length === 0 ? (
          <p>No feeds available.</p>
        ) : (
          <div className="distribution-list">
            {feeds.map((feed) => (
              <div
                key={feed.name}
                className="distribution-item"
              >
                <strong>{feed.name}</strong>

                <div>
                  Type: {feed.type}
                </div>

                <div>
                  Reliability: {feed.reliability}
                </div>

                <div>
                  Status:{" "}
                  {feed.enabled ? "Enabled" : "Disabled"}
                </div>

                <div>
                  {feed.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Feeds;