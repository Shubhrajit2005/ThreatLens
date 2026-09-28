import "dotenv/config";

const BASE_URL = "http://localhost:5000";

const test = async () => {
  console.log("Testing Dashboard API...\n");

  // Login
  const loginResponse = await fetch(
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "iocanalyst",
        password: "ThreatLens@123",
      }),
    }
  );

  const loginData = await loginResponse.json();

  if (!loginResponse.ok || !loginData.success) {
    throw new Error("Login failed");
  }

  const token = loginData.token;

  console.log("PASS: Analyst login successful");

  // Dashboard overview
  const dashboardResponse = await fetch(
    `${BASE_URL}/api/dashboard/overview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const dashboardData = await dashboardResponse.json();

  if (!dashboardResponse.ok || !dashboardData.success) {
    throw new Error("Dashboard overview request failed");
  }

  console.log("PASS: Dashboard overview returned successfully");

  const dashboard = dashboardData.dashboard;

  // Required fields
  const requiredFields = [
    "totalIOCs",
    "statusDistribution",
    "riskDistribution",
    "typeDistribution",
    "feedStatistics",
    "recentIOCs",
    "recentInvestigations",
  ];

  for (const field of requiredFields) {
    if (!(field in dashboard)) {
      throw new Error(
        `Dashboard field missing: ${field}`
      );
    }

    console.log(`PASS: ${field} present`);
  }

  // Basic data validation
  if (typeof dashboard.totalIOCs !== "number") {
    throw new Error("totalIOCs is not a number");
  }

  if (!Array.isArray(dashboard.statusDistribution)) {
    throw new Error("statusDistribution is not an array");
  }

  if (!Array.isArray(dashboard.riskDistribution)) {
    throw new Error("riskDistribution is not an array");
  }

  if (!Array.isArray(dashboard.typeDistribution)) {
    throw new Error("typeDistribution is not an array");
  }

  if (!Array.isArray(dashboard.feedStatistics)) {
    throw new Error("feedStatistics is not an array");
  }

  if (!Array.isArray(dashboard.recentIOCs)) {
    throw new Error("recentIOCs is not an array");
  }

  if (!Array.isArray(dashboard.recentInvestigations)) {
    throw new Error(
      "recentInvestigations is not an array"
    );
  }

  console.log("PASS: Dashboard data structure is valid");

  console.log("\nDashboard API test completed successfully.");
};

test().catch((error) => {
  console.error("\nFAIL:", error.message);
  process.exit(1);
});