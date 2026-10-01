import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function InvestigationDetails() {
  const { id } = useParams();

  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvestigation = async () => {
      try {
        const response = await api.get(
          `/investigations/${id}`
        );

        setInvestigation(response.data.investigation);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load investigation"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvestigation();
  }, [id]);

  if (loading) {
    return (
      <main className="main-content">
        <p className="loading-message">
          Loading investigation...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <p className="error-message">{error}</p>

        <p>
          <Link to="/investigations">
            Back to Investigations
          </Link>
        </p>
      </main>
    );
  }

  if (!investigation) {
    return (
      <main className="main-content">
        <p>No investigation data available.</p>

        <Link to="/investigations">
          Back to Investigations
        </Link>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page-header">
        <h1>Investigation Details</h1>

        <p>
          Review the investigation and its associated
          threat intelligence.
        </p>
      </div>

      <section className="dashboard-card">
        <h2>Investigation</h2>

        <p>
          <strong>Title:</strong>{" "}
          {investigation.title}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {investigation.status}
        </p>

        <p>
          <strong>Priority:</strong>{" "}
          {investigation.priority}
        </p>
      </section>

      <section className="dashboard-card">
        <h2>Associated IOC</h2>

        {investigation.iocId ? (
          <>
            <p>
              <strong>Value:</strong>{" "}
              {investigation.iocId.value ||
                "Unknown"}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {investigation.iocId.type ||
                "Unknown"}
            </p>

            <p>
              <strong>Risk Level:</strong>{" "}
              {investigation.iocId.risk?.level ||
                "N/A"}
            </p>

            <p>
              <Link
                to={`/iocs/${investigation.iocId._id}`}
              >
                View IOC
              </Link>
            </p>
          </>
        ) : (
          <p>No IOC information available.</p>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Notes</h2>

        {!investigation.notes?.length ? (
          <p>No investigation notes.</p>
        ) : (
          <div className="distribution-list">
            {investigation.notes.map((note) => (
              <div
                key={note._id}
                className="distribution-item"
              >
                <div>
                  <strong>Note</strong>
                </div>

                <p>{note.text}</p>

                <small>
                  {note.createdAt
                    ? new Date(
                        note.createdAt
                      ).toLocaleString()
                    : ""}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

      <p>
        <Link to="/investigations">
          ← Back to Investigations
        </Link>
      </p>
    </main>
  );
}

export default InvestigationDetails;