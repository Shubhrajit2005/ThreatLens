import env from "../src/config/env.js";
import mongoose from "mongoose";
import app from "../src/app.js";

const PORT = 5051;

const testServer = app.listen(PORT, () => {
  console.log(`Rate limit test API running on port ${PORT}`);
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
  console.log("\n--- Rate Limiter Test Started ---");

  try {
    // Connect to MongoDB before testing the API.
    await mongoose.connect(env.mongoUri);

    console.log("MongoDB connected for rate limit test");

    let rateLimited = false;

    // The authentication rate limiter allows 10 requests
    // within a 15-minute window.
    for (let i = 1; i <= 11; i++) {
      const response = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: `rateLimitTest${Date.now()}${i}`,
          password: "WrongPassword123",
        }),
      });

      console.log(
        `Request ${i}: HTTP ${response.status}`
      );

      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }

    if (rateLimited) {
      console.log(
        "PASS: Authentication rate limiter blocks excessive requests"
      );
    } else {
      throw new Error(
        "Authentication rate limiter did not return HTTP 429"
      );
    }

    console.log(
      "\nRATE LIMITER TEST COMPLETED"
    );
  } finally {
    await mongoose.disconnect();
    testServer.close();
  }
};

runTest().catch((error) => {
  console.error(
    "RATE LIMITER TEST FAILED:",
    error
  );

  mongoose
    .disconnect()
    .finally(() => {
      testServer.close();
      process.exit(1);
    });
});

