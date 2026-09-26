import env from "../src/config/env.js";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.js";
import IOC from "../src/models/IOC.js";
import { hashPassword } from "../src/utils/password.js";

const PORT = 5050;

const testServer = app.listen(PORT, () => {
  console.log(`Test API running on port ${PORT}`);
});

const request = async (path, options = {}) => {
  const response = await fetch(`http://localhost:${PORT}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
};

const runTest = async () => {
  console.log("\n--- API Security Regression Test Started ---");

  await mongoose.connect(env.mongoUri);

  const timestamp = Date.now();

  const viewerUsername = `apiViewer${timestamp}`;
  const viewerEmail = `${viewerUsername}@example.com`;

  const analystUsername = `apiAnalyst${timestamp}`;
  const analystEmail = `${analystUsername}@example.com`;

  const adminUsername = `apiAdmin${timestamp}`;
  const adminEmail = `${adminUsername}@example.com`;

  let testIOCId = null;

  try {
    // --------------------------------------------------
    // 1. Public registration cannot create admin
    // --------------------------------------------------

    const registerResponse = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: viewerUsername,
        email: viewerEmail,
        password: "TestPassword123",
        role: "admin",
      }),
    });

    if (
      registerResponse.status === 201 &&
      registerResponse.data.user.role === "viewer"
    ) {
      console.log("PASS: Public registration creates viewer");
    } else {
      throw new Error(
        "Public registration role protection failed"
      );
    }

    // --------------------------------------------------
    // 2. Viewer login returns JWT
    // --------------------------------------------------

    const viewerLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: viewerUsername,
        password: "TestPassword123",
      }),
    });

    if (
      viewerLogin.status === 200 &&
      viewerLogin.data.token
    ) {
      console.log("PASS: Viewer login returns JWT");
    } else {
      throw new Error("Viewer login failed");
    }

    const viewerToken = viewerLogin.data.token;

    // --------------------------------------------------
    // 3. /me rejects unauthenticated requests
    // --------------------------------------------------

    const unauthorizedMe = await request("/api/auth/me");

    if (unauthorizedMe.status === 401) {
      console.log(
        "PASS: /me rejects unauthenticated request"
      );
    } else {
      throw new Error(
        "/me authentication check failed"
      );
    }

    // --------------------------------------------------
    // 4. Unauthenticated user cannot list IOCs
    // --------------------------------------------------

    const unauthorizedList = await request("/api/iocs");

    if (unauthorizedList.status === 401) {
      console.log(
        "PASS: Unauthenticated user blocked from IOC list"
      );
    } else {
      throw new Error(
        `Unauthenticated IOC list check failed: ${unauthorizedList.status}`
      );
    }

    // --------------------------------------------------
    // 5. Viewer cannot create IOC
    // --------------------------------------------------

    const viewerCreate = await request("/api/iocs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({
        value: "198.51.100.25",
        type: "ipv4",
        confidence: 50,
      }),
    });

    if (viewerCreate.status === 403) {
      console.log(
        "PASS: Viewer blocked from IOC creation"
      );
    } else {
      throw new Error(
        "Viewer authorization failed"
      );
    }

    // --------------------------------------------------
    // 6. Invalid IOC request is rejected
    // --------------------------------------------------

    const invalidIOC = await request("/api/iocs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({
        value: "not-an-ip",
        type: "ipv4",
      }),
    });

    if (
      invalidIOC.status === 403 ||
      invalidIOC.status === 400
    ) {
      console.log(
        "PASS: Invalid/protected IOC request rejected"
      );
    } else {
      throw new Error(
        "Invalid IOC request was accepted"
      );
    }

    // --------------------------------------------------
    // 7. Create temporary analyst user
    // --------------------------------------------------

    const analystPasswordHash = await hashPassword(
      "AnalystPassword123"
    );

    await User.create({
      username: analystUsername,
      email: analystEmail,
      passwordHash: analystPasswordHash,
      role: "analyst",
    });

    // --------------------------------------------------
    // 8. Analyst login returns JWT
    // --------------------------------------------------

    const analystLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: analystUsername,
        password: "AnalystPassword123",
      }),
    });

    if (
      analystLogin.status === 200 &&
      analystLogin.data.token
    ) {
      console.log("PASS: Analyst login returns JWT");
    } else {
      throw new Error("Analyst login failed");
    }

    const analystToken = analystLogin.data.token;

    // --------------------------------------------------
    // 9. Analyst can create IOC
    // --------------------------------------------------

    const analystCreate = await request("/api/iocs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${analystToken}`,
      },
      body: JSON.stringify({
        value: "198.51.100.25",
        type: "ipv4",
        confidence: 75,
        tags: ["security-test"],
      }),
    });

    if (
      analystCreate.status === 201 &&
      analystCreate.data.data?._id
    ) {
      console.log("PASS: Analyst can create IOC");
      const analystInvalidIOC = await request("/api/iocs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${analystToken}`,
  },
  body: JSON.stringify({
    value: "not-an-ip",
    type: "ipv4",
    confidence: 75,
  }),
});

if (analystInvalidIOC.status === 400) {
  console.log(
    "PASS: Analyst invalid IOC rejected by validation"
  );
} else {
  throw new Error(
    `Analyst validation check failed: ${analystInvalidIOC.status}`
  );
}

      testIOCId = analystCreate.data.data._id;
    } else {
      throw new Error(
        `Analyst IOC creation failed: ${analystCreate.status}`
      );
    }

    // --------------------------------------------------
    // 10. Unauthenticated user cannot view IOC
    // --------------------------------------------------

    const unauthorizedGet = await request(
      `/api/iocs/${testIOCId}`
    );

    if (unauthorizedGet.status === 401) {
      console.log(
        "PASS: Unauthenticated user blocked from IOC details"
      );
    } else {
      throw new Error(
        `Unauthenticated IOC details check failed: ${unauthorizedGet.status}`
      );
    }

    // --------------------------------------------------
    // 11. Viewer can list IOCs
    // --------------------------------------------------

    const viewerList = await request("/api/iocs", {
      headers: {
        Authorization: `Bearer ${viewerToken}`,
      },
    });

    if (viewerList.status === 200) {
      console.log(
        "PASS: Viewer can list IOCs"
      );
    } else {
      throw new Error(
        `Viewer IOC list access failed: ${viewerList.status}`
      );
    }

    // --------------------------------------------------
    // 12. Viewer can view IOC details
    // --------------------------------------------------

    const viewerGet = await request(
      `/api/iocs/${testIOCId}`,
      {
        headers: {
          Authorization: `Bearer ${viewerToken}`,
        },
      }
    );

    if (
      viewerGet.status === 200 &&
      viewerGet.data.data?._id
    ) {
      console.log(
        "PASS: Viewer can view IOC details"
      );
    } else {
      throw new Error(
        `Viewer IOC details access failed: ${viewerGet.status}`
      );
    }

    // --------------------------------------------------
    // 13. Analyst cannot delete IOC
    // --------------------------------------------------

    const analystDelete = await request(
      `/api/iocs/${testIOCId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${analystToken}`,
        },
      }
    );

    if (analystDelete.status === 403) {
      console.log(
        "PASS: Analyst blocked from IOC deletion"
      );
    } else {
      throw new Error(
        `Analyst deletion authorization failed: ${analystDelete.status}`
      );
    }

    // --------------------------------------------------
    // 14. Create temporary admin user
    // --------------------------------------------------

    const adminPasswordHash = await hashPassword(
      "AdminPassword123"
    );

    await User.create({
      username: adminUsername,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
    });

    // --------------------------------------------------
    // 15. Admin login returns JWT
    // --------------------------------------------------

    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: adminUsername,
        password: "AdminPassword123",
      }),
    });

    if (
      adminLogin.status === 200 &&
      adminLogin.data.token
    ) {
      console.log("PASS: Admin login returns JWT");
    } else {
      throw new Error("Admin login failed");
    }

    const adminToken = adminLogin.data.token;

    // --------------------------------------------------
    // 16. Admin can delete IOC
    // --------------------------------------------------

    const adminDelete = await request(
      `/api/iocs/${testIOCId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    if (adminDelete.status === 200) {
      console.log("PASS: Admin can delete IOC");
      testIOCId = null;
    } else {
      throw new Error(
        `Admin IOC deletion failed: ${adminDelete.status}`
      );
    }

    console.log(
      "\nAPI SECURITY REGRESSION TEST COMPLETED"
    );
  } finally {
    // --------------------------------------------------
    // Cleanup
    // --------------------------------------------------

    await User.deleteOne({
      email: viewerEmail,
    });

    await User.deleteOne({
      email: analystEmail,
    });

    await User.deleteOne({
      email: adminEmail,
    });

    if (testIOCId) {
      await IOC.deleteOne({
        _id: testIOCId,
      });
    }

    await IOC.deleteOne({
      normalizedValue: "198.51.100.25",
      type: "ipv4",
    });

    await mongoose.disconnect();

    testServer.close();
  }
};

runTest().catch((error) => {
  console.error(
    "API SECURITY TEST FAILED:",
    error
  );

  mongoose
    .disconnect()
    .finally(() => {
      testServer.close();
      process.exit(1);
    });
});