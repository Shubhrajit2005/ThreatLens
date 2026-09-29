import "dotenv/config";
import User from "../src/models/User.js";
import { hashPassword } from "../src/utils/password.js";
import connectDatabase from "../src/config/database.js";

const BASE_URL = "http://localhost:5000";

const test = async () => {
  console.log("Testing Audit Log API...\n");

  await connectDatabase();

  // =========================================================
  // CREATE TEMPORARY ADMIN
  // =========================================================

  const timestamp = Date.now();

  const adminUsername = `auditAdmin${timestamp}`;
  const adminEmail = `${adminUsername}@example.com`;
  const adminPassword = "AdminPassword123";

  await User.create({
    username: adminUsername,
    email: adminEmail,
    passwordHash: await hashPassword(adminPassword),
    role: "admin",
  });

  console.log("PASS: Temporary admin created");

  // =========================================================
  // ADMIN LOGIN
  // =========================================================

  const adminLoginResponse = await fetch(
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: adminUsername,
        password: adminPassword,
      }),
    }
  );

  const adminLoginData = await adminLoginResponse.json();

  if (!adminLoginResponse.ok || !adminLoginData.success) {
    throw new Error("Admin login failed");
  }

  const adminToken = adminLoginData.token;

  console.log("PASS: Admin login successful");

  // =========================================================
  // ADMIN CAN VIEW AUDIT LOGS
  // =========================================================

  const auditResponse = await fetch(
    `${BASE_URL}/api/audit-logs`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }
  );

  const auditData = await auditResponse.json();

  if (!auditResponse.ok || !auditData.success) {
    throw new Error("Audit log request failed");
  }

  console.log("PASS: Admin can retrieve audit logs");

  // =========================================================
  // RESPONSE STRUCTURE
  // =========================================================

  if (typeof auditData.count !== "number") {
    throw new Error("Audit log count is not a number");
  }

  console.log("PASS: Audit log count is valid");

  if (!Array.isArray(auditData.data)) {
    throw new Error("Audit log data is not an array");
  }

  console.log("PASS: Audit log data is an array");

  // =========================================================
  // AUDIT LOG STRUCTURE
  // =========================================================

  if (auditData.data.length > 0) {
    const log = auditData.data[0];

    const requiredFields = [
      "userId",
      "action",
      "resourceType",
      "timestamp",
    ];

    for (const field of requiredFields) {
      if (!(field in log)) {
        throw new Error(
          `Audit log field missing: ${field}`
        );
      }

      console.log(`PASS: Audit log field '${field}' present`);
    }
  } else {
    console.log(
      "PASS: Audit log endpoint returned successfully with no records"
    );
  }

  // =========================================================
  // ANALYST LOGIN
  // =========================================================

  const analystLoginResponse = await fetch(
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

  const analystLoginData = await analystLoginResponse.json();

  if (!analystLoginResponse.ok || !analystLoginData.success) {
    throw new Error("Analyst login failed");
  }

  const analystToken = analystLoginData.token;

  console.log("PASS: Analyst login successful");

  // =========================================================
  // ANALYST RBAC
  // =========================================================

  const analystAuditResponse = await fetch(
    `${BASE_URL}/api/audit-logs`,
    {
      headers: {
        Authorization: `Bearer ${analystToken}`,
      },
    }
  );

  if (analystAuditResponse.status === 403) {
    console.log(
      "PASS: Analyst cannot access audit logs"
    );
  } else {
    throw new Error(
      `Expected analyst 403, received ${analystAuditResponse.status}`
    );
  }

  // =========================================================
  // VIEWER LOGIN
  // =========================================================

  const viewerLoginResponse = await fetch(
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "iocviewer",
        password: "ThreatLens@123",
      }),
    }
  );

  const viewerLoginData = await viewerLoginResponse.json();

  if (!viewerLoginResponse.ok || !viewerLoginData.success) {
    throw new Error("Viewer login failed");
  }

  const viewerToken = viewerLoginData.token;

  console.log("PASS: Viewer login successful");

  // =========================================================
  // VIEWER RBAC
  // =========================================================

  const viewerAuditResponse = await fetch(
    `${BASE_URL}/api/audit-logs`,
    {
      headers: {
        Authorization: `Bearer ${viewerToken}`,
      },
    }
  );

  if (viewerAuditResponse.status === 403) {
    console.log(
      "PASS: Viewer cannot access audit logs"
    );
  } else {
    throw new Error(
      `Expected viewer 403, received ${viewerAuditResponse.status}`
    );
  }

  // =========================================================
  // UNAUTHENTICATED REQUEST
  // =========================================================

  const unauthenticatedResponse = await fetch(
    `${BASE_URL}/api/audit-logs`
  );

  if (unauthenticatedResponse.status === 401) {
    console.log(
      "PASS: Unauthenticated audit log request rejected"
    );
  } else {
    throw new Error(
      `Expected unauthenticated 401, received ${unauthenticatedResponse.status}`
    );
  }

  await User.deleteOne({
  username: adminUsername,
});

console.log("PASS: Temporary admin cleaned up");

  console.log(
    "\nAudit Log API test completed successfully."
  );
};

test().catch((error) => {
  console.error("\nFAIL:", error.message);
  process.exit(1);
});