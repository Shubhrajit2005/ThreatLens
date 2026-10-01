import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Investigations() {
  const [investigations, setInvestigations] = useState([]);
  const [iocs, setIOCs] = useState([]);

  const [title, setTitle] = useState("");
  const [iocId, setIocId] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [investigationResponse, iocResponse] =
          await Promise.all([
            api.get("/investigations"),
            api.get("/iocs"),
          ]);

        setInvestigations(
          investigationResponse.data.investigations || []
        );

        setIOCs(iocResponse.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load investigation data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateInvestigation = async (event) => {
    event.preventDefault();

    setCreateError("");
    setSuccess("");
    setCreating(true);

    try {
      const response = await api.post("/investigations", {
        title,
        iocId,
        priority,
      });

      const newInvestigation =
        response.data.investigation;

      setInvestigations((current) => [
        newInvestigation,
        ...current,
      ]);

      setTitle("");
      setIocId("");
      setPriority("medium");

      setSuccess(
        "Investigation created successfully."
      );
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
          "Failed to create investigation"
      );
    } finally {
      setCreating(false);
    }
  };

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
        <h2>Create Investigation</h2>

        <form
          className="investigation-form"
          onSubmit={handleCreateInvestigation}
        >
          <div className="form-group">
            <label htmlFor="investigation-title">
              Investigation Title
            </label>

            <input
              id="investigation-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter investigation title"
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="investigation-ioc">
              IOC
            </label>

            <select
              id="investigation-ioc"
              value={iocId}
              onChange={(event) =>
                setIocId(event.target.value)
              }
              required
            >
              <option value="">
                Select an IOC
              </option>

              {iocs.map((ioc) => (
                <option
                  key={ioc._id}
                  value={ioc._id}
                >
                  {ioc.value} ({ioc.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="investigation-priority">
              Priority
            </label>

            <select
              id="investigation-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">
                Critical
              </option>
            </select>
          </div>

          {createError && (
            <div className="error-message">
              {createError}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={creating || iocs.length === 0}
          >
            {creating
              ? "Creating..."
              : "Create Investigation"}
          </button>

          {iocs.length === 0 && (
            <p className="empty-message">
              No IOCs are available for investigation.
            </p>
          )}
        </form>
      </section>

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