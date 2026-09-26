import env from "../src/config/env.js";
import mongoose from "mongoose";
import app from "../src/app.js";

const PORT = 5052;

const testServer = app.listen(PORT, () => {
  console.log(`API rate limit test running on port ${PORT}`);
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
  console.log("\n--- API Rate Limiter Test Started ---");

  try {
    await mongoose.connect(env.mongoUri);

    console.log("MongoDB connected for API rate limit test");

    let rateLimited = false;

    // apiRateLimiter allows 100 requests per 15 minutes.
    for (let i = 1; i <= 101; i++) {
      const response = await request("/api/iocs");

      if (i <= 3 || i >= 99) {
        console.log(
          `Request ${i}: HTTP ${response.status}`
        );
      }

      if (response.status === 429) {
        console.log(
          `Request ${i}: HTTP 429`
        );

        rateLimited = true;
        break;
      }
    }

    if (rateLimited) {
      console.log(
        "PASS: General API rate limiter blocks excessive requests"
      );
    } else {
      throw new Error(
        "General API rate limiter did not return HTTP 429"
      );
    }

    console.log(
      "\nAPI RATE LIMITER TEST COMPLETED"
    );
  } finally {
    await mongoose.disconnect();
    testServer.close();
  }
};

runTest().catch((error) => {
  console.error(
    "API RATE LIMITER TEST FAILED:",
    error
  );

  mongoose
    .disconnect()
    .finally(() => {
      testServer.close();
      process.exit(1);
    });
});
