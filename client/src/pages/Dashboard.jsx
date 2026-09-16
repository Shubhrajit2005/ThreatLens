import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [status, setStatus] = useState("Checking API...");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await api.get("/health");

        setStatus(response.data.message);
      } catch (error) {
        setStatus("API connection failed");
      }
    };

    checkApi();
  }, []);

  return (
    <div>
      <h1>ThreatLens Dashboard</h1>

      <p>
        Threat Intelligence Aggregation & IOC Investigation Platform
      </p>

      <p>Backend Status: {status}</p>
    </div>
  );
}

export default Dashboard;